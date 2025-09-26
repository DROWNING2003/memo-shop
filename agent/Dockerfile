# syntax=docker.io/docker/dockerfile:1

FROM python:3.11-slim AS base

# 设置工作目录
WORKDIR /app

# 安装 uv (Python 包管理器)
RUN pip install --no-cache-dir uv

# 复制项目文件
COPY pyproject.toml uv.lock* ./

# 安装依赖
RUN uv sync --frozen

# 复制源代码
COPY . .

# 设置环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 暴露端口（如果需要）
EXPOSE 8000

# 启动命令
CMD ["uv", "run", "python", "main.py"]
