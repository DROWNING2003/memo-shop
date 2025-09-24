package services

import (
	"encoding/json"
	"fmt"
	"log"
	"memory-postcard-backend/config"
	"time"

	"github.com/streadway/amqp"
)

// MQService 消息队列服务（只包含生产者）
type MQService struct {
	config *config.Config
	conn   *amqp.Connection
	ch     *amqp.Channel
}

// AIReplyMessage AI 回复消息结构
type AIReplyMessage struct {
	ConversationID string `json:"conversation_id"`
	UserID         uint   `json:"user_id"`
	CharacterID    uint   `json:"character_id"`
	UserMessage    string `json:"user_message"`
}

// NewMQService 创建 MQ 服务
func NewMQService(cfg *config.Config) (*MQService, error) {
	mq := &MQService{
		config: cfg,
	}

	// 连接 RabbitMQ
	if err := mq.connect(); err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	// 声明队列
	if err := mq.declareQueue(); err != nil {
		return nil, fmt.Errorf("failed to declare queue: %w", err)
	}

	return mq, nil
}

// connect 连接到 RabbitMQ
func (s *MQService) connect() error {
	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/",
		s.config.RabbitMQUser,
		s.config.RabbitMQPassword,
		s.config.RabbitMQHost,
		s.config.RabbitMQPort)

	var err error
	s.conn, err = amqp.Dial(connStr)
	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	s.ch, err = s.conn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open channel: %w", err)
	}

	log.Println("Successfully connected to RabbitMQ")
	return nil
}

// declareQueue 声明队列
func (s *MQService) declareQueue() error {
	_, err := s.ch.QueueDeclare(
		"ai_reply_queue", // 队列名称
		true,             // 持久化
		false,            // 自动删除
		false,            // 排他性
		false,            // 不等待
		nil,              // 参数
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	log.Println("Successfully declared queue: ai_reply_queue")
	return nil
}

// PublishAIReplyMessage 发布 AI 回复消息
func (s *MQService) PublishAIReplyMessage(message *AIReplyMessage) error {
	// 序列化消息
	body, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	// 发布消息
	err = s.ch.Publish(
		"",               // 交换机
		"ai_reply_queue", // 路由键
		false,            // 强制
		false,            // 立即
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent, // 持久化消息
			Timestamp:    time.Now(),
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	log.Printf("Published AI reply message: conversation_id=%s, user_id=%d, character_id=%d",
		message.ConversationID, message.UserID, message.CharacterID)
	return nil
}

// Close 关闭连接
func (s *MQService) Close() {
	if s.ch != nil {
		s.ch.Close()
	}
	if s.conn != nil {
		s.conn.Close()
	}
	log.Println("MQ service closed")
}
