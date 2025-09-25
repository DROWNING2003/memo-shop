import os
import time
import json
from dotenv import load_dotenv
from utils.database import get_db_manager
from utils.mq_client import get_mq_client
from utils.role_manager import get_role_manager
from postcard_flow import process_mq_message_with_flow
import logging

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PocketFlowMessageProcessor:
    """使用PocketFlow流程处理消息的处理器"""
    
    def __init__(self):
        self.mq_client = get_mq_client()
    
    def message_callback(self, ch, method, properties, body):
        """消息回调函数，使用PocketFlow流程处理消息"""
        try:
            message = json.loads(body.decode('utf-8'))
            
            # 记录接收到的消息信息
            conversation_id = message.get('conversation_id', 'unknown')
            logger.info(f"📨 收到MQ消息 - 会话ID: {conversation_id}")
            
            # 验证Go格式的消息字段
            required_fields = ['conversation_id', 'user_id', 'character_id', 'user_message']
            if not all(field in message for field in required_fields):
                logger.error(f"❌ MQ消息格式不正确，缺少必要字段: {message}")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
            
            # 使用PocketFlow流程处理消息
            logger.info(f"🔄 使用PocketFlow流程处理消息 - 会话: {conversation_id}")
            result = process_mq_message_with_flow(message)
            
            if result["success"]:
                logger.info(f"✅ 明信片生成成功 - 会话: {conversation_id}")
            else:
                logger.error(f"❌ 明信片生成失败 - 会话: {conversation_id}")
                if "error" in result:
                    logger.error(f"错误信息: {result['error']}")
            
            # 确认消息处理完成
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except json.JSONDecodeError:
            logger.error("❌ 消息格式错误，无法解析JSON")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            logger.error(f"❌ 处理消息时发生错误: {e}")
            ch.basic_ack(delivery_tag=method.delivery_tag)
    
    def start_message_consumer(self):
        """启动消息消费者"""
        try:
            self.mq_client.start_async_consumer(callback=self.message_callback)
            logger.info("🔄 PocketFlow消息消费者已启动，开始监听消息队列...")
            return True
        except Exception as e:
            logger.error(f"❌ 启动PocketFlow消息消费者失败: {e}")
            return False


def start_pocketflow_message_consumer():
    """启动PocketFlow消息消费者"""
    try:
        processor = PocketFlowMessageProcessor()
        processor.start_message_consumer()
        return True
    except Exception as e:
        logger.error(f"❌ 启动PocketFlow消息消费者失败: {e}")
        return False

def main():
    """主函数 - 使用PocketFlow流程的记忆明信片AI助手"""
    logger.info("🚀 启动记忆明信片AI助手（PocketFlow版）...")

    # 启动PocketFlow消息消费者
    if not start_pocketflow_message_consumer():
        logger.error("❌ 无法启动PocketFlow消息消费者，程序退出")
        return
    
    try:
        # 保持程序运行，等待消息
        logger.info("✅ 系统已启动，等待MQ消息...")
        while True:
            time.sleep(10)
            logger.debug("系统运行中...")
            
    except KeyboardInterrupt:
        logger.info("👋 收到中断信号，程序退出")
    except Exception as e:
        logger.error(f"❌ 程序运行出错: {e}")
    finally:
        # 清理资源
        db = get_db_manager()
        mq = get_mq_client()
        db.close()
        mq.close()
        logger.info("✅ 资源清理完成")

if __name__ == "__main__":
    main()
