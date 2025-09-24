package services

import (
	"memory-postcard-backend/config"

	"github.com/go-redis/redis/v8"
	"github.com/minio/minio-go/v7"
	"gorm.io/gorm"
)

type Services struct {
	User      *UserService
	Character *CharacterService
	Postcard  *PostcardService
	Upload    *UploadService
	AI        *AIService
}

func NewServices(db *gorm.DB, redis *redis.Client, minio *minio.Client, cfg *config.Config) *Services {
	uploadService := NewUploadService(minio, cfg)
	aiService := NewAIService(cfg)

	return &Services{
		User:      NewUserService(db, redis, cfg),
		Character: NewCharacterService(db, redis),
		Postcard:  NewPostcardService(db, redis, aiService),
		Upload:    uploadService,
		AI:        aiService,
	}
}
