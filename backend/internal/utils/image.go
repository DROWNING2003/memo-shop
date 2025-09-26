package utils

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"mime/multipart"

	"github.com/nfnt/resize"
)

// ImageConfig 图片压缩配置
type ImageConfig struct {
	MaxWidth  uint
	MaxHeight uint
	Quality   int // JPEG 质量 (1-100)
	Format    string
}

// DefaultImageConfig 默认图片压缩配置
var DefaultImageConfig = ImageConfig{
	MaxWidth:  1920,
	MaxHeight: 1080,
	Quality:   85,
	Format:    "jpeg",
}

// CompressImage 压缩图片
func CompressImage(file *multipart.FileHeader, config ImageConfig) ([]byte, string, error) {
	// 打开文件
	src, err := file.Open()
	if err != nil {
		return nil, "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// 解码图片
	img, format, err := image.Decode(src)
	if err != nil {
		return nil, "", fmt.Errorf("failed to decode image: %w", err)
	}

	// 获取原始尺寸
	bounds := img.Bounds()
	width := uint(bounds.Dx())
	height := uint(bounds.Dy())

	// 计算缩放比例
	var newWidth, newHeight uint
	if width > config.MaxWidth || height > config.MaxHeight {
		// 按比例缩放
		ratio := float64(width) / float64(height)
		if ratio > 1 {
			// 宽图
			newWidth = config.MaxWidth
			newHeight = uint(float64(newWidth) / ratio)
			if newHeight > config.MaxHeight {
				newHeight = config.MaxHeight
				newWidth = uint(float64(newHeight) * ratio)
			}
		} else {
			// 高图
			newHeight = config.MaxHeight
			newWidth = uint(float64(newHeight) * ratio)
			if newWidth > config.MaxWidth {
				newWidth = config.MaxWidth
				newHeight = uint(float64(newWidth) / ratio)
			}
		}
	} else {
		// 不需要缩放
		newWidth = width
		newHeight = height
	}

	// 缩放图片
	if newWidth != width || newHeight != height {
		img = resize.Resize(newWidth, newHeight, img, resize.Lanczos3)
	}

	// 编码图片
	var buf bytes.Buffer
	var contentType string

	switch config.Format {
	case "jpeg", "jpg":
		contentType = "image/jpeg"
		err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: config.Quality})
	case "png":
		contentType = "image/png"
		err = png.Encode(&buf, img)
	default:
		// 保持原格式
		contentType = "image/" + format
		switch format {
		case "jpeg":
			err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: config.Quality})
		case "png":
			err = png.Encode(&buf, img)
		default:
			return nil, "", fmt.Errorf("unsupported image format: %s", format)
		}
	}

	if err != nil {
		return nil, "", fmt.Errorf("failed to encode image: %w", err)
	}

	return buf.Bytes(), contentType, nil
}

// GetImageDimensions 获取图片尺寸
func GetImageDimensions(file *multipart.FileHeader) (width, height int, err error) {
	src, err := file.Open()
	if err != nil {
		return 0, 0, err
	}
	defer src.Close()

	img, _, err := image.DecodeConfig(src)
	if err != nil {
		return 0, 0, err
	}

	return img.Width, img.Height, nil
}

// IsImageTooLarge 检查图片是否过大需要压缩
func IsImageTooLarge(file *multipart.FileHeader, maxWidth, maxHeight int) (bool, error) {
	width, height, err := GetImageDimensions(file)
	if err != nil {
		return false, err
	}

	return width > maxWidth || height > maxHeight, nil
}

// GetFileSize 获取文件大小
func GetFileSize(data []byte) int64 {
	return int64(len(data))
}

// CreateFileHeaderFromBytes 从字节数据创建 FileHeader
func CreateFileHeaderFromBytes(data []byte, filename, contentType string) *multipart.FileHeader {
	return &multipart.FileHeader{
		Filename: filename,
		Size:     int64(len(data)),
		Header: map[string][]string{
			"Content-Type": {contentType},
		},
	}
}
