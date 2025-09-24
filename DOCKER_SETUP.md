# TEN Agent Docker Setup

这个文档描述了如何使用 Docker Compose 来运行 TEN Agent 项目的完整环境。

## 服务组件

- **MySQL 8.0**: 主数据库
- **Redis 7**: 缓存和会话存储
- **MinIO**: 对象存储服务（S3 兼容）
- **Backend**: Go 后端服务
- **Frontend**: Next.js 前端应用

## 快速开始

### 1. 环境准备

确保已安装：
- Docker
- Docker Compose
- Make (可选，用于简化命令)

### 2. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置。

### 3. 启动服务

#### 开发环境（仅基础服务）
```bash
# 使用 Make
make dev

# 或直接使用 docker-compose
docker-compose -f docker-compose.dev.yml up -d
```

#### 生产环境（所有服务）
```bash
# 使用 Make
make up

# 或直接使用 docker-compose
docker-compose up -d
```

## 服务访问

启动后，可以通过以下地址访问各个服务：

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:8080
- **MinIO 控制台**: http://localhost:9001
  - 用户名: `minioadmin`
  - 密码: `minioadmin123`
- **MySQL**: localhost:3306
  - 数据库: `ten_agent`
  - 用户名: `ten_user`
  - 密码: `ten_password`
- **Redis**: localhost:6379

## 常用命令

### Make 命令（推荐）

```bash
# 查看所有可用命令
make help

# 开发环境
make dev          # 启动开发服务
make dev-down     # 停止开发服务
make dev-logs     # 查看开发服务日志

# 生产环境
make up           # 启动所有服务
make down         # 停止所有服务
make logs         # 查看所有服务日志
make build        # 构建所有服务
make rebuild      # 重新构建并启动

# 维护
make clean        # 清理容器和卷
make reset        # 完全重置

# 数据库操作
make db-shell     # 连接 MySQL
make redis-shell  # 连接 Redis

# 查看服务状态
make health       # 检查服务健康状态
make urls         # 显示所有服务 URL
```

### Docker Compose 命令

```bash
# 启动所有服务
docker-compose up -d

# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose logs -f [service_name]

# 停止服务
docker-compose down

# 重新构建
docker-compose build --no-cache

# 查看服务状态
docker-compose ps
```

## 数据持久化

所有数据都存储在 Docker 卷中：

- `mysql_data`: MySQL 数据
- `redis_data`: Redis 数据
- `minio_data`: MinIO 对象存储数据

## 数据库初始化

首次启动时，MySQL 会自动执行 `init-scripts/01-init.sql` 中的初始化脚本，创建：

- 数据库表结构
- 默认管理员用户
- 示例 Agent 配置

## MinIO 配置

MinIO 会自动创建名为 `ten-agent-bucket` 的存储桶，用于存储文件。

访问 MinIO 控制台：http://localhost:9001
- 用户名: `minioadmin`
- 密码: `minioadmin123`

## 故障排除

### 1. 端口冲突

如果遇到端口冲突，可以修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "3307:3306"  # 将 MySQL 端口改为 3307
```

### 2. 权限问题

在 Linux/macOS 上，可能需要调整文件权限：

```bash
sudo chown -R $USER:$USER .
```

### 3. 服务启动失败

查看具体服务的日志：

```bash
docker-compose logs [service_name]
```

### 4. 数据库连接问题

确保后端服务等待数据库完全启动：

```bash
# 检查 MySQL 健康状态
docker-compose exec mysql mysqladmin ping -h localhost
```

### 5. 清理和重置

如果遇到严重问题，可以完全重置环境：

```bash
make reset
# 或
docker-compose down -v
docker system prune -f
```

## 开发建议

### 1. 开发环境设置

对于日常开发，建议：

1. 使用 `make dev` 启动基础服务
2. 在本地运行前端和后端进行开发
3. 连接到 Docker 中的数据库和缓存服务

### 2. 环境变量

开发时，后端可以使用以下环境变量连接到 Docker 服务：

```bash
export DB_HOST=localhost
export DB_PORT=3306
export REDIS_HOST=localhost
export REDIS_PORT=6379
export MINIO_ENDPOINT=localhost:9000
```

### 3. 热重载

前端支持热重载，修改代码后会自动刷新。后端需要重新构建容器：

```bash
make rebuild
```

## 生产部署

生产环境部署时，请注意：

1. 修改所有默认密码
2. 使用环境变量或 Docker secrets 管理敏感信息
3. 配置适当的资源限制
4. 设置日志轮转
5. 配置备份策略

## 监控和日志

### 查看实时日志

```bash
# 所有服务
make logs

# 特定服务
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 服务健康检查

```bash
make health
```

这将显示所有服务的运行状态和端口信息。