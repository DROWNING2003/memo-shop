# 《回忆明信片》数据库设计文档

## 数据库概览

本文档描述了《回忆明信片》AI 角色明信片交流应用的数据库表结构设计。

## 表结构设计

### 1. 用户表 (users)

存储用户基本信息和账户数据。

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    signature VARCHAR(200) COMMENT '个性签名',
    language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言偏好',
    font_size ENUM('small', 'medium', 'large') DEFAULT 'medium' COMMENT '字体大小',
    dark_mode BOOLEAN DEFAULT FALSE COMMENT '深色模式',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT '软删除时间'
);
```

### 2. 角色表 (characters)

存储 AI 角色信息，包括预设角色和用户创建的角色。

```sql
CREATE TABLE characters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    creator_id BIGINT COMMENT '创建者ID，NULL表示系统预设角色',
    name VARCHAR(100) NOT NULL COMMENT '角色名称',
    description TEXT NOT NULL COMMENT '角色描述',
    avatar_url VARCHAR(255) COMMENT '角色头像URL',
    visibility ENUM('private', 'public') DEFAULT 'public' COMMENT '可见性',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    popularity_score DECIMAL(3,2) DEFAULT 0.00 COMMENT '人气分数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

### 4. 用户角色关系表 (user_character_relations)

记录用户与角色的互动关系和用户在对话中的角色设定。

```sql
CREATE TABLE user_character_relations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    character_id BIGINT NOT NULL COMMENT '角色ID',
    user_role_description VARCHAR(200) COMMENT '用户角色描述',
    relationship_type ENUM('friend', 'student', 'companion') COMMENT '关系类型',
    last_interaction_at TIMESTAMP COMMENT '最后互动时间',
    interaction_count INT DEFAULT 0 COMMENT '互动次数',
    is_favorite BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_user_character (user_id, character_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);
```

### 5. 明信片表 (postcards)

存储明信片交流记录，包括用户发送的和 AI 回复的。

```sql
CREATE TABLE postcards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id VARCHAR(36) NOT NULL COMMENT '对话ID，用于关联往来明信片',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    character_id BIGINT NOT NULL COMMENT '角色ID',
    content TEXT NOT NULL COMMENT '明信片内容',
    image_url VARCHAR(255) COMMENT '明信片图片URL（用户上传，可以为空）',
    ai_generated_image_url VARCHAR(255) COMMENT 'AI生成的角色自拍URL',
    postcard_template VARCHAR(100) COMMENT '明信片模板ID',
    status ENUM('draft', 'sent', 'delivered', 'read') DEFAULT 'sent' COMMENT '状态',
    is_favorite BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id),
    INDEX idx_user_character (user_id, character_id),
    INDEX idx_created_at (created_at)
);
```

### 6. 收藏表 (favorites)

统一管理用户的收藏内容。

```sql
CREATE TABLE favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    favoritable_type ENUM('character', 'postcard') NOT NULL COMMENT '收藏对象类型',
    favoritable_id BIGINT NOT NULL COMMENT '收藏对象ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_favorite (user_id, favoritable_type, favoritable_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_type (user_id, favoritable_type)
);
```

### 7. 草稿箱表 (drafts)

存储未发送的明信片草稿。

```sql
CREATE TABLE drafts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    character_id BIGINT NOT NULL COMMENT '目标角色ID',
    content TEXT COMMENT '草稿内容',
    landscape_image_url VARCHAR(255) COMMENT '上传的风景图片',
    emotion_tags JSON COMMENT '选择的情感标签',
    template_id VARCHAR(100) COMMENT '选择的模板ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_user_updated (user_id, updated_at)
);
```

## 索引策略

### 主要查询场景的索引优化

```sql
-- 角色搜索和筛选
CREATE INDEX idx_characters_search ON characters(character_type, visibility, is_active, popularity_score DESC);

-- 明信片对话查询
CREATE INDEX idx_postcards_conversation ON postcards(conversation_id, created_at);

-- 用户明信片列表
CREATE INDEX idx_postcards_user_list ON postcards(user_id, status, created_at DESC);

-- 角色互动统计
CREATE INDEX idx_relations_character ON user_character_relations(character_id, last_interaction_at DESC);

```