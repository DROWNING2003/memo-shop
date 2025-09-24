package routes

import (
	"memory-postcard-backend/config"
	"memory-postcard-backend/internal/handlers"
	"memory-postcard-backend/internal/middleware"
	"memory-postcard-backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRoutes(r *gin.Engine, services *services.Services, cfg *config.Config) {
	jwtSecret := cfg.JWTSecret
	// 创建处理器
	userHandler := handlers.NewUserHandler(services.User)
	characterHandler := handlers.NewCharacterHandler(services.Character)
	postcardHandler := handlers.NewPostcardHandler(services.Postcard)
	uploadHandler := handlers.NewUploadHandler(services.Upload)

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Memory Postcard API is running",
		})
	})

	// API 路由组
	api := r.Group("/api")
	{
		// 认证路由（无需认证）
		auth := api.Group("/auth")
		{
			auth.POST("/register", userHandler.Register)
			auth.POST("/login", userHandler.Login)
		}

		// 用户路由
		users := api.Group("/users")
		{
			users.GET("/:id", userHandler.GetUserByID) // 公开接口

			// 需要认证的用户路由
			authenticated := users.Use(middleware.AuthMiddleware(jwtSecret))
			{
				authenticated.GET("/profile", userHandler.GetProfile)
				authenticated.PUT("/profile", userHandler.UpdateProfile)
			}
		}

		// 角色路由
		characters := api.Group("/characters")
		{
			characters.GET("", characterHandler.ListCharacters)   // 公开接口
			characters.GET("/:id", characterHandler.GetCharacter) // 公开接口

			// 需要认证的角色路由
			authenticated := characters.Use(middleware.AuthMiddleware(jwtSecret))
			{
				authenticated.POST("", characterHandler.CreateCharacter)
				authenticated.PUT("/:id", characterHandler.UpdateCharacter)
				authenticated.DELETE("/:id", characterHandler.DeleteCharacter)
				authenticated.GET("/my", characterHandler.GetMyCharacters)
				authenticated.GET("/favorites", characterHandler.GetFavoriteCharacters)
				authenticated.POST("/:id/favorite", characterHandler.ToggleFavorite)
				authenticated.GET("/:id/favorite", characterHandler.CheckFavoriteStatus)
			}
		}

		// 明信片路由（全部需要认证）
		postcards := api.Group("/postcards").Use(middleware.AuthMiddleware(jwtSecret))
		{
			postcards.POST("", postcardHandler.CreatePostcard)
			postcards.GET("", postcardHandler.ListPostcards)
			postcards.GET("/:id", postcardHandler.GetPostcard)
			postcards.PUT("/:id", postcardHandler.UpdatePostcard)
			postcards.DELETE("/:id", postcardHandler.DeletePostcard)
			postcards.GET("/conversations/:conversation_id", postcardHandler.GetConversation)
		}

		// 文件上传路由（需要认证）
		upload := api.Group("/upload").Use(middleware.AuthMiddleware(jwtSecret))
		{
			upload.POST("/image", uploadHandler.UploadImage)
			upload.POST("/avatar", uploadHandler.UploadAvatar)
			upload.POST("/character-avatar", uploadHandler.UploadCharacterAvatar)
			upload.POST("/audio", uploadHandler.UploadAudio)
		}
	}

	// Swagger 文档路由
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 静态文件服务（如果需要）
	r.Static("/static", "./static")
}
