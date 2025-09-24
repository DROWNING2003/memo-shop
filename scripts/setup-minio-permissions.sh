#!/bin/bash

# 设置MinIO bucket权限脚本
# 这个脚本确保ten-agent-bucket有正确的下载权限

echo "正在设置MinIO bucket权限..."

# 等待MinIO服务启动
echo "等待MinIO服务启动..."
sleep 10

# 设置mc别名
docker exec ten-agent-minio-dev mc alias set local http://localhost:9000 minioadmin minioadmin123

# 检查bucket是否存在，如果不存在则创建
docker exec ten-agent-minio-dev mc ls local/ten-agent-bucket > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "创建bucket: ten-agent-bucket"
    docker exec ten-agent-minio-dev mc mb local/ten-agent-bucket
fi

# 设置bucket为公开下载权限
echo "设置bucket为公开下载权限..."
docker exec ten-agent-minio-dev mc anonymous set download local/ten-agent-bucket

# 验证权限设置
echo "验证权限设置..."
PERMISSION=$(docker exec ten-agent-minio-dev mc anonymous get local/ten-agent-bucket | awk '{print $NF}')
if [ "$PERMISSION" = "download" ]; then
    echo "✅ MinIO bucket权限设置成功！"
    echo "Bucket: ten-agent-bucket"
    echo "权限: $PERMISSION"
else
    echo "❌ 权限设置失败，当前权限: $PERMISSION"
    exit 1
fi

echo "MinIO配置完成！"
