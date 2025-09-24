# MinIO 存储桶公开访问配置指南

## 概述

MinIO 支持将整个存储桶设置为公开访问，这样桶内的所有文件都可以通过公开URL直接访问，无需认证。

## 当前配置状态

根据项目配置，您的MinIO使用以下设置：
- Bucket名称: `ten-agent-bucket`
- 访问端点: `http://localhost:9000`
- 管理控制台: `http://localhost:9001`

## 设置存储桶为公开访问的方法

### 方法1: 使用MinIO控制台（推荐）

1. 打开MinIO控制台: http://localhost:9001
2. 使用以下凭据登录:
   - 用户名: `minioadmin`
   - 密码: `minioadmin123`
3. 点击左侧的"Buckets"菜单
4. 找到并点击 `ten-agent-bucket`
5. 在桶详情页面，点击"Access Rules"标签
6. 点击"Add Access Rule"
7. 配置如下:
   - Prefix: `*` (匹配所有文件)
   - Access: `readonly` 或 `readwrite`
   - 点击"Save"

### 方法2: 使用mc命令行工具

```bash
# 设置mc别名
mc alias set local http://localhost:9000 minioadmin minioadmin123

# 设置整个桶为公开下载权限
mc anonymous set download local/ten-agent-bucket

# 验证权限设置
mc anonymous get local/ten-agent-bucket
```

### 方法3: 使用Go代码在应用启动时设置

在您的后端服务中添加桶权限设置功能：

```go
// 在服务启动时设置桶权限
func setupMinIOBucketPermissions(minioClient *minio.Client, bucketName string) error {
    ctx := context.Background()
    
    // 设置桶策略为公开读取
    policy := `{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": ["arn:aws:s3:::%s/*"]
            }
        ]
    }`
    
    err := minioClient.SetBucketPolicy(ctx, bucketName, fmt.Sprintf(policy, bucketName))
    if err != nil {
        return fmt.Errorf("failed to set bucket policy: %w", err)
    }
    
    return nil
}
```

## 公开访问URL格式

设置公开权限后，文件的访问URL格式为：
```
http://localhost:9000/ten-agent-bucket/{文件路径}
```

例如，如果上传的文件路径为 `images/avatar.jpg`，则公开访问URL为：
```
http://localhost:9000/ten-agent-bucket/images/avatar.jpg
```

## 生产环境注意事项

### 1. 使用公共域名
在生产环境中，建议配置 `MINIO_PUBLIC_BASE_URL` 环境变量：

```env
MINIO_PUBLIC_BASE_URL=https://cdn.yourdomain.com
```

这样生成的URL将是：
```
https://cdn.yourdomain.com/ten-agent-bucket/images/avatar.jpg
```

### 2. 安全考虑
- 公开桶只适用于需要公开访问的文件（如图片、音频等静态资源）
- 敏感文件应存储在私有桶中
- 可以考虑使用CDN来缓存公开文件

### 3. 修改现有脚本

更新 `scripts/setup-minio-permissions.sh` 脚本：

```bash
#!/bin/bash

echo "正在设置MinIO bucket权限..."

# 等待MinIO服务启动
sleep 10

# 设置mc别名
docker exec ten-agent-minio mc alias set local http://localhost:9000 minioadmin minioadmin123

# 检查并创建bucket
docker exec ten-agent-minio mc ls local/ten-agent-bucket > /dev/null 2>&1 || \
docker exec ten-agent-minio mc mb local/ten-agent-bucket

# 设置bucket为公开下载权限
echo "设置bucket为公开下载权限..."
docker exec ten-agent-minio mc anonymous set download local/ten-agent-bucket

echo "✅ MinIO bucket权限设置完成！"
```

## 验证设置

### 1. 验证权限
```bash
# 检查桶权限
mc anonymous get local/ten-agent-bucket
```

### 2. 测试公开访问
上传一个测试文件，然后尝试通过浏览器直接访问：
```
http://localhost:9000/ten-agent-bucket/测试文件路径
```

## 总结

通过上述方法，您可以将MinIO存储桶设置为公开访问，这样上传的文件就可以通过公开URL直接访问，无需额外的认证步骤。这对于需要公开分享的静态资源（如图片、音频文件）非常有用。
