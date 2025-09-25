package models

import (
	"time"

	"gorm.io/gorm"
)

type Postcard struct {
	ID                  uint           `json:"id" gorm:"primaryKey"`
	ConversationID      string         `json:"conversation_id" gorm:"size:36;not null;index"`
	UserID              uint           `json:"user_id" gorm:"not null;index"`
	CharacterID         uint           `json:"character_id" gorm:"not null;index"`
	Type                string         `json:"type" gorm:"type:enum('user','ai');default:'user';not null"`
	Content             string         `json:"content" gorm:"type:text;not null"`
	ImageURL            string         `json:"image_url" gorm:"size:255"`
	AIGeneratedImageURL string         `json:"ai_generated_image_url" gorm:"size:255"`
	VoiceURL            string         `json:"voice_url" gorm:"size:255"`
	PostcardTemplate    string         `json:"postcard_template" gorm:"size:100"`
	Status              string         `json:"status" gorm:"type:enum('draft','sent','delivered','read');default:'sent'"`
	IsFavorite          bool           `json:"is_favorite" gorm:"default:false"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联关系
	User      User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Character Character `json:"character,omitempty" gorm:"foreignKey:CharacterID"`
}

type Draft struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	UserID            uint      `json:"user_id" gorm:"not null;index"`
	CharacterID       uint      `json:"character_id" gorm:"not null;index"`
	Content           string    `json:"content" gorm:"type:text"`
	LandscapeImageURL string    `json:"landscape_image_url" gorm:"size:255"`
	EmotionTags       string    `json:"emotion_tags" gorm:"type:json"`
	TemplateID        string    `json:"template_id" gorm:"size:100"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`

	User      User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Character Character `json:"character,omitempty" gorm:"foreignKey:CharacterID"`
}

type Favorite struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	UserID          uint      `json:"user_id" gorm:"not null;index"`
	FavoritableType string    `json:"favoritable_type" gorm:"type:enum('character','postcard');not null"`
	FavoritableID   uint      `json:"favoritable_id" gorm:"not null"`
	CreatedAt       time.Time `json:"created_at"`

	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type PostcardCreateRequest struct {
	CharacterID      uint   `json:"character_id" binding:"required"`
	Type             string `json:"type" binding:"required,oneof=user ai"`
	Content          string `json:"content" binding:"required"`
	ImageURL         string `json:"image_url" binding:"max=255"`
	VoiceURL         string `json:"voice_url" binding:"max=255"`
	PostcardTemplate string `json:"postcard_template" binding:"max=100"`
	ConversationID   string `json:"conversation_id" binding:"max=36"`
}

type PostcardUpdateRequest struct {
	Content          string `json:"content"`
	ImageURL         string `json:"image_url" binding:"max=255"`
	VoiceURL         string `json:"voice_url" binding:"max=255"`
	PostcardTemplate string `json:"postcard_template" binding:"max=100"`
	Status           string `json:"status" binding:"oneof=draft sent delivered read"`
	IsFavorite       *bool  `json:"is_favorite"`
}

type PostcardListQuery struct {
	Page           int    `form:"page,default=1" binding:"min=1"`
	PageSize       int    `form:"page_size,default=20" binding:"min=1,max=100"`
	ConversationID string `form:"conversation_id"`
	CharacterID    uint   `form:"character_id"`
	Type           string `form:"type" binding:"omitempty,oneof=all user ai"`
	Status         string `form:"status" binding:"omitempty,oneof=draft sent delivered read"`
	IsFavorite     *bool  `form:"is_favorite"`
	SortBy         string `form:"sort_by,default=created_at" binding:"oneof=created_at updated_at"`
	SortOrder      string `form:"sort_order,default=desc" binding:"oneof=asc desc"`
}

type DraftCreateRequest struct {
	CharacterID       uint   `json:"character_id" binding:"required"`
	Content           string `json:"content"`
	LandscapeImageURL string `json:"landscape_image_url" binding:"max=255"`
	EmotionTags       string `json:"emotion_tags"`
	TemplateID        string `json:"template_id" binding:"max=100"`
}

type DraftUpdateRequest struct {
	Content           string `json:"content"`
	LandscapeImageURL string `json:"landscape_image_url" binding:"max=255"`
	EmotionTags       string `json:"emotion_tags"`
	TemplateID        string `json:"template_id" binding:"max=100"`
}
