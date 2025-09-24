package utils

import (
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// GenerateFileName 生成唯一的文件名
func GenerateFileName(originalName string) string {
	ext := filepath.Ext(originalName)
	name := strings.TrimSuffix(originalName, ext)
	timestamp := time.Now().Unix()
	uuid := uuid.New().String()[:8]
	return fmt.Sprintf("%s_%d_%s%s", name, timestamp, uuid, ext)
}

// IsValidImageType 检查是否为有效的图片类型
func IsValidImageType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
	}

	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}
	return false
}

// IsValidAudioType 检查是否为有效的音频类型
func IsValidAudioType(contentType string) bool {
	validTypes := []string{
		"audio/mpeg",
		"audio/mp3",
		"audio/wav",
		"audio/ogg",
	}

	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}
	return false
}

// GetFileExtension 根据 Content-Type 获取文件扩展名
func GetFileExtension(contentType string) string {
	switch contentType {
	case "image/jpeg", "image/jpg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	case "audio/mpeg", "audio/mp3":
		return ".mp3"
	case "audio/wav":
		return ".wav"
	case "audio/ogg":
		return ".ogg"
	default:
		return ""
	}
}
