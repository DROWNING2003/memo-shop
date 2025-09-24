#!/bin/bash

# TEN Agent Quick Start Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "🚀 TEN Agent Quick Start"
echo "========================"
echo -e "${NC}"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    echo -e "${RED}❌ docker-compose is not installed. Please install docker-compose first.${NC}"
    exit 1
fi

# Function to wait for service
wait_for_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for ${service_name} to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if eval "$check_command" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ ${service_name} is ready!${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ ${service_name} failed to start within expected time${NC}"
    return 1
}

# Main function
main() {
    echo "1. Creating environment file..."
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file from template${NC}"
    else
        echo -e "${YELLOW}⚠ .env file already exists${NC}"
    fi
    
    echo ""
    echo "2. Starting services..."
    
    # Ask user which environment to start
    echo "Which environment would you like to start?"
    echo "  1) Development (MySQL, Redis, MinIO only)"
    echo "  2) Full stack (All services including frontend and backend)"
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}Starting development environment...${NC}"
            docker-compose -f docker-compose.dev.yml up -d
            
            # Wait for services
            wait_for_service "MySQL" "docker exec ten-agent-mysql-dev mysqladmin ping -h localhost --silent"
            wait_for_service "Redis" "docker exec ten-agent-redis-dev redis-cli ping | grep -q PONG"
            wait_for_service "MinIO" "curl -f http://localhost:9000/minio/health/live"
            
            echo ""
            echo -e "${GREEN}🎉 Development environment is ready!${NC}"
            echo ""
            echo "Services available:"
            echo "  MySQL:         localhost:3306"
            echo "  Redis:         localhost:6379"
            echo "  MinIO API:     http://localhost:9000"
            echo "  MinIO Console: http://localhost:9001"
            echo ""
            echo "Next steps:"
            echo "  1. Start your backend: cd backend && go run main.go"
            echo "  2. Start your frontend: cd fronted && npm run dev"
            echo "  3. Visit: http://localhost:3000"
            ;;
        2)
            echo -e "${BLUE}Starting full stack environment...${NC}"
            docker-compose up -d --build
            
            # Wait for services
            wait_for_service "MySQL" "docker exec ten-agent-mysql mysqladmin ping -h localhost --silent"
            wait_for_service "Redis" "docker exec ten-agent-redis redis-cli ping | grep -q PONG"
            wait_for_service "MinIO" "curl -f http://localhost:9000/minio/health/live"
            wait_for_service "Backend" "curl -f http://localhost:8080"
            wait_for_service "Frontend" "curl -f http://localhost:3000"
            
            echo ""
            echo -e "${GREEN}🎉 Full stack environment is ready!${NC}"
            echo ""
            echo "Services available:"
            echo "  Frontend:      http://localhost:3000"
            echo "  Backend API:   http://localhost:8080"
            echo "  MySQL:         localhost:3306"
            echo "  Redis:         localhost:6379"
            echo "  MinIO API:     http://localhost:9000"
            echo "  MinIO Console: http://localhost:9001"
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo "Useful commands:"
    echo "  make health    # Check service health"
    echo "  make logs      # View service logs"
    echo "  make down      # Stop all services"
    echo "  make clean     # Clean up everything"
    
    echo ""
    echo -e "${GREEN}Happy coding! 🎯${NC}"
}

# Run the script
main "$@"