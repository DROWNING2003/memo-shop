# MEMOSHOP Docker Compose Management

.PHONY: help dev up down logs clean build rebuild

# Default target
help:
	@echo "MEMOSHOP Docker Compose Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development services (MySQL, Redis, MinIO only)"
	@echo "  make dev-down     - Stop development services"
	@echo "  make dev-logs     - Show development services logs"
	@echo ""
	@echo "Production:"
	@echo "  make up           - Start all services (including frontend and backend)"
	@echo "  make down         - Stop all services"
	@echo "  make logs         - Show all services logs"
	@echo "  make build        - Build all services"
	@echo "  make rebuild      - Rebuild and restart all services"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Remove all containers, volumes, and networks"
	@echo "  make clean-images - Remove all built images"
	@echo "  make reset        - Complete reset (clean + rebuild)"
	@echo ""
	@echo "Database:"
	@echo "  make db-shell     - Connect to MySQL shell"
	@echo "  make redis-shell  - Connect to Redis CLI"
	@echo ""
	@echo "MinIO:"
	@echo "  make minio-console - Open MinIO console (http://localhost:9001)"

# Development environment (services only)
dev:
	@echo "Starting development services..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Services started. Access:"
	@echo "  MySQL: localhost:3306"
	@echo "  Redis: localhost:6379"
	@echo "  MinIO: http://localhost:9000 (API) / http://localhost:9001 (Console)"

dev-down:
	@echo "Stopping development services..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production environment (all services)
up:
	@echo "Starting all services..."
	docker-compose up -d
	@echo "All services started. Access:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend: http://localhost:8080"
	@echo "  MySQL: localhost:3306"
	@echo "  Redis: localhost:6379"
	@echo "  MinIO: http://localhost:9000 (API) / http://localhost:9001 (Console)"

down:
	@echo "Stopping all services..."
	docker-compose down

logs:
	docker-compose logs -f

build:
	@echo "Building all services..."
	docker-compose build

rebuild:
	@echo "Rebuilding and restarting all services..."
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Maintenance
clean:
	@echo "Cleaning up containers, volumes, and networks..."
	docker-compose -f docker-compose.yml down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

clean-images:
	@echo "Removing built images..."
	docker rmi $$(docker images -q --filter "reference=*memo-shop*") 2>/dev/null || true

reset: clean clean-images build up

# Database operations
db-shell:
	@echo "Connecting to MySQL shell..."
	docker exec -it memo-shop-mysql mysql -u memo_shop_user -pmemo_shop_password memo_shop

redis-shell:
	@echo "Connecting to Redis CLI..."
	docker exec -it memo-shop-redis redis-cli

# MinIO
minio-console:
	@echo "MinIO Console: http://localhost:9001"
	@echo "Username: minioadmin"
	@echo "Password: minioadmin123"
	@which open >/dev/null && open http://localhost:9001 || echo "Please open http://localhost:9001 in your browser"

# Health checks
health:
	@./scripts/health-check.sh

status:
	@echo "Checking service status..."
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=memo-shop"

# Show service URLs
urls:
	@echo "Service URLs:"
	@echo "  Frontend:     http://localhost:3000"
	@echo "  Backend:      http://localhost:8080"
	@echo "  MinIO API:    http://localhost:9000"
	@echo "  MinIO Console: http://localhost:9001"
	@echo "  MySQL:        localhost:3306"
	@echo "  Redis:        localhost:6379"
	@echo ""
	@echo "Quick Start:"
	@echo "  make quick-start  - Interactive setup wizard"

# Quick start wizard
quick-start:
	@./scripts/quick-start.sh