import pika
import json
import os
from dotenv import load_dotenv
import logging
import threading

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

class MQClient:
    """RabbitMQ消息队列客户端"""
    
    def __init__(self):
        self.connection = None
        self.channel = None
        self.is_connected = False
        self.connect()
    
    def connect(self):
        """连接到RabbitMQ服务器"""
        try:
            credentials = pika.PlainCredentials(
                os.getenv('RABBITMQ_USER', 'guest'),
                os.getenv('RABBITMQ_PASSWORD', 'guest')
            )
            
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=os.getenv('RABBITMQ_HOST', 'localhost'),
                    port=int(os.getenv('RABBITMQ_PORT', '5672')),
                    credentials=credentials,
                    heartbeat=600,
                    blocked_connection_timeout=300
                )
            )
            
            self.channel = self.connection.channel()
            self.is_connected = True
            
            # 声明队列
            queue_name = os.getenv('RABBITMQ_QUEUE', 'ai_reply_queue')
            self.channel.queue_declare(queue=queue_name, durable=True)
            
            logger.info("✅ 成功连接到RabbitMQ消息队列")
            
        except Exception as e:
            logger.error(f"❌ 连接RabbitMQ失败: {e}")
            self.is_connected = False
            raise
    
    def publish_message(self, message, queue_name=None):
        """发布消息到队列"""
        if not self.is_connected:
            self.connect()
        
        try:
            queue = queue_name or os.getenv('RABBITMQ_QUEUE', 'ai_reply_queue')
            
            # 确保消息是JSON格式
            if isinstance(message, dict):
                message_body = json.dumps(message, ensure_ascii=False)
            else:
                message_body = str(message)
            
            self.channel.basic_publish(
                exchange='',
                routing_key=queue,
                body=message_body,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # 使消息持久化
                    content_type='application/json'
                )
            )
            
            logger.info(f"✅ 消息已发布到队列 '{queue}': {message_body[:100]}...")
            return True
            
        except Exception as e:
            logger.error(f"❌ 发布消息失败: {e}")
            self.is_connected = False
            return False
    
    def consume_messages(self, queue_name=None, callback=None, auto_ack=False):
        """消费队列中的消息"""
        if not self.is_connected:
            self.connect()
        
        try:
            queue = queue_name or os.getenv('RABBITMQ_QUEUE', 'ai_reply_queue')
            
            def default_callback(ch, method, properties, body):
                """默认回调函数"""
                try:
                    message = json.loads(body.decode('utf-8'))
                    logger.info(f"📨 收到消息: {message}")
                except json.JSONDecodeError:
                    logger.info(f"📨 收到消息: {body.decode('utf-8')}")
                
                if not auto_ack:
                    ch.basic_ack(delivery_tag=method.delivery_tag)
            
            # 设置回调函数
            consumer_callback = callback or default_callback
            
            # 开始消费消息
            self.channel.basic_consume(
                queue=queue,
                on_message_callback=consumer_callback,
                auto_ack=auto_ack
            )
            
            logger.info(f"🔄 开始监听队列 '{queue}'...")
            self.channel.start_consuming()
            
        except Exception as e:
            logger.error(f"❌ 消费消息失败: {e}")
            self.is_connected = False
            raise
    
    def start_async_consumer(self, queue_name=None, callback=None):
        """启动异步消息消费者"""
        def consumer_thread():
            try:
                self.consume_messages(queue_name, callback)
            except Exception as e:
                logger.error(f"❌ 异步消费者线程异常: {e}")
        
        thread = threading.Thread(target=consumer_thread, daemon=True)
        thread.start()
        logger.info("✅ 异步消息消费者已启动")
        return thread
    
    def send_ai_reply(self, user_id, character_id, message, reply_content):
        """发送AI回复消息"""
        message_data = {
            "type": "ai_reply",
            "user_id": user_id,
            "character_id": character_id,
            "original_message": message,
            "reply_content": reply_content,
            "timestamp": os.times().system
        }
        
        return self.publish_message(message_data)
    
    def send_system_notification(self, title, content, user_id=None):
        """发送系统通知消息"""
        notification_data = {
            "type": "system_notification",
            "title": title,
            "content": content,
            "user_id": user_id,
            "timestamp": os.times().system
        }
        
        return self.publish_message(notification_data)
    
    def close(self):
        """关闭连接"""
        if self.connection and self.connection.is_open:
            self.connection.close()
            self.is_connected = False
            logger.info("✅ RabbitMQ连接已关闭")

# 全局MQ客户端实例
mq_client = MQClient()

def get_mq_client():
    """获取MQ客户端实例"""
    return mq_client

if __name__ == "__main__":
    # 测试MQ连接和消息发送
    try:
        mq = MQClient()
        
        # 测试发送消息
        test_message = {
            "type": "test",
            "message": "这是一条测试消息",
            "timestamp": os.times().system
        }
        
        if mq.publish_message(test_message):
            print("✅ 测试消息发送成功")
        
        # 测试发送AI回复消息
        if mq.send_ai_reply(1, 1, "你好", "你好！我是AI助手"):
            print("✅ AI回复消息发送成功")
        
        mq.close()
        
    except Exception as e:
        print(f"测试失败: {e}")
