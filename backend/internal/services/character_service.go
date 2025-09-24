package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"memory-postcard-backend/internal/models"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type CharacterService struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewCharacterService(db *gorm.DB, redis *redis.Client) *CharacterService {
	return &CharacterService{
		db:    db,
		redis: redis,
	}
}

// CreateCharacter 创建角色
func (s *CharacterService) CreateCharacter(userID uint, req *models.CharacterCreateRequest) (*models.Character, error) {
	character := models.Character{
		CreatorID:    userID,
		Name:         req.Name,
		Description:  req.Description,
		AvatarURL:    req.AvatarURL,
		Visibility:   req.Visibility,
		UserRoleName: req.UserRoleName,
		UserRoleDesc: req.UserRoleDesc,
	}

	if character.Visibility == "" {
		character.Visibility = "public"
	}

	if err := s.db.Create(&character).Error; err != nil {
		return nil, fmt.Errorf("failed to create character: %w", err)
	}

	// 预加载创建者信息
	s.db.Preload("Creator").First(&character, character.ID)

	// 清除相关缓存
	s.clearCharacterListCache()

	return &character, nil
}

// GetCharacter 获取角色详情
func (s *CharacterService) GetCharacter(id uint, userID *uint) (*models.Character, error) {
	// 先从缓存获取
	if character := s.getCharacterFromCache(id); character != nil {
		// 检查权限
		if character.Visibility == "private" && (userID == nil || character.CreatorID != *userID) {
			return nil, errors.New("character not found")
		}
		return character, nil
	}

	var character models.Character
	query := s.db.Preload("Creator").Preload("Voices")

	if err := query.First(&character, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("character not found")
		}
		return nil, fmt.Errorf("failed to get character: %w", err)
	}

	// 检查权限
	if character.Visibility == "private" && (userID == nil || character.CreatorID != *userID) {
		return nil, errors.New("character not found")
	}

	// 缓存角色信息
	s.cacheCharacter(&character)

	return &character, nil
}

// ListCharacters 获取角色列表
func (s *CharacterService) ListCharacters(query *models.CharacterListQuery, userID *uint) (*models.PaginatedResponse, error) {
	cacheKey := s.getCharacterListCacheKey(query, userID)

	// 先从缓存获取
	if cached := s.getCharacterListFromCache(cacheKey); cached != nil {
		return cached, nil
	}

	var characters []models.Character
	var total int64

	db := s.db.Model(&models.Character{}).Preload("Creator")

	// 构建查询条件
	if query.Visibility != "" {
		db = db.Where("visibility = ?", query.Visibility)
	} else {
		// 如果没有指定可见性，只显示公开的或用户自己的私有角色
		if userID != nil {
			db = db.Where("visibility = 'public' OR (visibility = 'private' AND creator_id = ?)", *userID)
		} else {
			db = db.Where("visibility = 'public'")
		}
	}

	if query.CreatorID != 0 {
		db = db.Where("creator_id = ?", query.CreatorID)
	}

	if query.Search != "" {
		db = db.Where("name LIKE ? OR description LIKE ?", "%"+query.Search+"%", "%"+query.Search+"%")
	}

	// 只显示激活的角色
	db = db.Where("is_active = ?", true)

	// 计算总数
	if err := db.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count characters: %w", err)
	}

	// 排序
	orderBy := fmt.Sprintf("%s %s", query.SortBy, query.SortOrder)
	db = db.Order(orderBy)

	// 分页
	offset := (query.Page - 1) * query.PageSize
	if err := db.Offset(offset).Limit(query.PageSize).Find(&characters).Error; err != nil {
		return nil, fmt.Errorf("failed to get characters: %w", err)
	}

	result := &models.PaginatedResponse{
		Items:      characters,
		Total:      total,
		Page:       query.Page,
		PageSize:   query.PageSize,
		TotalPages: int((total + int64(query.PageSize) - 1) / int64(query.PageSize)),
	}

	// 缓存结果
	s.cacheCharacterList(cacheKey, result)

	return result, nil
}

// UpdateCharacter 更新角色
func (s *CharacterService) UpdateCharacter(id uint, userID uint, req *models.CharacterUpdateRequest) (*models.Character, error) {
	var character models.Character
	if err := s.db.First(&character, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("character not found")
		}
		return nil, fmt.Errorf("failed to get character: %w", err)
	}

	// 检查权限
	if character.CreatorID != userID {
		return nil, errors.New("permission denied")
	}

	// 更新字段
	if req.Name != "" {
		character.Name = req.Name
	}
	if req.Description != "" {
		character.Description = req.Description
	}
	if req.AvatarURL != "" {
		character.AvatarURL = req.AvatarURL
	}
	if req.Visibility != "" {
		character.Visibility = req.Visibility
	}
	if req.IsActive != nil {
		character.IsActive = *req.IsActive
	}
	if req.UserRoleName != "" {
		character.UserRoleName = req.UserRoleName
	}
	if req.UserRoleDesc != "" {
		character.UserRoleDesc = req.UserRoleDesc
	}

	if err := s.db.Save(&character).Error; err != nil {
		return nil, fmt.Errorf("failed to update character: %w", err)
	}

	// 清除缓存
	s.clearCharacterCache(id)
	s.clearCharacterListCache()

	// 重新加载数据
	s.db.Preload("Creator").First(&character, character.ID)

	return &character, nil
}

// DeleteCharacter 删除角色
func (s *CharacterService) DeleteCharacter(id uint, userID uint) error {
	var character models.Character
	if err := s.db.First(&character, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("character not found")
		}
		return fmt.Errorf("failed to get character: %w", err)
	}

	// 检查权限
	if character.CreatorID != userID {
		return errors.New("permission denied")
	}

	// 软删除
	if err := s.db.Delete(&character).Error; err != nil {
		return fmt.Errorf("failed to delete character: %w", err)
	}

	// 清除缓存
	s.clearCharacterCache(id)
	s.clearCharacterListCache()

	return nil
}

// IncrementUsageCount 增加使用次数
func (s *CharacterService) IncrementUsageCount(id uint) error {
	if err := s.db.Model(&models.Character{}).Where("id = ?", id).UpdateColumn("usage_count", gorm.Expr("usage_count + 1")).Error; err != nil {
		return fmt.Errorf("failed to increment usage count: %w", err)
	}

	// 清除缓存
	s.clearCharacterCache(id)

	return nil
}

// ToggleFavorite 切换收藏状态
func (s *CharacterService) ToggleFavorite(userID uint, characterID uint) (bool, error) {
	var relation models.UserCharacterRelation

	// 查找或创建用户角色关系
	result := s.db.Where("user_id = ? AND character_id = ?", userID, characterID).First(&relation)

	if result.Error != nil && errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// 创建新的关系记录
		relation = models.UserCharacterRelation{
			UserID:      userID,
			CharacterID: characterID,
			IsFavorite:  true,
		}
		if err := s.db.Create(&relation).Error; err != nil {
			return false, fmt.Errorf("failed to create favorite relation: %w", err)
		}
		return true, nil
	} else if result.Error != nil {
		return false, fmt.Errorf("failed to get relation: %w", result.Error)
	}

	// 切换收藏状态
	relation.IsFavorite = !relation.IsFavorite
	if err := s.db.Save(&relation).Error; err != nil {
		return false, fmt.Errorf("failed to update favorite status: %w", err)
	}

	// 清除相关缓存
	s.clearCharacterCache(characterID)
	s.clearCharacterListCache()

	return relation.IsFavorite, nil
}

// GetFavoriteCharacters 获取用户收藏的角色列表
func (s *CharacterService) GetFavoriteCharacters(userID uint, page int, pageSize int) (*models.PaginatedResponse, error) {
	var relations []models.UserCharacterRelation
	var total int64

	// 计算总数
	if err := s.db.Model(&models.UserCharacterRelation{}).
		Where("user_id = ? AND is_favorite = ?", userID, true).
		Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count favorite characters: %w", err)
	}

	// 获取收藏关系
	offset := (page - 1) * pageSize
	if err := s.db.Where("user_id = ? AND is_favorite = ?", userID, true).
		Preload("Character").
		Preload("Character.Creator").
		Order("updated_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&relations).Error; err != nil {
		return nil, fmt.Errorf("failed to get favorite characters: %w", err)
	}

	// 提取角色信息
	characters := make([]models.Character, len(relations))
	for i, relation := range relations {
		characters[i] = relation.Character
	}

	result := &models.PaginatedResponse{
		Items:      characters,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: int((total + int64(pageSize) - 1) / int64(pageSize)),
	}

	return result, nil
}

// IsCharacterFavorite 检查角色是否被用户收藏
func (s *CharacterService) IsCharacterFavorite(userID uint, characterID uint) (bool, error) {
	var relation models.UserCharacterRelation
	err := s.db.Where("user_id = ? AND character_id = ?", userID, characterID).First(&relation).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	} else if err != nil {
		return false, fmt.Errorf("failed to check favorite status: %w", err)
	}

	return relation.IsFavorite, nil
}

// 缓存相关方法
func (s *CharacterService) cacheCharacter(character *models.Character) {
	ctx := context.Background()
	key := fmt.Sprintf("character:%d", character.ID)

	data, _ := json.Marshal(character)
	s.redis.Set(ctx, key, data, 15*time.Minute)
}

func (s *CharacterService) getCharacterFromCache(id uint) *models.Character {
	ctx := context.Background()
	key := fmt.Sprintf("character:%d", id)

	data, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		return nil
	}

	var character models.Character
	if err := json.Unmarshal([]byte(data), &character); err != nil {
		return nil
	}

	return &character
}

func (s *CharacterService) clearCharacterCache(id uint) {
	ctx := context.Background()
	key := fmt.Sprintf("character:%d", id)
	s.redis.Del(ctx, key)
}

func (s *CharacterService) getCharacterListCacheKey(query *models.CharacterListQuery, userID *uint) string {
	userIDStr := "guest"
	if userID != nil {
		userIDStr = fmt.Sprintf("%d", *userID)
	}
	return fmt.Sprintf("character_list:%s:%d:%d:%s:%d:%s:%s:%s",
		userIDStr, query.Page, query.PageSize, query.Visibility,
		query.CreatorID, query.Search, query.SortBy, query.SortOrder)
}

func (s *CharacterService) cacheCharacterList(key string, data *models.PaginatedResponse) {
	ctx := context.Background()
	jsonData, _ := json.Marshal(data)
	s.redis.Set(ctx, key, jsonData, 5*time.Minute)
}

func (s *CharacterService) getCharacterListFromCache(key string) *models.PaginatedResponse {
	ctx := context.Background()
	data, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		return nil
	}

	var result models.PaginatedResponse
	if err := json.Unmarshal([]byte(data), &result); err != nil {
		return nil
	}

	return &result
}

func (s *CharacterService) clearCharacterListCache() {
	ctx := context.Background()
	keys, err := s.redis.Keys(ctx, "character_list:*").Result()
	if err != nil {
		return
	}

	if len(keys) > 0 {
		s.redis.Del(ctx, keys...)
	}
}
