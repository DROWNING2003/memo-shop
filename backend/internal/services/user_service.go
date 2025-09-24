package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"memory-postcard-backend/config"
	"memory-postcard-backend/internal/models"
	"memory-postcard-backend/internal/utils"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type UserService struct {
	db     *gorm.DB
	redis  *redis.Client
	config *config.Config
}

func NewUserService(db *gorm.DB, redis *redis.Client, cfg *config.Config) *UserService {
	return &UserService{
		db:     db,
		redis:  redis,
		config: cfg,
	}
}

// Register 用户注册
func (s *UserService) Register(req *models.UserCreateRequest) (*models.UserResponse, error) {
	// 检查用户名是否已存在
	var existingUser models.User
	if err := s.db.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("username or email already exists")
	}

	// 哈希密码
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// 创建用户
	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Nickname:     req.Nickname,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return s.toUserResponse(&user), nil
}

// Login 用户登录
func (s *UserService) Login(req *models.UserLoginRequest) (*models.LoginResponse, error) {
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid email or password")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	// 验证密码
	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	// 生成 JWT token
	token, err := utils.GenerateJWT(user.ID, user.Username, s.config.JWTSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// 缓存用户信息到 Redis
	s.cacheUser(&user)

	return &models.LoginResponse{
		Token: token,
		User:  *s.toUserResponse(&user),
	}, nil
}

// GetProfile 获取用户资料
func (s *UserService) GetProfile(userID uint) (*models.UserResponse, error) {
	// 先从缓存获取
	if user := s.getUserFromCache(userID); user != nil {
		return s.toUserResponse(user), nil
	}

	// 从数据库获取
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// 缓存用户信息
	s.cacheUser(&user)

	return s.toUserResponse(&user), nil
}

// UpdateProfile 更新用户资料
func (s *UserService) UpdateProfile(userID uint, req *models.UserUpdateRequest) (*models.UserResponse, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// 更新字段
	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}
	if req.Signature != "" {
		user.Signature = req.Signature
	}
	if req.Language != "" {
		user.Language = req.Language
	}
	if req.FontSize != "" {
		user.FontSize = req.FontSize
	}
	if req.DarkMode != nil {
		user.DarkMode = *req.DarkMode
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// 更新缓存
	s.cacheUser(&user)

	return s.toUserResponse(&user), nil
}

// cacheUser 缓存用户信息到 Redis
func (s *UserService) cacheUser(user *models.User) {
	ctx := context.Background()
	key := fmt.Sprintf("user:%d", user.ID)

	userData, _ := json.Marshal(user)
	s.redis.Set(ctx, key, userData, 30*time.Minute)
}

// getUserFromCache 从 Redis 缓存获取用户信息
func (s *UserService) getUserFromCache(userID uint) *models.User {
	ctx := context.Background()
	key := fmt.Sprintf("user:%d", userID)

	userData, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		return nil
	}

	var user models.User
	if err := json.Unmarshal([]byte(userData), &user); err != nil {
		return nil
	}

	return &user
}

// toUserResponse 转换为用户响应格式
func (s *UserService) toUserResponse(user *models.User) *models.UserResponse {
	return &models.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Nickname:  user.Nickname,
		AvatarURL: user.AvatarURL,
		Signature: user.Signature,
		Language:  user.Language,
		FontSize:  user.FontSize,
		DarkMode:  user.DarkMode,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}
