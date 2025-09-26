package services

import (
	"bytes"
	"context"
	"fmt"
	"memory-postcard-backend/config"
	"memory-postcard-backend/internal/models"
	"memory-postcard-backend/internal/utils"
	"mime/multipart"
	"net/http"

	"github.com/minio/minio-go/v7"
)

type UploadService struct {
	minio  *minio.Client
	config *config.Config
}

func NewUploadService(minio *minio.Client, cfg *config.Config) *UploadService {
	return &UploadService{
		minio:  minio,
		config: cfg,
	}
}

// UploadImage 上传图片（带压缩功能）
func (s *UploadService) UploadImage(file *multipart.FileHeader) (*models.UploadResponse, error) {
	// 检查文件类型
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// 读取文件头部来检测 MIME 类型
	buffer := make([]byte, 512)
	_, err = src.Read(buffer)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// 重置文件指针
	src.Seek(0, 0)

	contentType := http.DetectContentType(buffer)
	if !utils.IsValidImageType(contentType) {
		return nil, fmt.Errorf("invalid image type: %s", contentType)
	}

	// 检查图片是否需要压缩
	needsCompression, err := utils.IsImageTooLarge(file, 1920, 1080)
	if err != nil {
		return nil, fmt.Errorf("failed to check image dimensions: %w", err)
	}

	var compressedData []byte
	var finalContentType string
	var finalSize int64

	if needsCompression {
		// 压缩图片
		compressedData, finalContentType, err = utils.CompressImage(file, utils.DefaultImageConfig)
		if err != nil {
			return nil, fmt.Errorf("failed to compress image: %w", err)
		}
		finalSize = utils.GetFileSize(compressedData)
	} else {
		// 不需要压缩，直接使用原文件
		finalContentType = contentType
		finalSize = file.Size
	}

	// 生成文件名
	fileName := utils.GenerateFileName(file.Filename)
	objectName := fmt.Sprintf("images/%s", fileName)

	// 上传到 MinIO
	ctx := context.Background()

	if needsCompression {
		// 上传压缩后的图片数据
		reader := bytes.NewReader(compressedData)
		_, err = s.minio.PutObject(ctx, s.config.MinIOBucketName, objectName, reader, finalSize, minio.PutObjectOptions{
			ContentType: finalContentType,
		})
	} else {
		// 上传原文件
		_, err = s.minio.PutObject(ctx, s.config.MinIOBucketName, objectName, src, finalSize, minio.PutObjectOptions{
			ContentType: finalContentType,
		})
	}

	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// 生成访问 URL
	url := s.generateURL(objectName)

	return &models.UploadResponse{
		URL:        url,
		Filename:   fileName,
		Size:       finalSize,
		Compressed: needsCompression,
	}, nil
}

// UploadAudio 上传音频文件
func (s *UploadService) UploadAudio(file *multipart.FileHeader) (*models.UploadResponse, error) {
	// 检查文件类型
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// 读取文件头部来检测 MIME 类型
	buffer := make([]byte, 512)
	_, err = src.Read(buffer)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// 重置文件指针
	src.Seek(0, 0)

	contentType := http.DetectContentType(buffer)
	if !utils.IsValidAudioType(contentType) {
		return nil, fmt.Errorf("invalid audio type: %s", contentType)
	}

	// 生成文件名
	fileName := utils.GenerateFileName(file.Filename)
	objectName := fmt.Sprintf("audio/%s", fileName)

	// 上传到 MinIO
	ctx := context.Background()
	_, err = s.minio.PutObject(ctx, s.config.MinIOBucketName, objectName, src, file.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// 生成访问 URL
	url := s.generateURL(objectName)

	return &models.UploadResponse{
		URL:      url,
		Filename: fileName,
		Size:     file.Size,
	}, nil
}

// UploadAvatar 上传头像
func (s *UploadService) UploadAvatar(file *multipart.FileHeader) (*models.UploadResponse, error) {
	// 检查文件大小（限制为 2MB）
	if file.Size > 2*1024*1024 {
		return nil, fmt.Errorf("file size too large, maximum 2MB allowed")
	}

	// 检查文件类型
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// 读取文件头部来检测 MIME 类型
	buffer := make([]byte, 512)
	_, err = src.Read(buffer)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// 重置文件指针
	src.Seek(0, 0)

	contentType := http.DetectContentType(buffer)
	if !utils.IsValidImageType(contentType) {
		return nil, fmt.Errorf("invalid image type: %s", contentType)
	}

	// 生成文件名
	fileName := utils.GenerateFileName(file.Filename)
	objectName := fmt.Sprintf("avatars/%s", fileName)

	// 上传到 MinIO
	ctx := context.Background()
	_, err = s.minio.PutObject(ctx, s.config.MinIOBucketName, objectName, src, file.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// 生成访问 URL
	url := s.generateURL(objectName)

	return &models.UploadResponse{
		URL:      url,
		Filename: fileName,
		Size:     file.Size,
	}, nil
}

// DeleteFile 删除文件
func (s *UploadService) DeleteFile(objectName string) error {
	ctx := context.Background()
	err := s.minio.RemoveObject(ctx, s.config.MinIOBucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

// generateURL 生成文件访问 URL
func (s *UploadService) generateURL(objectName string) string {
	// 如果配置了公共访问基础URL，则使用该URL
	if s.config.MinIOPublicBaseURL != "" {
		return fmt.Sprintf("%s/%s/%s", s.config.MinIOPublicBaseURL, s.config.MinIOBucketName, objectName)
	}

	// 否则使用内部端点（仅适用于内部访问）
	protocol := "http"
	if s.config.MinIOUseSSL {
		protocol = "https"
	}
	return fmt.Sprintf("%s://%s/%s/%s", protocol, s.config.MinIOEndpoint, s.config.MinIOBucketName, objectName)
}

// GetFileInfo 获取文件信息
func (s *UploadService) GetFileInfo(objectName string) (*minio.ObjectInfo, error) {
	ctx := context.Background()
	info, err := s.minio.StatObject(ctx, s.config.MinIOBucketName, objectName, minio.StatObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}
	return &info, nil
}
