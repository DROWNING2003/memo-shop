package handlers

import (
	"memory-postcard-backend/internal/middleware"
	"memory-postcard-backend/internal/models"
	"memory-postcard-backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CharacterHandler struct {
	characterService *services.CharacterService
}

func NewCharacterHandler(characterService *services.CharacterService) *CharacterHandler {
	return &CharacterHandler{
		characterService: characterService,
	}
}

// CreateCharacter 创建角色
// @Summary 创建角色
// @Description 创建新的AI角色。avatar_url 应该通过 /api/upload/character-avatar 接口上传获得
// @Tags 角色
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.CharacterCreateRequest true "角色信息"
// @Success 200 {object} models.APIResponse{data=models.Character}
// @Failure 400 {object} models.APIResponse
// @Router /api/characters [post]
func (h *CharacterHandler) CreateCharacter(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	var req models.CharacterCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	character, err := h.characterService.CreateCharacter(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(character))
}

// GetCharacter 获取角色详情
// @Summary 获取角色详情
// @Description 根据ID获取角色的详细信息
// @Tags 角色
// @Produce json
// @Param id path int true "角色ID"
// @Success 200 {object} models.APIResponse{data=models.Character}
// @Failure 404 {object} models.APIResponse
// @Router /api/characters/{id} [get]
func (h *CharacterHandler) GetCharacter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "Invalid character ID"))
		return
	}

	// 获取当前用户ID（可选）
	userID, _ := middleware.GetCurrentUserID(c)
	var userIDPtr *uint
	if userID != 0 {
		userIDPtr = &userID
	}

	character, err := h.characterService.GetCharacter(uint(id), userIDPtr)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Error(404, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(character))
}

// ListCharacters 获取角色列表
// @Summary 获取角色列表
// @Description 分页获取角色列表，支持筛选和搜索
// @Tags 角色
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Param visibility query string false "可见性" Enums(private,public)
// @Param creator_id query int false "创建者ID"
// @Param search query string false "搜索关键词"
// @Param sort_by query string false "排序字段" default(created_at) Enums(created_at,popularity_score,usage_count)
// @Param sort_order query string false "排序方向" default(desc) Enums(asc,desc)
// @Success 200 {object} models.APIResponse{data=models.PaginatedResponse}
// @Router /api/characters [get]
func (h *CharacterHandler) ListCharacters(c *gin.Context) {
	var query models.CharacterListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	// 获取当前用户ID（可选）
	userID, _ := middleware.GetCurrentUserID(c)
	var userIDPtr *uint
	if userID != 0 {
		userIDPtr = &userID
	}

	result, err := h.characterService.ListCharacters(&query, userIDPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(result))
}

// UpdateCharacter 更新角色
// @Summary 更新角色
// @Description 更新角色信息（仅创建者可操作）
// @Tags 角色
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "角色ID"
// @Param request body models.CharacterUpdateRequest true "更新信息"
// @Success 200 {object} models.APIResponse{data=models.Character}
// @Failure 400 {object} models.APIResponse
// @Router /api/characters/{id} [put]
func (h *CharacterHandler) UpdateCharacter(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "Invalid character ID"))
		return
	}

	var req models.CharacterUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	character, err := h.characterService.UpdateCharacter(uint(id), userID, &req)
	if err != nil {
		if err.Error() == "permission denied" {
			c.JSON(http.StatusForbidden, models.Error(403, err.Error()))
			return
		}
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(character))
}

// DeleteCharacter 删除角色
// @Summary 删除角色
// @Description 删除角色（仅创建者可操作）
// @Tags 角色
// @Security BearerAuth
// @Param id path int true "角色ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Router /api/characters/{id} [delete]
func (h *CharacterHandler) DeleteCharacter(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "Invalid character ID"))
		return
	}

	err = h.characterService.DeleteCharacter(uint(id), userID)
	if err != nil {
		if err.Error() == "permission denied" {
			c.JSON(http.StatusForbidden, models.Error(403, err.Error()))
			return
		}
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(nil))
}

// GetMyCharacters 获取我创建的角色
// @Summary 获取我创建的角色
// @Description 获取当前用户创建的所有角色
// @Tags 角色
// @Produce json
// @Security BearerAuth
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginatedResponse}
// @Router /api/characters/my [get]
func (h *CharacterHandler) GetMyCharacters(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	var query models.CharacterListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	// 设置创建者ID为当前用户
	query.CreatorID = userID

	result, err := h.characterService.ListCharacters(&query, &userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(result))
}
