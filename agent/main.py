import os
import time
from dotenv import load_dotenv
from utils.database import get_db_manager
from utils.mq_client import get_mq_client
from utils.role_manager import get_role_manager
from utils.message_processor import get_message_processor
import logging

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_database_connection():
    """测试数据库连接"""
    try:
        db = get_db_manager()
        
        # 获取用户数量
        users_count = db.execute_query("SELECT COUNT(*) as count FROM users")[0]['count']
        characters_count = db.execute_query("SELECT COUNT(*) as count FROM characters")[0]['count']
        
        logger.info(f"📊 数据库连接测试成功")
        logger.info(f"👥 用户数量: {users_count}")
        logger.info(f"🎭 角色数量: {characters_count}")
        
        # 测试角色查询功能
        if characters_count > 0:
            role_manager = get_role_manager()
            characters = role_manager.list_all_characters()
            logger.info("📋 可用角色列表:")
            for char in characters:
                logger.info(f"  - ID: {char['id']}, 名称: {char['name']}")
        
        return True
    except Exception as e:
        logger.error(f"❌ 数据库连接测试失败: {e}")
        return False

def test_mq_connection():
    """测试消息队列连接"""
    try:
        mq = get_mq_client()
        
        # 只测试连接，不发送测试消息（避免被消息处理器处理）
        # 通过检查连接状态来测试
        if mq.connection and mq.connection.is_open:
            logger.info("✅ 消息队列连接测试成功")
            return True
        else:
            logger.error("❌ 消息队列连接测试失败")
            return False
            
    except Exception as e:
        logger.error(f"❌ 消息队列连接测试失败: {e}")
        return False

def test_role_play_functionality():
    """测试角色扮演功能（仅连接测试，不实际处理消息）"""
    try:
        role_manager = get_role_manager()
        
        # 测试获取角色信息
        characters = role_manager.list_all_characters()
        if not characters:
            logger.warning("⚠️ 数据库中没有角色数据，角色扮演功能可能无法正常工作")
            return True
        
        # 测试第一个角色的提示词生成（不实际调用LLM）
        test_char_id = characters[0]['id']
        role_prompt = role_manager.get_character_role_prompt(test_char_id)
        logger.info(f"🎭 角色 {test_char_id} 提示词生成成功")
        logger.debug(f"提示词预览: {role_prompt[:200]}...")
        
        # 只测试消息处理器初始化，不实际处理消息
        processor = get_message_processor()
        logger.info("✅ 角色扮演功能初始化测试成功")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 角色扮演功能测试失败: {e}")
        return False

def start_message_consumer():
    """启动消息消费者"""
    try:
        processor = get_message_processor()
        processor.start_message_consumer()
        logger.info("🔄 消息消费者已启动，开始监听消息队列...")
        return True
    except Exception as e:
        logger.error(f"❌ 启动消息消费者失败: {e}")
        return False

def main():
    """主函数 - 集成数据库角色扮演功能的AI助手"""
    logger.info("🚀 启动记忆明信片AI助手（角色扮演版）...")
    
    # 测试连接
    logger.info("🔍 测试系统连接...")
    db_ok = test_database_connection()
    mq_ok = test_mq_connection()
    
    if not db_ok or not mq_ok:
        logger.error("❌ 连接测试失败，程序退出")
        return
    
    logger.info("✅ 所有连接测试通过")
    
    # 启动消息消费者
    if not start_message_consumer():
        logger.error("❌ 无法启动消息消费者，程序退出")
        return
    
    logger.info("🎯 系统已就绪，等待处理消息...")
    logger.info("💡 系统支持的功能:")
    logger.info("  - 基于数据库角色的智能对话")
    logger.info("  - 消息队列实时处理")
    logger.info("  - 对话记录保存")
    logger.info("  - 角色个性化回复")
    
    try:
        # 保持程序运行，等待消息
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
