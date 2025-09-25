package services

import (
	"errors"
	"fmt"
	"log"
	"memory-postcard-backend/internal/models"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostcardService struct {
	db        *gorm.DB
	redis     *redis.Client
	aiService *AIService
	mqService *MQService
}

func NewPostcardService(db *gorm.DB, redis *redis.Client, aiService *AIService, mqService *MQService) *PostcardService {
	return &PostcardService{
		db:        db,
		redis:     redis,
		aiService: aiService,
		mqService: mqService,
	}
}

// CreatePostcard 创建明信片
func (s *PostcardService) CreatePostcard(userID uint, req *models.PostcardCreateRequest) (*models.Postcard, error) {
	// 验证角色是否存在
	var character models.Character
	if err := s.db.First(&character, req.CharacterID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("character not found")
		}
		return nil, fmt.Errorf("failed to get character: %w", err)
	}

	// 生成对话 ID（如果没有提供）
	conversationID := req.ConversationID
	if conversationID == "" {
		conversationID = uuid.New().String()
	}

	// 创建明信片
	postcard := models.Postcard{
		ConversationID:   conversationID,
		UserID:           userID,
		CharacterID:      req.CharacterID,
		Type:             req.Type,
		Content:          req.Content,
		ImageURL:         req.ImageURL,
		VoiceURL:         req.VoiceURL,
		PostcardTemplate: req.PostcardTemplate,
		Status:           "sent",
	}

	if err := s.db.Create(&postcard).Error; err != nil {
		return nil, fmt.Errorf("failed to create postcard: %w", err)
	}

	// 预加载关联数据
	s.db.Preload("User").Preload("Character").First(&postcard, postcard.ID)

	// 更新角色使用次数和用户关系
	go s.updateCharacterStats(userID, req.CharacterID)

	// 异步生成 AI 回复
	go s.generateAIReply(conversationID, userID, req.CharacterID, req.Content)

	return &postcard, nil
}

// GetPostcard 获取明信片详情
func (s *PostcardService) GetPostcard(id uint, userID uint) (*models.Postcard, error) {
	var postcard models.Postcard
	if err := s.db.Preload("User").Preload("Character").Where("id = ? AND user_id = ?", id, userID).First(&postcard).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("postcard not found")
		}
		return nil, fmt.Errorf("failed to get postcard: %w", err)
	}

	return &postcard, nil
}

// GetPostcardsByConversationID 通过 conversation_id 获取明信片列表
func (s *PostcardService) GetPostcardsByConversationID(conversationID string) ([]models.Postcard, error) {
	var postcards []models.Postcard
	if err := s.db.Preload("User").Preload("Character").
		Where("conversation_id = ?", conversationID).
		Order("created_at ASC").
		Find(&postcards).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("postcards not found")
		}
		return nil, fmt.Errorf("failed to get postcards by conversation_id: %w", err)
	}

	return postcards, nil
}

// ListPostcards 获取明信片列表
func (s *PostcardService) ListPostcards(userID uint, query *models.PostcardListQuery) (*models.PaginatedResponse, error) {
	var postcards []models.Postcard
	var total int64

	db := s.db.Model(&models.Postcard{}).Where("user_id = ?", userID).Preload("User").Preload("Character")

	// 构建查询条件
	if query.ConversationID != "" {
		db = db.Where("conversation_id = ?", query.ConversationID)
	}

	if query.CharacterID != 0 {
		db = db.Where("character_id = ?", query.CharacterID)
	}

	if query.Type != "" && query.Type != "all" {
		db = db.Where("type = ?", query.Type)
	}

	if query.Status != "" {
		db = db.Where("status = ?", query.Status)
	}

	if query.IsFavorite != nil {
		db = db.Where("is_favorite = ?", *query.IsFavorite)
	}

	// 计算总数
	if err := db.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count postcards: %w", err)
	}

	// 排序
	orderBy := fmt.Sprintf("%s %s", query.SortBy, query.SortOrder)
	db = db.Order(orderBy)

	// 分页
	offset := (query.Page - 1) * query.PageSize
	if err := db.Offset(offset).Limit(query.PageSize).Find(&postcards).Error; err != nil {
		return nil, fmt.Errorf("failed to get postcards: %w", err)
	}

	return &models.PaginatedResponse{
		Items:      postcards,
		Total:      total,
		Page:       query.Page,
		PageSize:   query.PageSize,
		TotalPages: int((total + int64(query.PageSize) - 1) / int64(query.PageSize)),
	}, nil
}

// UpdatePostcard 更新明信片
func (s *PostcardService) UpdatePostcard(id uint, userID uint, req *models.PostcardUpdateRequest) (*models.Postcard, error) {
	var postcard models.Postcard
	if err := s.db.Where("id = ? AND user_id = ?", id, userID).First(&postcard).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("postcard not found")
		}
		return nil, fmt.Errorf("failed to get postcard: %w", err)
	}

	// 更新字段
	if req.Content != "" {
		postcard.Content = req.Content
	}
	if req.ImageURL != "" {
		postcard.ImageURL = req.ImageURL
	}
	if req.VoiceURL != "" {
		postcard.VoiceURL = req.VoiceURL
	}
	if req.PostcardTemplate != "" {
		postcard.PostcardTemplate = req.PostcardTemplate
	}
	if req.Status != "" {
		postcard.Status = req.Status
	}
	if req.IsFavorite != nil {
		postcard.IsFavorite = *req.IsFavorite
	}

	if err := s.db.Save(&postcard).Error; err != nil {
		return nil, fmt.Errorf("failed to update postcard: %w", err)
	}

	// 重新加载数据
	s.db.Preload("User").Preload("Character").First(&postcard, postcard.ID)

	return &postcard, nil
}

// DeletePostcard 删除明信片
func (s *PostcardService) DeletePostcard(id uint, userID uint) error {
	var postcard models.Postcard
	if err := s.db.Where("id = ? AND user_id = ?", id, userID).First(&postcard).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("postcard not found")
		}
		return fmt.Errorf("failed to get postcard: %w", err)
	}

	// 软删除
	if err := s.db.Delete(&postcard).Error; err != nil {
		return fmt.Errorf("failed to delete postcard: %w", err)
	}

	return nil
}

// GetConversation 获取对话记录
func (s *PostcardService) GetConversation(conversationID string, userID uint) ([]models.Postcard, error) {
	var postcards []models.Postcard
	if err := s.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Preload("User").Preload("Character").
		Order("created_at ASC").
		Find(&postcards).Error; err != nil {
		return nil, fmt.Errorf("failed to get conversation: %w", err)
	}

	return postcards, nil
}

// updateCharacterStats 更新角色统计信息
func (s *PostcardService) updateCharacterStats(userID, characterID uint) {
	// 更新角色使用次数
	s.db.Model(&models.Character{}).Where("id = ?", characterID).UpdateColumn("usage_count", gorm.Expr("usage_count + 1"))

	// 更新或创建用户角色关系
	var relation models.UserCharacterRelation
	now := time.Now()

	if err := s.db.Where("user_id = ? AND character_id = ?", userID, characterID).First(&relation).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 创建新关系
			relation = models.UserCharacterRelation{
				UserID:            userID,
				CharacterID:       characterID,
				LastInteractionAt: &now,
				InteractionCount:  1,
			}
			s.db.Create(&relation)
		}
	} else {
		// 更新现有关系
		relation.LastInteractionAt = &now
		relation.InteractionCount++
		s.db.Save(&relation)
	}
}

// generateAIReply 生成 AI 回复（通过 MQ 异步处理）
func (s *PostcardService) generateAIReply(conversationID string, userID, characterID uint, userMessage string) {
	// 如果 MQ 服务不可用，使用同步方式处理
	if s.mqService == nil {
		s.generateAIReplySync(conversationID, userID, characterID, userMessage)
		return
	}

	// 创建 AI 回复消息
	message := &AIReplyMessage{
		ConversationID: conversationID,
		UserID:         userID,
		CharacterID:    characterID,
		UserMessage:    userMessage,
	}

	// 发布到消息队列
	if err := s.mqService.PublishAIReplyMessage(message); err != nil {
		// 如果发布失败，回退到同步处理
		log.Printf("Failed to publish AI reply message to MQ: %v, falling back to sync processing", err)
		s.generateAIReplySync(conversationID, userID, characterID, userMessage)
	}
}

// generateAIReplySync 同步生成 AI 回复（MQ 不可用时的回退方案）
func (s *PostcardService) generateAIReplySync(conversationID string, userID, characterID uint, userMessage string) {
	// 获取角色信息
	var character models.Character
	if err := s.db.First(&character, characterID).Error; err != nil {
		return
	}

	// 获取对话历史
	var history []models.Postcard
	s.db.Where("conversation_id = ?", conversationID).
		Order("created_at ASC").
		Find(&history)

	// 生成 AI 回复
	reply, err := s.aiService.GenerateReply(&character, history, userMessage)
	if err != nil {
		return
	}

	// 创建 AI 回复明信片
	aiPostcard := models.Postcard{
		ConversationID: conversationID,
		UserID:         userID, // 这里可能需要调整，或者创建一个系统用户
		CharacterID:    characterID,
		Type:           "ai",
		Content:        reply,
		Status:         "sent",
	}

	s.db.Create(&aiPostcard)
}
