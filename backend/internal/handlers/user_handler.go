package handlers

import (
	"memory-postcard-backend/internal/middleware"
	"memory-postcard-backend/internal/models"
	"memory-postcard-backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// Register 用户注册
// @Summary 用户注册
// @Description 创建新用户账户
// @Tags 用户
// @Accept json
// @Produce json
// @Param request body models.UserCreateRequest true "注册信息"
// @Success 200 {object} models.APIResponse{data=models.UserResponse}
// @Failure 400 {object} models.APIResponse
// @Router /api/auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var req models.UserCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	user, err := h.userService.Register(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(user))
}

// Login 用户登录
// @Summary 用户登录
// @Description 用户登录获取访问令牌
// @Tags 用户
// @Accept json
// @Produce json
// @Param request body models.UserLoginRequest true "登录信息"
// @Success 200 {object} models.APIResponse{data=models.LoginResponse}
// @Failure 400 {object} models.APIResponse
// @Router /api/auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var req models.UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	response, err := h.userService.Login(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(response))
}

// GetProfile 获取用户资料
// @Summary 获取用户资料
// @Description 获取当前用户的详细信息
// @Tags 用户
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.APIResponse{data=models.UserResponse}
// @Failure 401 {object} models.APIResponse
// @Router /api/users/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	user, err := h.userService.GetProfile(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Error(404, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(user))
}

// UpdateProfile 更新用户资料
// @Summary 更新用户资料
// @Description 更新当前用户的个人信息
// @Tags 用户
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.UserUpdateRequest true "更新信息"
// @Success 200 {object} models.APIResponse{data=models.UserResponse}
// @Failure 400 {object} models.APIResponse
// @Router /api/users/profile [put]
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := middleware.GetCurrentUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Error(401, "Unauthorized"))
		return
	}

	var req models.UserUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	user, err := h.userService.UpdateProfile(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.Success(user))
}

// GetUserByID 根据ID获取用户信息
// @Summary 根据ID获取用户信息
// @Description 获取指定用户的公开信息
// @Tags 用户
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} models.APIResponse{data=models.UserResponse}
// @Failure 404 {object} models.APIResponse
// @Router /api/users/{id} [get]
func (h *UserHandler) GetUserByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Error(400, "Invalid user ID"))
		return
	}

	user, err := h.userService.GetProfile(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, models.Error(404, err.Error()))
		return
	}

	// 隐藏敏感信息
	user.Email = ""

	c.JSON(http.StatusOK, models.Success(user))
}
