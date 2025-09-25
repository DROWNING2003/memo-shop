from pocketflow import Node
from utils.call_llm import call_llm
from utils.role_manager import get_role_manager
from utils.database import get_db_manager
from utils.voice_generator import get_voice_generator
import logging

logger = logging.getLogger(__name__)

class MQPostcardGenerationNode(Node):
    """
    消息队列明信片生成节点 - 基于MQ消息生成明信片
    对应 utils/message_processor.py 中的 process_ai_reply_message 功能
    """
    
    def __init__(self, max_retries=3, wait=5):
        super().__init__(max_retries=max_retries, wait=wait)
        self.role_manager = get_role_manager()
        self.db = get_db_manager()
    
    def prep(self, shared):
        """准备数据：从MQ消息中读取必要字段"""
        # 从共享存储中读取MQ消息数据
        message_data = shared.get("mq_message", {})
        
        # 验证必要字段
        required_fields = ['conversation_id', 'user_id', 'character_id', 'user_message']
        for field in required_fields:
            if field not in message_data:
                logger.error(f"MQ消息缺少必要字段: {field}")
                return None
        
        conversation_id = message_data['conversation_id']
        user_id = message_data['user_id']
        character_id = message_data['character_id']
        user_message = message_data['user_message']
        
        logger.info(f"准备生成明信片 - 会话: {conversation_id}, 用户: {user_id}, 角色: {character_id}")
        
        return {
            "user_message": user_message,
            "character_id": character_id,
            "conversation_id": conversation_id,
            "user_id": user_id
        }
    
    def exec(self, message_data):
        """执行明信片生成：调用LLM生成明信片内容"""
        if not message_data:
            return None
        
        user_message = message_data["user_message"]
        character_id = message_data["character_id"]
        
        try:
            # 验证角色是否存在
            character_info = self.role_manager.get_character_info(character_id)
            if not character_info:
                logger.error(f"角色ID {character_id} 不存在")
                raise Exception(f"角色ID {character_id} 不存在")
            
            # 调用LLM生成明信片内容
            postcard_content = call_llm(
                prompt=user_message,
                character_id=character_id,
                temperature=0.7,
                max_tokens=1000
            )
            
            logger.info(f"明信片生成成功 - 角色: {character_info.get('name', character_id)}")
            return {
                "content": postcard_content,
                "conversation_id": message_data["conversation_id"],
                "user_id": message_data["user_id"],
                "character_id": character_id
            }
            
        except Exception as e:
            logger.error(f"明信片生成失败: {e}")
            raise e
    
    def exec_fallback(self, message_data, exc):
        """处理生成失败的情况"""
        logger.warning(f"明信片生成失败，使用备用回复: {exc}")
        
        # 返回一个基本的错误回复
        return {
            "content": "抱歉，我暂时无法生成明信片。请稍后再试。",
            "conversation_id": message_data["conversation_id"] if message_data else "unknown",
            "user_id": message_data["user_id"] if message_data else 0,
            "character_id": message_data["character_id"] if message_data else None
        }
    
    def post(self, shared, prep_res, exec_res):
        """后处理：保存明信片内容到共享存储"""
        if exec_res:
            shared["postcard_data"] = exec_res
            logger.info("明信片数据已保存到共享存储")
        else:
            logger.warning("明信片生成结果为空")
        
        return "default"

class MQPostcardSaveNode(Node):
    """
    消息队列明信片保存节点 - 将生成的明信片保存到数据库
    对应 utils/message_processor.py 中的 _save_postcard_to_db 功能
    """
    
    def __init__(self, max_retries=2, wait=3):
        super().__init__(max_retries=max_retries, wait=wait)
        self.db = get_db_manager()
    
    def prep(self, shared):
        """准备数据：读取明信片数据"""
        postcard_data = shared.get("postcard_data")
        
        if not postcard_data:
            logger.warning("明信片数据为空")
            return None
        
        return postcard_data
    
    def exec(self, postcard_data):
        """执行保存操作：将明信片保存到数据库"""
        if not postcard_data:
            return False
        
        try:
            content = postcard_data["content"]
            conversation_id = postcard_data["conversation_id"]
            user_id = postcard_data["user_id"]
            character_id = postcard_data["character_id"]
            
            # 保存到数据库
            query = """
            INSERT INTO postcards 
            (conversation_id, user_id, character_id, type, content, status, created_at, updated_at)
            VALUES (%s, %s, %s, 'ai', %s, 'sent', NOW(), NOW())
            """
            
            self.db.execute_update(query, (conversation_id, user_id, character_id, content))
            logger.info(f"明信片已保存到数据库 - 会话: {conversation_id}")
            return True
            
        except Exception as e:
            logger.error(f"保存明信片到数据库失败: {e}")
            raise e
    
    def exec_fallback(self, postcard_data, exc):
        """处理保存失败的情况"""
        logger.warning(f"明信片保存失败: {exc}")
        return False
    
    def post(self, shared, prep_res, exec_res):
        """后处理：更新保存状态"""
        if exec_res:
            shared["postcard_saved"] = True
            logger.info("明信片保存成功")
        else:
            shared["postcard_saved"] = False
            logger.warning("明信片保存失败")
        
        return "default"

class MQVoiceGenerationNode(Node):
    """
    语音生成节点 - 为明信片内容生成语音并保存到MinIO
    根据voice_id和voice_url的逻辑：
    1. 如果有voice_id，直接使用voice_id生成语音
    2. 如果没有voice_id但有voice_url，先合成声音模型，存入数据库得到voice_id，然后使用voice_id生成语音
    """
    
    def __init__(self, max_retries=3, wait=5):
        super().__init__(max_retries=max_retries, wait=wait)
        self.voice_generator = get_voice_generator()
        self.db = get_db_manager()
    
    def prep(self, shared):
        """准备数据：读取明信片数据和角色语音信息"""
        postcard_data = shared.get("postcard_data")
        
        if not postcard_data:
            logger.warning("明信片数据为空，无法生成语音")
            return None
        
        conversation_id = postcard_data.get("conversation_id")
        character_id = postcard_data.get("character_id")
        content = postcard_data.get("content")
        
        if not all([conversation_id, character_id, content]):
            logger.warning("明信片数据不完整，无法生成语音")
            return None
        
        # 查询角色信息，获取voice_id和voice_url
        character_info = self._get_character_voice_info(character_id)
        
        logger.info(f"准备生成语音 - 会话: {conversation_id}, 角色: {character_id}, voice_id: {character_info.get('voice_id')}")
        
        return {
            "content": content,
            "character_id": character_id,
            "conversation_id": conversation_id,
            "voice_id": character_info.get("voice_id"),
            "voice_url": character_info.get("voice_url")
        }
    
    def _get_character_voice_info(self, character_id):
        """获取角色的语音信息"""
        try:
            query = "SELECT voice_id, voice_url FROM characters WHERE id = %s AND deleted_at IS NULL"
            result = self.db.execute_query(query, (character_id,))
            
            if result:
                return result[0]
            else:
                return {"voice_id": None, "voice_url": None}
                
        except Exception as e:
            logger.error(f"查询角色语音信息失败: {e}")
            return {"voice_id": None, "voice_url": None}
    
    def exec(self, voice_data):
        """执行语音生成：根据voice_id和voice_url逻辑生成语音"""
        if not voice_data:
            return None
        
        content = voice_data["content"]
        character_id = voice_data["character_id"]
        conversation_id = voice_data["conversation_id"]
        voice_id = voice_data["voice_id"]
        voice_url = voice_data["voice_url"]
        
        try:
            # 生成语音
            voice_result = self.voice_generator.generate_voice_for_postcard(
                postcard_content=content,
                character_id=character_id,
                conversation_id=conversation_id,
                voice_id=voice_id,
                voice_url=voice_url
            )
            
            if voice_result:
                logger.info(f"语音生成成功 - 会话: {conversation_id}, 使用的voice_id: {voice_id}")
                
                # 如果训练了新的语音模型，需要更新数据库
                if voice_result.get("new_voice_id") and not voice_id:
                    self._update_character_voice_id(character_id, voice_result["new_voice_id"])
                
                return {
                    "voice_url": voice_result["file_url"],
                    "object_name": voice_result["object_name"],
                    "conversation_id": conversation_id,
                    "character_id": character_id,
                    "voice_id": voice_result.get("new_voice_id", voice_id)
                }
            else:
                logger.error(f"语音生成失败 - 会话: {conversation_id}")
                return None
                
        except Exception as e:
            logger.error(f"语音生成失败: {e}")
            raise e
    
    def _update_character_voice_id(self, character_id, voice_id):
        """更新角色的voice_id"""
        try:
            query = "UPDATE characters SET voice_id = %s, updated_at = NOW() WHERE id = %s"
            affected_rows = self.db.execute_update(query, (voice_id, character_id))
            
            if affected_rows > 0:
                logger.info(f"角色语音模型ID更新成功 - 角色: {character_id}, voice_id: {voice_id}")
            else:
                logger.warning(f"角色语音模型ID更新失败 - 角色: {character_id}")
                
        except Exception as e:
            logger.error(f"更新角色语音模型ID失败: {e}")
    
    def exec_fallback(self, voice_data, exc):
        """处理语音生成失败的情况"""
        logger.warning(f"语音生成失败，使用备用处理: {exc}")
        
        if voice_data:
            return {
                "voice_url": None,
                "object_name": None,
                "conversation_id": voice_data["conversation_id"],
                "character_id": voice_data["character_id"],
                "voice_id": voice_data["voice_id"],
                "error": str(exc)
            }
        else:
            return None
    
    def post(self, shared, prep_res, exec_res):
        """后处理：保存语音信息到共享存储"""
        if exec_res:
            shared["voice_data"] = exec_res
            logger.info("语音数据已保存到共享存储")
        else:
            logger.warning("语音生成结果为空")
        
        return "default"

class MQPostcardVoiceUpdateNode(Node):
    """
    明信片语音更新节点 - 将语音URL更新到数据库中的明信片记录
    """
    
    def __init__(self, max_retries=2, wait=3):
        super().__init__(max_retries=max_retries, wait=wait)
        self.db = get_db_manager()
    
    def prep(self, shared):
        """准备数据：读取明信片和语音数据"""
        postcard_data = shared.get("postcard_data")
        voice_data = shared.get("voice_data")
        
        if not postcard_data or not voice_data:
            logger.warning("明信片数据或语音数据为空")
            return None
        
        conversation_id = postcard_data.get("conversation_id")
        voice_url = voice_data.get("voice_url")
        
        if not conversation_id:
            logger.warning("会话ID为空")
            return None
        
        logger.info(f"准备更新明信片语音 - 会话: {conversation_id}")
        
        return {
            "conversation_id": conversation_id,
            "voice_url": voice_url
        }
    
    def exec(self, update_data):
        """执行更新操作：将语音URL更新到数据库"""
        if not update_data:
            return False
        
        conversation_id = update_data["conversation_id"]
        voice_url = update_data["voice_url"]
        
        try:
            # 更新数据库中的明信片记录，添加语音URL
            query = """
            UPDATE postcards 
            SET voice_url = %s, updated_at = NOW()
            WHERE conversation_id = %s
            """
            
            affected_rows = self.db.execute_update(query, (voice_url, conversation_id))
            
            if affected_rows > 0:
                logger.info(f"明信片语音更新成功 - 会话: {conversation_id}")
                return True
            else:
                logger.warning(f"未找到对应的明信片记录 - 会话: {conversation_id}")
                return False
                
        except Exception as e:
            logger.error(f"明信片语音更新失败: {e}")
            raise e
    
    def exec_fallback(self, update_data, exc):
        """处理更新失败的情况"""
        logger.warning(f"明信片语音更新失败: {exc}")
        return False
    
    def post(self, shared, prep_res, exec_res):
        """后处理：更新语音保存状态"""
        if exec_res:
            shared["voice_updated"] = True
            logger.info("明信片语音更新成功")
        else:
            shared["voice_updated"] = False
            logger.warning("明信片语音更新失败")
        
        return "default"

class MQPostcardStatusUpdateNode(Node):
    """
    明信片状态更新节点 - 将明信片状态更新为'delivered'
    """
    
    def __init__(self, max_retries=2, wait=3):
        super().__init__(max_retries=max_retries, wait=wait)
        self.db = get_db_manager()
    
    def prep(self, shared):
        """准备数据：读取会话ID"""
        postcard_data = shared.get("postcard_data")
        
        if not postcard_data:
            logger.warning("明信片数据为空")
            return None
        
        conversation_id = postcard_data.get("conversation_id")
        if not conversation_id:
            logger.warning("会话ID为空")
            return None
        
        logger.info(f"准备更新明信片状态为delivered - 会话: {conversation_id}")
        return conversation_id
    
    def exec(self, conversation_id):
        """执行状态更新操作：将明信片状态改为delivered"""
        try:
            query = """
            UPDATE postcards 
            SET status = 'delivered', updated_at = NOW()
            WHERE conversation_id = %s AND status != 'delivered'
            """
            
            affected_rows = self.db.execute_update(query, (conversation_id,))
            
            if affected_rows > 0:
                logger.info(f"明信片状态更新成功 - 会话: {conversation_id}")
                return True
            else:
                logger.warning(f"未找到对应的明信片记录或状态已是delivered - 会话: {conversation_id}")
                return False
                
        except Exception as e:
            logger.error(f"明信片状态更新失败: {e}")
            raise e
    
    def exec_fallback(self, conversation_id, exc):
        """处理状态更新失败的情况"""
        logger.warning(f"明信片状态更新失败: {exc}")
        return False
    
    def post(self, shared, prep_res, exec_res):
        """后处理：更新状态保存状态"""
        if exec_res:
            shared["status_updated"] = True
            logger.info("明信片状态更新成功")
        else:
            shared["status_updated"] = False
            logger.warning("明信片状态更新失败")
        
        return "default"

class MQMessageProcessorNode(Node):
    """
    消息队列消息处理节点 - 处理MQ消息并启动明信片生成流程
    """
    
    def __init__(self, max_retries=2, wait=2):
        super().__init__(max_retries=max_retries, wait=wait)
    
    def prep(self, shared):
        """准备数据：读取MQ消息"""
        return shared.get("mq_message")
    
    def exec(self, mq_message):
        """验证MQ消息格式"""
        if not mq_message:
            logger.warning("MQ消息为空")
            return False
        
        # 验证Go格式的消息字段
        required_fields = ['conversation_id', 'user_id', 'character_id', 'user_message']
        if not all(field in mq_message for field in required_fields):
            logger.error("MQ消息格式不正确，缺少必要字段")
            return False
        
        logger.info(f"MQ消息验证成功 - 会话: {mq_message['conversation_id']}")
        return True
    
    def post(self, shared, prep_res, exec_res):
        """后处理：根据验证结果决定下一步"""
        if exec_res:
            logger.info("MQ消息验证通过，继续明信片生成流程")
            return "process_postcard"
        else:
            logger.error("MQ消息验证失败，停止流程")
            return "error"
