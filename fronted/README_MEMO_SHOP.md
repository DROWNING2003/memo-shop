# 回忆小卖部 - 前端实现

## 项目概述

回忆小卖部是一个基于 AI 角色的明信片交流应用，采用清新治愈的拟物风格设计，让用户可以与 AI 角色分享心情和回忆。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI 库**: shadcn/ui + Tailwind CSS
- **状态管理**: Redux Toolkit
- **主题**: next-themes (支持深色/浅色模式)
- **图标**: Lucide React
- **动画**: Framer Motion
- **HTTP 客户端**: Axios

## 设计特色

### 清新治愈拟物风格

- 柔和的渐变色彩系统
- 拟物化阴影效果 (neumorphism)
- 毛玻璃效果 (backdrop-blur)
- 治愈系配色方案

### 响应式设计

- 移动端优先设计
- 自适应布局
- 触摸友好的交互

## 页面结构

```
/                    # 根页面 (重定向到登录或首页)
/login              # 登录页面
/register           # 注册页面
/home               # 明信片日记首页
/characters         # 角色广场
/profile            # 个人中心
/postcards/create   # 创建明信片
```

## 核心功能

### 1. 用户认证

- 邮箱密码登录/注册
- JWT Token 认证
- 自动登录状态检查

### 2. 明信片系统

- 创建明信片与 AI 角色对话
- 明信片列表展示
- 收藏功能
- 对话记录查看

### 3. 角色系统

- 角色广场浏览
- 角色详情查看
- 我的角色管理
- 角色筛选和搜索

### 4. 个人中心

- 用户资料管理
- 设置偏好
- 数据统计

## API 集成

基于 Swagger 文档实现的完整 API 客户端：

```typescript
// API客户端示例
const apiClient = new ApiClient();

// 用户相关
await apiClient.login({ email, password });
await apiClient.getUserProfile();

// 明信片相关
await apiClient.getPostcards();
await apiClient.createPostcard({ character_id, content });

// 角色相关
await apiClient.getCharacters();
await apiClient.getCharacter(id);
```

## 组件架构

### 布局组件

- `AuthGuard`: 认证守卫
- `ThemeProvider`: 主题提供者
- `BottomNavigation`: 底部导航

### 业务组件

- `PostcardList`: 明信片列表
- `PostcardCard`: 明信片卡片
- `CharacterGrid`: 角色网格
- `CharacterCard`: 角色卡片

### UI 组件

- 基于 shadcn/ui 的组件系统
- 自定义拟物风格样式

## 样式系统

### CSS 变量

```css
:root {
  /* 治愈色彩 */
  --healing-pink: 340 82% 92%;
  --healing-blue: 200 100% 94%;
  --healing-green: 142 76% 94%;
  --healing-yellow: 48 100% 92%;
  --healing-purple: 270 100% 96%;

  /* 拟物阴影 */
  --shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-strong: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

### 工具类

```css
.neumorphism {
  /* 拟物风格外凸效果 */
}

.neumorphism-inset {
  /* 拟物风格内凹效果 */
}

.postcard {
  /* 明信片样式 */
}

.healing-gradient-* {
  /* 治愈系渐变背景 */
}
```

## 开发指南

### 启动项目

```bash
cd fronted
npm install
npm run dev
```

### 构建项目

```bash
npm run build
npm start
```

### 环境配置

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 用户体验设计

### 交互反馈

- 卡片悬停动画
- 按钮点击反馈
- 加载状态提示
- 错误信息展示

### 视觉层次

- 清晰的信息架构
- 合理的视觉权重
- 一致的间距系统

### 情感化设计

- 温暖的色彩搭配
- 友好的文案提示
- 治愈系图标和装饰

## 性能优化

- 组件懒加载
- 图片优化
- API 请求缓存
- 代码分割

## 可访问性

- 语义化 HTML
- 键盘导航支持
- 屏幕阅读器友好
- 色彩对比度优化

## 后续规划

1. 添加更多明信片模板
2. 实现实时消息推送
3. 增加社交分享功能
4. 优化动画性能
5. 添加 PWA 支持

## 注意事项

- 确保后端 API 服务正常运行
- 检查环境变量配置
- 注意移动端适配
- 保持设计一致性
