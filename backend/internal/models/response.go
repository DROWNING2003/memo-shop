package models

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type PaginatedResponse struct {
	Items      interface{} `json:"items"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

type UploadResponse struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
}

// 成功响应
func Success(data interface{}) APIResponse {
	return APIResponse{
		Code:    200,
		Message: "success",
		Data:    data,
	}
}

// 错误响应
func Error(code int, message string) APIResponse {
	return APIResponse{
		Code:    code,
		Message: message,
	}
}

// 分页响应
func Paginated(items interface{}, total int64, page, pageSize int) APIResponse {
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return APIResponse{
		Code:    200,
		Message: "success",
		Data: PaginatedResponse{
			Items:      items,
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	}
}
