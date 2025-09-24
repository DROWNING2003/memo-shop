package models

import (
	"time"

	"gorm.io/gorm"
)

type Character struct {
	ID              uint    `json:"id" gorm:"primaryKey"`
	CreatorID       uint    `json:"creator_id" gorm:"index"`
	Name            string  `json:"name" gorm:"size:100;not null"`
	Description     string  `json:"description" gorm:"type:text;not null"`
	AvatarURL       string  `json:"avatar_url" gorm:"size:255"`
	Visibility      string  `json:"visibility" gorm:"type:enum('private','public');default:'public'"`
	IsActive        bool    `json:"is_active" gorm:"default:true"`
	UsageCount      int     `json:"usage_count" gorm:"default:0"`
	PopularityScore float64 `json:"popularity_score" gorm:"type:decimal(3,2);default:0.00"`

	// 用户角色设定
	UserRoleName string `json:"user_role_name" gorm:"size:50;not null"`
	UserRoleDesc string `json:"user_role_desc" gorm:"size:200;not null"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联关系
	Creator   *User                   `json:"creator,omitempty" gorm:"foreignKey:CreatorID"`
	Voices    []CharacterVoice        `json:"voices,omitempty" gorm:"foreignKey:CharacterID"`
	Relations []UserCharacterRelation `json:"relations,omitempty" gorm:"foreignKey:CharacterID"`
	Postcards []Postcard              `json:"postcards,omitempty" gorm:"foreignKey:CharacterID"`
	Drafts    []Draft                 `json:"drafts,omitempty" gorm:"foreignKey:CharacterID"`
}

type CharacterVoice struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CharacterID uint      `json:"character_id" gorm:"not null;index"`
	VoiceURL    string    `json:"voice_url" gorm:"size:255;not null"`
	FileFormat  string    `json:"file_format" gorm:"type:enum('mp3','wav');not null"`
	FileSize    int       `json:"file_size"`
	Duration    int       `json:"duration"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Character Character `json:"character,omitempty" gorm:"foreignKey:CharacterID"`
}

type UserCharacterRelation struct {
	ID          uint `json:"id" gorm:"primaryKey"`
	UserID      uint `json:"user_id" gorm:"not null;index"`
	CharacterID uint `json:"character_id" gorm:"not null;index"`

	LastInteractionAt *time.Time `json:"last_interaction_at"`
	InteractionCount  int        `json:"interaction_count" gorm:"default:0"`
	IsFavorite        bool       `json:"is_favorite" gorm:"default:false"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`

	User      User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Character Character `json:"character,omitempty" gorm:"foreignKey:CharacterID"`
}

type CharacterCreateRequest struct {
	Name         string `json:"name" binding:"required,max=100"`
	Description  string `json:"description" binding:"required"`
	AvatarURL    string `json:"avatar_url" binding:"max=255"`
	Visibility   string `json:"visibility" binding:"oneof=private public"`
	UserRoleName string `json:"user_role_name" binding:"required,max=50"`
	UserRoleDesc string `json:"user_role_desc" binding:"required,max=200"`
}

type CharacterUpdateRequest struct {
	Name         string `json:"name" binding:"max=100"`
	Description  string `json:"description"`
	AvatarURL    string `json:"avatar_url" binding:"max=255"`
	Visibility   string `json:"visibility" binding:"oneof=private public"`
	IsActive     *bool  `json:"is_active"`
	UserRoleName string `json:"user_role_name" binding:"max=50"`
	UserRoleDesc string `json:"user_role_desc" binding:"max=200"`
}

type CharacterListQuery struct {
	Page       int    `form:"page,default=1" binding:"min=1"`
	PageSize   int    `form:"page_size,default=20" binding:"min=1,max=100"`
	Visibility string `form:"visibility" binding:"omitempty,oneof=private public"`
	CreatorID  uint   `form:"creator_id"`
	Search     string `form:"search"`
	SortBy     string `form:"sort_by,default=created_at" binding:"oneof=created_at popularity_score usage_count"`
	SortOrder  string `form:"sort_order,default=desc" binding:"oneof=asc desc"`
}
