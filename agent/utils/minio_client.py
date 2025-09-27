import os
from minio import Minio
from minio.error import S3Error
import logging
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

class MinioClient:
    """MinIO对象存储客户端"""
    
    def __init__(self):
        self.client = None
        self.bucket_name = os.getenv('MINIO_BUCKET', 'memoshop-agent-bucket')
        self.is_connected = False
        self.connect()
    
    def connect(self):
        """连接到MinIO服务器"""
        try:
            endpoint = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
            access_key = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
            secret_key = os.getenv('MINIO_SECRET_KEY', 'minioadmin123')
            secure = os.getenv('MINIO_USE_SSL', 'false').lower() == 'true'
            
            self.client = Minio(
                endpoint=endpoint,
                access_key=access_key,
                secret_key=secret_key,
                secure=secure
            )
            
            # 检查连接并确保bucket存在
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"✅ 创建bucket: {self.bucket_name}")
            
            self.is_connected = True
            logger.info("✅ 成功连接到MinIO对象存储")
            
        except Exception as e:
            logger.error(f"❌ 连接MinIO失败: {e}")
            self.is_connected = False
            raise
    
    def upload_file(self, file_path, object_name=None, content_type='application/octet-stream'):
        """上传文件到MinIO"""
        if not self.is_connected:
            self.connect()
        
        try:
            if not object_name:
                object_name = os.path.basename(file_path)
            
            self.client.fput_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                file_path=file_path,
                content_type=content_type
            )
            
            # 使用公共基础URL生成文件访问URL
            public_base_url = os.getenv('MINIO_PUBLIC_BASE_URL')
            if public_base_url:
                file_url = f"{public_base_url}/{self.bucket_name}/{object_name}"
            else:
                # 如果没有配置公共URL，使用内部地址
                file_url = f"http://{os.getenv('MINIO_ENDPOINT', 'localhost:9000')}/{self.bucket_name}/{object_name}"
            
            logger.info(f"✅ 文件上传成功: {object_name}")
            return file_url
            
        except S3Error as e:
            logger.error(f"❌ 文件上传失败: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ 文件上传异常: {e}")
            return None
    
    def upload_audio_file(self, file_path, object_name=None):
        """上传音频文件到MinIO"""
        return self.upload_file(
            file_path=file_path,
            object_name=object_name,
            content_type='audio/mpeg'
        )
    
    def upload_voice_file(self, file_path, character_id=None, timestamp=None, object_name=None):
        """上传语音文件，生成有意义的文件名"""
        if not object_name:
            import time
            from datetime import datetime
            
            if not timestamp:
                timestamp = int(time.time())
            
            date_str = datetime.fromtimestamp(timestamp).strftime('%Y%m%d_%H%M%S')
            file_ext = os.path.splitext(file_path)[1]
            
            if character_id:
                object_name = f"voices/character_{character_id}/{date_str}{file_ext}"
            else:
                object_name = f"voices/system/{date_str}{file_ext}"
        
        return self.upload_audio_file(file_path, object_name)
    
    def download_file(self, object_name, file_path):
        """从MinIO下载文件"""
        if not self.is_connected:
            self.connect()
        
        try:
            self.client.fget_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                file_path=file_path
            )
            
            logger.info(f"✅ 文件下载成功: {object_name} -> {file_path}")
            return True
            
        except S3Error as e:
            logger.error(f"❌ 文件下载失败: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ 文件下载异常: {e}")
            return False
    
    def delete_file(self, object_name):
        """从MinIO删除文件"""
        if not self.is_connected:
            self.connect()
        
        try:
            self.client.remove_object(
                bucket_name=self.bucket_name,
                object_name=object_name
            )
            
            logger.info(f"✅ 文件删除成功: {object_name}")
            return True
            
        except S3Error as e:
            logger.error(f"❌ 文件删除失败: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ 文件删除异常: {e}")
            return False
    
    def file_exists(self, object_name):
        """检查文件是否存在"""
        if not self.is_connected:
            self.connect()
        
        try:
            self.client.stat_object(
                bucket_name=self.bucket_name,
                object_name=object_name
            )
            return True
        except S3Error:
            return False
        except Exception as e:
            logger.error(f"❌ 检查文件存在性异常: {e}")
            return False
    
    def get_file_url(self, object_name, expires=7*24*60*60):
        """获取文件的临时访问URL"""
        if not self.is_connected:
            self.connect()
        
        try:
            url = self.client.presigned_get_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                expires=expires
            )
            return url
        except Exception as e:
            logger.error(f"❌ 获取文件URL失败: {e}")
            return None
    
    def list_files(self, prefix=None):
        """列出bucket中的文件"""
        if not self.is_connected:
            self.connect()
        
        try:
            objects = self.client.list_objects(
                bucket_name=self.bucket_name,
                prefix=prefix,
                recursive=True
            )
            
            file_list = []
            for obj in objects:
                file_list.append({
                    'name': obj.object_name,
                    'size': obj.size,
                    'last_modified': obj.last_modified
                })
            
            return file_list
        except Exception as e:
            logger.error(f"❌ 列出文件失败: {e}")
            return []

# 全局MinIO客户端实例
minio_client = MinioClient()

def get_minio_client():
    """获取MinIO客户端实例"""
    return minio_client

if __name__ == "__main__":
    # 测试MinIO连接和基本操作
    try:
        minio = MinioClient()
        
        # 测试列出文件
        files = minio.list_files()
        print(f"✅ Bucket中的文件数量: {len(files)}")
        
        # 测试文件存在性检查
        test_file = "test_file.txt"
        exists = minio.file_exists(test_file)
        print(f"✅ 文件存在性检查: {test_file} -> {exists}")
        
        print("✅ MinIO客户端测试完成")
        
    except Exception as e:
        print(f"❌ MinIO客户端测试失败: {e}")
