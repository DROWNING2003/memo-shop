"""
消息队列处理器 - 处理包含角色信息的消息
"""

import json
import logging
from .call_llm import call_llm
from .role_manager import get_role_manager
from .mq_client import get_mq_client
from .database import get_db_manager

logger = logging.getLogger(__name__)

class MessageProcessor:
    """消息处理器，处理来自消息队列的角色相关消息"""
    
    def __init__(self):
        self.role_manager = get_role_manager()
        self.mq_client = get_mq_client()
        self.db = get_db_manager()
    
    def process_ai_reply_message(self, message_data):
        """
        处理AI回复消息
        
        Args:
            message_data: 消息数据字典，包含：
                - conversation_id: 会话ID
                - user_id: 用户ID
                - character_id: 角色ID
                - user_message: 用户消息
        
        Returns:
            处理结果（成功/失败）
        """
        try:
            # 验证必要字段
            required_fields = ['conversation_id', 'user_id', 'character_id', 'user_message']
            for field in required_fields:
                if field not in message_data:
                    logger.error(f"消息缺少必要字段: {field}")
                    return False
            
            conversation_id = message_data['conversation_id']
            user_id = message_data['user_id']
            character_id = message_data['character_id']
            user_message = message_data['user_message']
            
            logger.info(f"处理AI回复消息 - 会话: {conversation_id}, 用户: {user_id}, 角色: {character_id}")
            
            # 获取角色信息
            character_info = self.role_manager.get_character_info(character_id)
            if not character_info:
                logger.error(f"角色ID {character_id} 不存在")
                return False
            
            # 调用LLM生成回复（使用数据库角色信息）
            ai_reply = call_llm(
                prompt=user_message,
                character_id=character_id,
                temperature=0.7,
                max_tokens=1000
            )
            
            # 直接将回复保存到数据库（Postcard表）
            success = self._save_postcard_to_db(conversation_id, user_id, character_id, ai_reply)
            if success:
                logger.info(f"AI回复已保存到数据库 - 会话: {conversation_id}, 角色: {character_info.get('name')}")
            else:
                logger.error(f"保存AI回复到数据库失败 - 会话: {conversation_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"处理AI回复消息失败: {e}")
            return False
    
    def process_system_message(self, message_data):
        """
        处理系统消息
        
        Args:
            message_data: 系统消息数据
        
        Returns:
            处理结果
        """
        try:
            message_type = message_data.get('type', 'unknown')
            
            if message_type == 'character_update':
                # 处理角色更新消息
                return self._process_character_update(message_data)
            elif message_type == 'user_activity':
                # 处理用户活动消息
                return self._process_user_activity(message_data)
            else:
                logger.warning(f"未知的系统消息类型: {message_type}")
                return False
                
        except Exception as e:
            logger.error(f"处理系统消息失败: {e}")
            return False
    
    def _process_character_update(self, message_data):
        """处理角色更新消息"""
        character_id = message_data.get('character_id')
        if not character_id:
            logger.error("角色更新消息缺少character_id")
            return False
        
        logger.info(f"处理角色更新 - 角色ID: {character_id}")
        # 这里可以添加角色缓存更新逻辑
        return True
    
    def _process_user_activity(self, message_data):
        """处理用户活动消息"""
        user_id = message_data.get('user_id')
        activity_type = message_data.get('activity_type')
        
        logger.info(f"处理用户活动 - 用户ID: {user_id}, 活动类型: {activity_type}")
        # 这里可以添加用户活动处理逻辑
        return True
    
    def _save_postcard_to_db(self, conversation_id, user_id, character_id, content):
        """
        保存明信片到数据库
        
        Args:
            conversation_id: 会话ID
            user_id: 用户ID
            character_id: 角色ID
            content: 明信片内容
        
        Returns:
            保存结果（成功/失败）
        """
        try:
            # 使用数据库的NOW()函数，它会使用数据库服务器的时区
            # 根据Go模型，type字段为枚举('user','ai')，AI回复应该使用'ai'
            query = """
            INSERT INTO postcards 
            (conversation_id, user_id, character_id, type, content, status, created_at, updated_at)
            VALUES (%s, %s, %s, 'ai', %s, 'sent', NOW(), NOW())
            """
            
            self.db.execute_update(query, (conversation_id, user_id, character_id, content))
            logger.debug(f"明信片已保存到数据库 - 会话: {conversation_id}, 类型: ai")
            return True
            
        except Exception as e:
            logger.error(f"保存明信片到数据库失败: {e}")
            return False
    
    def _is_go_format_message(self, message):
        """
        检查是否为Go格式的消息
        
        Args:
            message: 消息数据
            
        Returns:
            是否为Go格式的消息
        """
        # Go格式的消息包含这些字段，但没有type字段
        required_fields = ['conversation_id', 'user_id', 'character_id', 'user_message']
        return all(field in message for field in required_fields)
    
    def _get_timestamp(self):
        """获取当前时间戳"""
        import time
        return int(time.time())
    
    def start_message_consumer(self):
        """启动消息消费者"""
        def message_callback(ch, method, properties, body):
            try:
                message = json.loads(body.decode('utf-8'))
                
                # 记录接收到的消息信息
                conversation_id = message.get('conversation_id', 'unknown')
                logger.debug(f"收到消息 - 会话ID: {conversation_id}")
                
                # 直接按照Go格式处理消息（不需要type字段）
                # 检查是否包含Go格式的必要字段
                if self._is_go_format_message(message):
                    logger.info(f"处理Go格式消息 - 会话: {conversation_id}")
                    self.process_ai_reply_message(message)
                else:
                    logger.warning(f"消息格式不正确，缺少必要字段: {message}")
                
                # 确认消息处理完成
                ch.basic_ack(delivery_tag=method.delivery_tag)
                
            except json.JSONDecodeError:
                logger.error("消息格式错误，无法解析JSON")
                # 即使解析失败也要确认消息，避免阻塞队列
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                logger.error(f"处理消息时发生错误: {e}")
                # 发生错误也要确认消息，避免阻塞队列
                ch.basic_ack(delivery_tag=method.delivery_tag)
        
        # 启动异步消费者
        self.mq_client.start_async_consumer(callback=message_callback)

# 全局消息处理器实例
message_processor = MessageProcessor()

def get_message_processor():
    """获取消息处理器实例"""
    return message_processor

if __name__ == "__main__":
    # 测试消息处理器
    processor = MessageProcessor()
    
    # 测试处理AI回复消息
    test_message = {
        "type": "ai_reply_request",
        "conversation_id": "test-conversation-123",
        "user_id": 1,
        "character_id": 1,
        "user_message": "你好，请帮我写一张生日祝福明信片"
    }
    
    result = processor.process_ai_reply_message(test_message)
    print(f"消息处理结果: {'成功' if result else '失败'}")
