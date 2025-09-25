"""
语音生成工具 - 使用Fish Audio SDK生成语音
"""

import os
import tempfile
import time
from dotenv import load_dotenv
from utils.minio_client import get_minio_client
import logging

# 加载环境变量
load_dotenv()

logger = logging.getLogger(__name__)

class VoiceGenerator:
    """语音生成器"""
    
    def __init__(self):
        self.api_key = os.getenv('FISH_AUDIO_TTS_KEY')
        self.minio_client = get_minio_client()
        
        if not self.api_key:
            logger.warning("未设置FISH_AUDIO_TTS_KEY环境变量")
        
        # 延迟导入，避免在没有安装fish-audio-sdk时出错
        self.fish_model = None
    
    def _init_fish_model(self):
        """初始化Fish Audio模型"""
        if self.fish_model is None:
            try:
                from voice.fish import FishVoiceModel
                self.fish_model = FishVoiceModel(api_key=self.api_key)
                logger.info("✅ Fish Audio模型初始化成功")
            except ImportError:
                logger.error("❌ 未安装fish-audio-sdk，请安装: pip install fish-audio-sdk")
                raise
            except Exception as e:
                logger.error(f"❌ Fish Audio模型初始化失败: {e}")
                raise
    
    def generate_voice(self, text, character_id=None, voice="default", model_id=None):
        """
        生成语音文件
        
        Args:
            text: 要转换为语音的文本
            character_id: 角色ID，用于生成文件名
            voice: 语音类型
            model_id: 自定义语音模型ID
        
        Returns:
            dict: 包含语音文件路径和URL的信息
        """
        if not self.api_key:
            logger.error("❌ 未设置FISH_AUDIO_TTS_KEY环境变量")
            return None
        
        try:
            self._init_fish_model()
            
            # 生成语音数据
            logger.info(f"开始生成语音 - 文本长度: {len(text)}")
            audio_data = self.fish_model.tts(text, voice=voice, model_id=model_id)
            
            # 保存到临时文件
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            logger.info(f"✅ 语音生成成功 - 临时文件: {temp_file_path}")
            
            # 上传到MinIO
            timestamp = int(time.time())
            object_name = self._generate_object_name(character_id, timestamp)
            
            file_url = self.minio_client.upload_voice_file(
                file_path=temp_file_path,
                character_id=character_id,
                timestamp=timestamp,
                object_name=object_name
            )
            
            # 清理临时文件
            try:
                os.unlink(temp_file_path)
            except:
                pass
            
            if file_url:
                logger.info(f"✅ 语音文件上传成功: {file_url}")
                return {
                    "file_url": file_url,
                    "object_name": object_name,
                    "text": text,
                    "character_id": character_id,
                    "timestamp": timestamp
                }
            else:
                logger.error("❌ 语音文件上传失败")
                return None
                
        except Exception as e:
            logger.error(f"❌ 语音生成失败: {e}")
            return None
    
    def _generate_object_name(self, character_id, timestamp):
        """生成MinIO对象名称"""
        from datetime import datetime
        date_str = datetime.fromtimestamp(timestamp).strftime('%Y%m%d_%H%M%S')
        
        if character_id:
            return f"voices/character_{character_id}/{date_str}.wav"
        else:
            return f"voices/system/{date_str}.wav"
    
    def generate_voice_for_postcard(self, postcard_content, character_id, conversation_id, voice_id=None, voice_url=None):
        """
        为明信片生成语音
        
        Args:
            postcard_content: 明信片内容
            character_id: 角色ID
            conversation_id: 会话ID
            voice_id: 语音模型ID（如果存在）
            voice_url: 语音URL（用于训练自定义模型）
        
        Returns:
            dict: 语音文件信息
        """
        logger.info(f"为明信片生成语音 - 会话: {conversation_id}, 角色: {character_id}, voice_id: {voice_id}")
        
        # 清理文本，移除可能影响TTS的字符
        clean_text = self._clean_text_for_tts(postcard_content)
        
        # 如果有voice_id，直接使用voice_id生成语音
        if voice_id:
            return self.generate_voice(clean_text, character_id, model_id=voice_id)
        
        # 如果没有voice_id但有voice_url，先训练自定义模型
        elif voice_url:
            try:
                # 训练自定义语音模型
                new_voice_id = self.train_custom_voice_from_url(voice_url, character_id, conversation_id)
                if new_voice_id:
                    # 使用新训练的模型生成语音
                    result = self.generate_voice(clean_text, character_id, model_id=new_voice_id)
                    if result:
                        result["new_voice_id"] = new_voice_id
                    return result
                else:
                    # 训练失败，使用默认语音
                    logger.warning("自定义语音模型训练失败，使用默认语音")
                    return self.generate_voice(clean_text, character_id)
            except Exception as e:
                logger.error(f"自定义语音模型训练失败: {e}")
                # 训练失败，使用默认语音
                return self.generate_voice(clean_text, character_id)
        
        # 如果既没有voice_id也没有voice_url，使用默认语音
        else:
            return self.generate_voice(clean_text, character_id)
    
    def train_custom_voice_from_url(self, voice_url, character_id, conversation_id):
        """
        从语音URL训练自定义语音模型
        
        Args:
            voice_url: 语音文件URL
            character_id: 角色ID
            conversation_id: 会话ID
        
        Returns:
            str: 训练后的语音模型ID
        """
        try:
            self._init_fish_model()
            
            # 下载语音文件
            import tempfile
            import requests
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                response = requests.get(voice_url)
                if response.status_code == 200:
                    temp_file.write(response.content)
                    temp_file_path = temp_file.name
                else:
                    logger.error(f"下载语音文件失败: {response.status_code}")
                    return None
            
            # 训练自定义语音模型
            model_id = self.fish_model.train_custom_voice(
                title=f"character_{character_id}_voice",
                description=f"Custom voice for character {character_id}",
                voice_files=[temp_file_path],
                texts=["这是一个测试文本，用于训练自定义语音模型。"],
                visibility="private"
            )
            
            # 清理临时文件
            try:
                os.unlink(temp_file_path)
            except:
                pass
            
            logger.info(f"自定义语音模型训练成功 - model_id: {model_id}")
            return model_id
            
        except Exception as e:
            logger.error(f"自定义语音模型训练失败: {e}")
            return None
    
    def generate_voice_with_new_model(self, text, character_id, new_voice_id):
        """
        使用新训练的语音模型生成语音
        
        Args:
            text: 要转换为语音的文本
            character_id: 角色ID
            new_voice_id: 新训练的语音模型ID
        
        Returns:
            dict: 包含语音文件路径和URL的信息，以及new_voice_id
        """
        result = self.generate_voice(text, character_id, model_id=new_voice_id)
        if result:
            result["new_voice_id"] = new_voice_id
        return result
    
    def _clean_text_for_tts(self, text):
        """清理文本，使其更适合TTS"""
        # 移除多余的换行和空格
        clean_text = ' '.join(text.split())
        
        # 移除可能影响TTS的特殊字符
        import re
        clean_text = re.sub(r'[^\w\s\u4e00-\u9fff，。！？：；""（）【】《》]', '', clean_text)
        
        # 限制文本长度，避免TTS超时
        if len(clean_text) > 500:
            clean_text = clean_text[:500] + "..."
        
        return clean_text

# 全局语音生成器实例
voice_generator = VoiceGenerator()

def get_voice_generator():
    """获取语音生成器实例"""
    return voice_generator

if __name__ == "__main__":
    # 测试语音生成
    try:
        generator = VoiceGenerator()
        test_text = "你好，这是一个测试语音生成功能的示例。"
        
        result = generator.generate_voice(test_text, character_id=1)
        if result:
            print(f"✅ 语音生成测试成功: {result['file_url']}")
        else:
            print("❌ 语音生成测试失败")
            
    except Exception as e:
        print(f"❌ 语音生成测试异常: {e}")
