package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Username     string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Email        string         `json:"email" gorm:"uniqueIndex;size:100;not null"`
	PasswordHash string         `json:"-" gorm:"size:255;not null"`
	Nickname     string         `json:"nickname" gorm:"size:50"`
	AvatarURL    string         `json:"avatar_url" gorm:"size:255"`
	Signature    string         `json:"signature" gorm:"size:200"`
	Language     string         `json:"language" gorm:"size:10;default:'zh-CN'"`
	FontSize     string         `json:"font_size" gorm:"type:enum('small','medium','large');default:'medium'"`
	DarkMode     bool           `json:"dark_mode" gorm:"default:false"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联关系
	Characters []Character `json:"characters,omitempty" gorm:"foreignKey:CreatorID"`
	Postcards  []Postcard  `json:"postcards,omitempty" gorm:"foreignKey:UserID"`
	Drafts     []Draft     `json:"drafts,omitempty" gorm:"foreignKey:UserID"`
	Favorites  []Favorite  `json:"favorites,omitempty" gorm:"foreignKey:UserID"`
}

type UserCreateRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Nickname string `json:"nickname" binding:"max=50"`
}

type UserLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserUpdateRequest struct {
	Nickname  string `json:"nickname" binding:"max=50"`
	AvatarURL string `json:"avatar_url" binding:"max=255"`
	Signature string `json:"signature" binding:"max=200"`
	Language  string `json:"language" binding:"max=10"`
	FontSize  string `json:"font_size" binding:"oneof=small medium large"`
	DarkMode  *bool  `json:"dark_mode"`
}

type UserResponse struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Nickname  string    `json:"nickname"`
	AvatarURL string    `json:"avatar_url"`
	Signature string    `json:"signature"`
	Language  string    `json:"language"`
	FontSize  string    `json:"font_size"`
	DarkMode  bool      `json:"dark_mode"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
