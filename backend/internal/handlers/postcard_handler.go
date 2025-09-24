package handlers

import (
	"memory-postcard-backend/internal/middleware"
	"memory-postcard-backend/internal/models"
	"memory-postcard-backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PostcardHandler struct {
	postcardService *services.PostcardService
}

func NewPostcardHandler(postcardService *services.PostcardService) *PostcardHandler {
	return &PostcardHandler{
		postcardService: postcardService,
	}
}

// CreatePostcard 创建明信片
// @Summary 创建明信片
// @Description 发送明信片给AI角色
// @Tags 明信片
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.PostcardCreateRequest true "明信片信息"
// @Success 200 {object} models.APIResponse{data=models.Postcard}
// @Failure 400 {object} models.APIResponse
// @Router /api/postcards [post]
func (h *PostcardHandler) CreatePostcard(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	var req models.PostcardCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	postcard, err := h.postcardService.CreatePostcard(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(postcard))
}

// GetPostcard 获取明信片详情
// @Summary 获取明信片详情
// @Description 根据ID获取明信片的详细信息
// @Tags 明信片
// @Produce json
// @Security BearerAuth
// @Param id path int true "明信片ID"
// @Success 200 {object} models.APIResponse{data=models.Postcard}
// @Failure 404 {object} models.APIResponse
// @Router /api/postcards/{id} [get]
func (h *PostcardHandler) GetPostcard(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "Invalid postcard ID"))
		return
	}

	postcard, err := h.postcardService.GetPostcard(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Error(404, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(postcard))
}

// ListPostcards 获取明信片列表
// @Summary 获取明信片列表
// @Description 分页获取用户的明信片列表
// @Tags 明信片
// @Produce json
// @Security BearerAuth
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Param conversation_id query string false "对话ID"
// @Param character_id query int false "角色ID"
// @Param status query string false "状态" Enums(draft,sent,delivered,read)
// @Param is_favorite query bool false "是否收藏"
// @Param sort_by query string false "排序字段" default(created_at) Enums(created_at,updated_at)
// @Param sort_order query string false "排序方向" default(desc) Enums(asc,desc)
// @Success 200 {object} models.APIResponse{data=models.PaginatedResponse}
// @Router /api/postcards [get]
func (h *PostcardHandler) ListPostcards(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	var query models.PostcardListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	result, err := h.postcardService.ListPostcards(userID, &query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(result))
}

// UpdatePostcard 更新明信片
// @Summary 更新明信片
// @Description 更新明信片信息
// @Tags 明信片
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "明信片ID"
// @Param request body models.PostcardUpdateRequest true "更新信息"
// @Success 200 {object} models.APIResponse{data=models.Postcard}
// @Failure 400 {object} models.APIResponse
// @Router /api/postcards/{id} [put]
func (h *PostcardHandler) UpdatePostcard(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "Invalid postcard ID"))
		return
	}

	var req models.PostcardUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	postcard, err := h.postcardService.UpdatePostcard(uint(id), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(postcard))
}

// DeletePostcard 删除明信片
// @Summary 删除明信片
// @Description 删除明信片
// @Tags 明信片
// @Security BearerAuth
// @Param id path int true "明信片ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Router /api/postcards/{id} [delete]
func (h *PostcardHandler) DeletePostcard(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "Invalid postcard ID"))
		return
	}

	err = h.postcardService.DeletePostcard(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(nil))
}

// GetConversation 获取对话记录
// @Summary 获取对话记录
// @Description 根据对话ID获取完整的对话记录
// @Tags 明信片
// @Produce json
// @Security BearerAuth
// @Param conversation_id path string true "对话ID"
// @Success 200 {object} models.APIResponse{data=[]models.Postcard}
// @Failure 404 {object} models.APIResponse
// @Router /api/postcards/conversations/{conversation_id} [get]
func (h *PostcardHandler) GetConversation(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	conversationID := c.Param("conversation_id")
	if conversationID == "" {
		c.JSON(http.StatusBadRequest, models.Error(400, "Conversation ID is required"))
		return
	}

	postcards, err := h.postcardService.GetConversation(conversationID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(postcards))
}

// GetPostcardsByConversationID 通过 conversation_id 获取明信片列表
// @Summary 通过 conversation_id 获取明信片列表
// @Description 根据 conversation_id 获取明信片列表
// @Tags 明信片
// @Produce json
// @Security BearerAuth
// @Param conversation_id path string true "对话ID"
// @Success 200 {object} models.APIResponse{data=[]models.Postcard}
// @Failure 404 {object} models.APIResponse
// @Router /api/postcards/conversation/{conversation_id} [get]
func (h *PostcardHandler) GetPostcardsByConversationID(c *gin.Context) {
	conversationID := c.Param("conversation_id")
	if conversationID == "" {
		c.JSON(http.StatusBadRequest, models.Error(400, "Conversation ID is required"))
		return
	}

	postcards, err := h.postcardService.GetPostcardsByConversationID(conversationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(postcards))
}
