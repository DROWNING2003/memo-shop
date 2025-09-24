package middleware

import (
	"memory-postcard-backend/internal/models"
	"memory-postcard-backend/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 认证中间件
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.Error(401, "Authorization header required"))
			c.Abort()
			return
		}

		// 检查 Bearer 前缀
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, models.Error(401, "Invalid authorization header format"))
			c.Abort()
			return
		}

		// 验证 JWT token
		claims, err := utils.ValidateJWT(tokenString, jwtSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.Error(401, "Invalid token"))
			c.Abort()
			return
		}

		// 将用户 ID 存储到上下文中
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}

// OptionalAuthMiddleware 可选的认证中间件
func OptionalAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString != authHeader {
				claims, err := utils.ValidateJWT(tokenString, jwtSecret)
				if err == nil {
					c.Set("user_id", claims.UserID)
					c.Set("username", claims.Username)
				}
			}
		}
		c.Next()
	}
}

// GetCurrentUserID 从上下文中获取当前用户 ID
func GetCurrentUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	return userID.(uint), true
}
