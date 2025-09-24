package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"memory-postcard-backend/config"
	"memory-postcard-backend/internal/models"
	"net/http"
	"strings"
	"time"
)

type AIService struct {
	config *config.Config
	client *http.Client
}

type OpenAIRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	MaxTokens   int       `json:"max_tokens"`
	Temperature float64   `json:"temperature"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []Choice  `json:"choices"`
	Error   *APIError `json:"error,omitempty"`
}

type Choice struct {
	Message Message `json:"message"`
}

type APIError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
}

func NewAIService(cfg *config.Config) *AIService {
	return &AIService{
		config: cfg,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GenerateReply 生成 AI 回复
func (s *AIService) GenerateReply(character *models.Character, history []models.Postcard, userMessage string) (string, error) {
	if s.config.OpenAIAPIKey == "" {
		return s.generateMockReply(character, userMessage), nil
	}

	// 构建对话上下文
	messages := s.buildConversationContext(character, history, userMessage)

	// 调用 OpenAI API
	request := OpenAIRequest{
		Model:       "gpt-3.5-turbo",
		Messages:    messages,
		MaxTokens:   500,
		Temperature: 0.8,
	}

	response, err := s.callOpenAI(request)
	if err != nil {
		// 如果 API 调用失败，返回模拟回复
		return s.generateMockReply(character, userMessage), nil
	}

	if len(response.Choices) == 0 {
		return s.generateMockReply(character, userMessage), nil
	}

	return response.Choices[0].Message.Content, nil
}

// buildConversationContext 构建对话上下文
func (s *AIService) buildConversationContext(character *models.Character, history []models.Postcard, userMessage string) []Message {
	messages := []Message{
		{
			Role: "system",
			Content: fmt.Sprintf(`你是一个名叫"%s"的角色。角色描述：%s

请以这个角色的身份回复用户的明信片。回复应该：
1. 符合角色的性格特点
2. 语气自然、温暖
3. 长度适中（100-300字）
4. 体现明信片交流的温馨感觉
5. 可以适当询问用户的近况或分享角色的想法`, character.Name, character.Description),
		},
	}

	// 添加历史对话（最近5条）
	start := 0
	if len(history) > 5 {
		start = len(history) - 5
	}

	for i := start; i < len(history); i++ {
		postcard := history[i]
		role := "user"
		if postcard.UserID == 0 { // 假设系统回复的 UserID 为 0
			role = "assistant"
		}
		messages = append(messages, Message{
			Role:    role,
			Content: postcard.Content,
		})
	}

	// 添加当前用户消息
	messages = append(messages, Message{
		Role:    "user",
		Content: userMessage,
	})

	return messages
}

// callOpenAI 调用 OpenAI API
func (s *AIService) callOpenAI(request OpenAIRequest) (*OpenAIResponse, error) {
	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", s.config.OpenAIBaseURL+"/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.config.OpenAIAPIKey)

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	var response OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if response.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", response.Error.Message)
	}

	return &response, nil
}

// generateMockReply 生成模拟回复（当 AI 服务不可用时）
func (s *AIService) generateMockReply(character *models.Character, userMessage string) string {
	templates := []string{
		"收到你的明信片真是太开心了！%s 看起来你过得很充实呢。我最近也在思考一些有趣的事情，希望能和你分享更多。",
		"谢谢你的来信！%s 你的话让我想起了很多美好的回忆。期待我们下次的交流。",
		"读到你的明信片让我的一天都变得明亮起来。%s 希望你也能感受到这份温暖。",
		"你的明信片就像一缕阳光照进了我的心里。%s 让我们继续保持这样美好的联系吧。",
	}

	// 简单的情感分析
	sentiment := "neutral"
	lowerMessage := strings.ToLower(userMessage)
	if strings.Contains(lowerMessage, "开心") || strings.Contains(lowerMessage, "高兴") || strings.Contains(lowerMessage, "快乐") {
		sentiment = "happy"
	} else if strings.Contains(lowerMessage, "难过") || strings.Contains(lowerMessage, "伤心") || strings.Contains(lowerMessage, "沮丧") {
		sentiment = "sad"
	}

	var contextualResponse string
	switch sentiment {
	case "happy":
		contextualResponse = "看到你这么开心，我也跟着高兴起来了！"
	case "sad":
		contextualResponse = "听起来你最近有些不太顺心，希望我的回信能给你带来一些安慰。"
	default:
		contextualResponse = "感谢你和我分享你的想法。"
	}

	// 随机选择一个模板
	templateIndex := int(time.Now().Unix()) % len(templates)
	template := templates[templateIndex]

	return fmt.Sprintf(template, contextualResponse)
}

// GenerateImage 生成角色自拍图片（占位符实现）
func (s *AIService) GenerateImage(character *models.Character, context string) (string, error) {
	// 这里可以集成 DALL-E 或其他图像生成 API
	// 目前返回占位符
	return "", fmt.Errorf("image generation not implemented")
}
