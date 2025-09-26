// @title Memory Postcard API
// @version 1.0
// @description 回忆小卖部 AI 角色明信片交流应用 API 文档
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

package main

import (
	"log"
	"memory-postcard-backend/config"
	_ "memory-postcard-backend/docs"
	"memory-postcard-backend/internal/database"
	"memory-postcard-backend/internal/middleware"
	"memory-postcard-backend/internal/routes"
	"memory-postcard-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 加载环境变量
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// 初始化配置
	cfg := config.Load()

	// 初始化数据库
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 初始化 Redis
	redisClient, err := database.InitRedis(cfg)
	if err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	// 初始化 MinIO
	minioClient, err := database.InitMinIO(cfg)
	if err != nil {
		log.Fatal("Failed to connect to MinIO:", err)
	}

	// 初始化服务
	services := services.NewServices(db, redisClient, minioClient, cfg)

	// 设置 Gin 模式
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 创建 Gin 实例
	r := gin.Default()

	// 配置 CORS - 允许所有域名访问
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "X-Total-Count"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12小时
	}))

	// 添加中间件
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())

	// 设置路由
	routes.SetupRoutes(r, services, cfg)

	// 启动服务器
	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
