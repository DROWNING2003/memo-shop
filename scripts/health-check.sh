#!/bin/bash

# TEN Agent Health Check Script

set -e

echo "🔍 TEN Agent Health Check"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local container_name=$2
    
    if docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
        echo -e "${GREEN}✓${NC} ${service_name} is running"
        return 0
    else
        echo -e "${RED}✗${NC} ${service_name} is not running"
        return 1
    fi
}

# Function to check service health
check_health() {
    local service_name=$1
    local url=$2
    local expected_code=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_code"; then
        echo -e "${GREEN}✓${NC} ${service_name} health check passed"
        return 0
    else
        echo -e "${RED}✗${NC} ${service_name} health check failed"
        return 1
    fi
}

# Function to check database connection
check_database() {
    if docker exec ten-agent-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo -e "${GREEN}✓${NC} MySQL is responding"
        return 0
    else
        echo -e "${RED}✗${NC} MySQL is not responding"
        return 1
    fi
}

# Function to check Redis connection
check_redis() {
    if docker exec ten-agent-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        echo -e "${GREEN}✓${NC} Redis is responding"
        return 0
    else
        echo -e "${RED}✗${NC} Redis is not responding"
        return 1
    fi
}

# Main health check
main() {
    local all_healthy=true
    
    echo "Checking Docker containers..."
    check_service "MySQL" "ten-agent-mysql" || all_healthy=false
    check_service "Redis" "ten-agent-redis" || all_healthy=false
    check_service "MinIO" "ten-agent-minio" || all_healthy=false
    
    # Check if backend and frontend are running (optional)
    if docker ps --format "table {{.Names}}" | grep -q "ten-agent-backend"; then
        check_service "Backend" "ten-agent-backend" || all_healthy=false
    else
        echo -e "${YELLOW}⚠${NC} Backend container not found (may be running locally)"
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "ten-agent-frontend"; then
        check_service "Frontend" "ten-agent-frontend" || all_healthy=false
    else
        echo -e "${YELLOW}⚠${NC} Frontend container not found (may be running locally)"
    fi
    
    echo ""
    echo "Checking service connectivity..."
    
    # Check database connectivity
    check_database || all_healthy=false
    
    # Check Redis connectivity
    check_redis || all_healthy=false
    
    # Check MinIO health
    check_health "MinIO" "http://localhost:9000/minio/health/live" || all_healthy=false
    
    # Check backend API (if running)
    if curl -s http://localhost:8080 >/dev/null 2>&1; then
        check_health "Backend API" "http://localhost:8080" || all_healthy=false
    else
        echo -e "${YELLOW}⚠${NC} Backend API not accessible (may not be running)"
    fi
    
    # Check frontend (if running)
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        check_health "Frontend" "http://localhost:3000" || all_healthy=false
    else
        echo -e "${YELLOW}⚠${NC} Frontend not accessible (may not be running)"
    fi
    
    echo ""
    echo "Service URLs:"
    echo "  Frontend:      http://localhost:3000"
    echo "  Backend API:   http://localhost:8080"
    echo "  MinIO Console: http://localhost:9001"
    echo "  MySQL:         localhost:3306"
    echo "  Redis:         localhost:6379"
    
    echo ""
    if [ "$all_healthy" = true ]; then
        echo -e "${GREEN}🎉 All services are healthy!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some services have issues. Check the logs for more details.${NC}"
        echo ""
        echo "Troubleshooting commands:"
        echo "  make logs          # View all service logs"
        echo "  make dev-logs      # View development service logs"
        echo "  docker-compose ps  # Check container status"
        exit 1
    fi
}

# Run the health check
main "$@"