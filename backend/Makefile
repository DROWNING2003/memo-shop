.PHONY: build run test clean docker-build docker-run

# 变量
APP_NAME=memory-postcard-backend
DOCKER_IMAGE=memory-postcard-backend:latest

# 构建应用
build:
	go build -o bin/$(APP_NAME) .

# 运行应用
run:
	go run .

# 运行测试
test:
	go test -v ./...

# 清理构建文件
clean:
	rm -rf bin/

# 安装依赖
deps:
	go mod download
	go mod tidy

# 格式化代码
fmt:
	go fmt ./...

# 代码检查
lint:
	golangci-lint run

# 构建 Docker 镜像
docker-build:
	docker build -t $(DOCKER_IMAGE) .

# 运行 Docker 容器
docker-run:
	docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE)

# 开发环境启动（需要先启动数据库服务）
dev:
	docker-compose -f ../docker-compose.dev.yml up -d mysql redis minio
	sleep 10
	go run .

# 停止开发环境
dev-stop:
	docker-compose -f ../docker-compose.dev.yml down