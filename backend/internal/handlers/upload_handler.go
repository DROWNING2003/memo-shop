package handlers

import (
	"memory-postcard-backend/internal/middleware"
	"memory-postcard-backend/internal/models"
	"memory-postcard-backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	uploadService *services.UploadService
}

func NewUploadHandler(uploadService *services.UploadService) *UploadHandler {
	return &UploadHandler{
		uploadService: uploadService,
	}
}

// UploadImage 上传图片
// @Summary 上传图片
// @Description 上传图片文件到服务器
// @Tags 文件上传
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "图片文件"
// @Success 200 {object} models.APIResponse{data=models.UploadResponse}
// @Failure 400 {object} models.APIResponse
// @Router /api/upload/image [post]
func (h *UploadHandler) UploadImage(c *gin.Context) {
	_, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "No file uploaded"))
		return
	}

	// 检查文件大小（限制为 50MB）
	if file.Size > 5*10*1024*1024 {
		c.JSON(http.StatusBadRequest, models.Error(400, "File size too large, maximum 10MB allowed"))
		return
	}

	response, err := h.uploadService.UploadImage(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(response))
}

// UploadAvatar 上传头像
// @Summary 上传头像
// @Description 上传用户头像
// @Tags 文件上传
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "头像文件"
// @Success 200 {object} models.APIResponse{data=models.UploadResponse}
// @Failure 400 {object} models.APIResponse
// @Router /api/upload/avatar [post]
func (h *UploadHandler) UploadAvatar(c *gin.Context) {
	_, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "No file uploaded"))
		return
	}

	response, err := h.uploadService.UploadAvatar(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(response))
}

// UploadAudio 上传音频
// @Summary 上传音频
// @Description 上传音频文件（用于角色声音）
// @Tags 文件上传
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "音频文件"
// @Success 200 {object} models.APIResponse{data=models.UploadResponse}
// @Failure 400 {object} models.APIResponse
// @Router /api/upload/audio [post]
func (h *UploadHandler) UploadAudio(c *gin.Context) {
	_, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "No file uploaded"))
		return
	}

	// 检查文件大小（限制为 50MB）
	if file.Size > 5*50*1024*1024 {
		c.JSON(http.StatusBadRequest, models.Error(400, "File size too large, maximum 50MB allowed"))
		return
	}

	response, err := h.uploadService.UploadAudio(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(response))
}

// UploadCharacterAvatar 上传角色头像
// @Summary 上传角色头像
// @Description 上传角色头像图片
// @Tags 文件上传
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "角色头像文件"
// @Success 200 {object} models.APIResponse{data=models.UploadResponse}
// @Failure 400 {object} models.APIResponse
// @Router /api/upload/character-avatar [post]
func (h *UploadHandler) UploadCharacterAvatar(c *gin.Context) {
	_, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "No file uploaded"))
		return
	}

	response, err := h.uploadService.UploadAvatar(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(response))
}
