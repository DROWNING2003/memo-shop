import mysql.connector
import os
from dotenv import load_dotenv
import logging

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

class DatabaseManager:
    """MySQL数据库管理器"""
    
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """连接到MySQL数据库"""
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', '3306')),
                user=os.getenv('DB_USER', 'memo_shop_user'),
                password=os.getenv('DB_PASSWORD', 'memo_shop_password'),
                database=os.getenv('DB_NAME', 'memo_shop'),
                charset='utf8mb4',
                autocommit=True
            )
            logger.info("✅ 成功连接到MySQL数据库")
            
            # 设置会话时区为北京时间
            cursor = self.connection.cursor()
            cursor.execute("SET time_zone = '+08:00'")
            cursor.close()
            logger.info("✅ 数据库时区已设置为北京时间 (+08:00)")
            
        except mysql.connector.Error as e:
            logger.error(f"❌ 连接MySQL数据库失败: {e}")
            raise
    
    def execute_query(self, query, params=None):
        """执行SQL查询"""
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            result = cursor.fetchall()
            cursor.close()
            return result
        except mysql.connector.Error as e:
            logger.error(f"❌ 执行查询失败: {e}")
            raise
    
    def execute_update(self, query, params=None):
        """执行SQL更新操作"""
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params or ())
            self.connection.commit()
            affected_rows = cursor.rowcount
            cursor.close()
            return affected_rows
        except mysql.connector.Error as e:
            logger.error(f"❌ 执行更新失败: {e}")
            self.connection.rollback()
            raise
    
    def get_user_by_id(self, user_id):
        """根据用户ID获取用户信息"""
        query = "SELECT * FROM users WHERE id = %s AND deleted_at IS NULL"
        result = self.execute_query(query, (user_id,))
        return result[0] if result else None
    
    def get_character_by_id(self, character_id):
        """根据角色ID获取角色信息"""
        query = "SELECT * FROM characters WHERE id = %s AND deleted_at IS NULL"
        result = self.execute_query(query, (character_id,))
        return result[0] if result else None
    
    def get_postcards_by_user(self, user_id, limit=10):
        """获取用户的明信片列表"""
        query = """
        SELECT p.*, c.name as character_name 
        FROM postcards p 
        JOIN characters c ON p.character_id = c.id 
        WHERE p.user_id = %s AND p.deleted_at IS NULL 
        ORDER BY p.created_at DESC 
        LIMIT %s
        """
        return self.execute_query(query, (user_id, limit))
    
    def create_postcard(self, user_id, character_id, content, image_url=None):
        """创建新的明信片"""
        query = """
        INSERT INTO postcards (conversation_id, user_id, character_id, content, image_url, status) 
        VALUES (UUID(), %s, %s, %s, %s, 'sent')
        """
        return self.execute_update(query, (user_id, character_id, content, image_url))
    
    def close(self):
        """关闭数据库连接"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("✅ 数据库连接已关闭")

# 全局数据库管理器实例
db_manager = DatabaseManager()

def get_db_manager():
    """获取数据库管理器实例"""
    return db_manager

if __name__ == "__main__":
    # 测试数据库连接
    try:
        db = DatabaseManager()
        
        # 测试查询
        users = db.execute_query("SELECT COUNT(*) as count FROM users")
        print(f"用户数量: {users[0]['count']}")
        
        # 测试获取用户信息
        if users[0]['count'] > 0:
            user = db.get_user_by_id(1)
            if user:
                print(f"用户信息: {user['username']} - {user['email']}")
        
        db.close()
    except Exception as e:
        print(f"测试失败: {e}")
