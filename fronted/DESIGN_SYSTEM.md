# 回忆小卖部 - 设计系统

## 色彩系统

### 主色调 (Primary Colors)
- `text-primary-base` / `bg-primary-base`: #7FB069 - 柔和薄荷绿主色，传达自然治愈感
- `text-primary-lighter` / `bg-primary-lighter`: #A4C98A - 更浅的薄荷绿，用于悬停状态
- `text-primary-darker` / `bg-primary-darker`: #65935A - 深薄荷绿，用于强调

### 背景色系统
- `bg-page`: 淡绿到淡蓝的治愈渐变背景 (E8F5E8 → F0F8FF → E6F3FF)
- `glass-container-primary`: 主要玻璃拟态容器，半透明白色 (20% opacity + blur)
- `glass-container-secondary`: 次要玻璃容器，更轻透明 (10% opacity + blur)
- `glass-container-elevated`: 提升层级的玻璃效果 (30% opacity + blur)
- `glass-container-warm`: 温暖黄绿点缀的玻璃效果
- `glass-card`: 明信片卡片的精致玻璃效果 (25% opacity + blur)

### 文字色彩
- `text-primary`: #2D5016 85% opacity - 深绿主文字色，保持自然感
- `text-secondary`: #2D5016 65% opacity - 次要文字色
- `text-tertiary`: #2D5016 45% opacity - 三级文字色
- `text-quaternary`: #2D5016 25% opacity - 四级文字色
- `text-on-glass`: #2D5016 80% opacity - 玻璃容器上的文字
- `text-accent`: #7FB069 - 强调色文字，链接和可点击元素

### 功能色彩
精致治愈的功能色彩，用于标签和状态提示：
- `text-success` / `bg-success`: #81C784 - 成功状态的自然绿
- `bg-success-light`: #C8E6C9 60% opacity - 成功标签背景
- `text-error` / `bg-error`: #E57373 - 温和的错误红色
- `bg-error-light`: #FFCDD2 60% opacity - 错误标签背景
- `text-warning` / `bg-warning`: #FFB74D - 温暖的警告橙色
- `bg-warning-light`: #FFE0B2 60% opacity - 警告标签背景
- `text-info` / `bg-info`: #64B5F6 - 清新的信息蓝色
- `bg-info-light`: #BBDEFB 60% opacity - 信息标签背景

### 点缀色系
温暖点缀色系，用于情感化设计元素：
- `bg-accent-warm-yellow`: #F5E6A3 - 温暖黄色，用于特殊强调
- `bg-accent-soft-coral`: #FFB3BA - 柔和珊瑚色，用于情感元素
- `bg-accent-mint-blue`: #B3E5D1 - 薄荷蓝，用于辅助点缀
- `bg-accent-lavender`: #D4C5F9 - 淡紫色，用于梦幻效果

## 字体系统

### 字体栈
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif
```

### 字体大小和权重
- **Caption**: 10px / 400 - 底部导航文字标签
- **Body small**: 12px / 400 - 小号正文
- **Body default**: 14px / 400 - 默认正文
- **Card Title / Emphasized Text**: 14px / 500 - 卡片标题和强调文字
- **Page Title**: 18px / 600 - 页面标题
- **Headline**: 24px / 700 - 大标题
- **Display**: 32px / 700 - 展示标题

### 行高
- **Line Height**: 1.5 - 舒适的行高，增强可读性

## 圆角系统

精致的圆角设计，营造柔和治愈感：
- **Small**: 8px - 小元素如按钮内图标
- **Medium**: 12px - 输入框、小卡片
- **Large**: 16px - 主要卡片和容器
- **Extra Large**: 20px - 大型卡片和明信片
- **Full**: 9999px - 头像、标签、开关按钮

## 间距系统

### 间距比例
- **Base Unit**: 4px
- **Tight**: 8px - 紧密相关的元素
- **Compact**: 12px - 列表项和小间距
- **Standard**: 16px - 标准内边距和外边距
- **Comfortable**: 24px - 舒适的区块间距
- **Spacious**: 32px - 宽松的页面布局

## 阴影系统

基于主色调的柔和阴影：
- **Soft**: `0 2px 8px rgba(127, 176, 105, 0.08), 0 1px 3px rgba(127, 176, 105, 0.12)`
- **Medium**: `0 4px 16px rgba(127, 176, 105, 0.12), 0 2px 6px rgba(127, 176, 105, 0.16)`
- **Strong**: `0 8px 32px rgba(127, 176, 105, 0.16), 0 4px 12px rgba(127, 176, 105, 0.2)`

## 玻璃拟态效果

### 容器类型
1. **Primary Container** (`.glass-container-primary`)
   - 背景: 20% 白色透明度
   - 模糊: 16px backdrop-blur
   - 边框: 1px 20% 白色透明边框
   - 阴影: Medium shadow

2. **Secondary Container** (`.glass-container-secondary`)
   - 背景: 10% 白色透明度
   - 模糊: 8px backdrop-blur
   - 边框: 1px 10% 白色透明边框

3. **Elevated Container** (`.glass-container-elevated`)
   - 背景: 30% 白色透明度
   - 模糊: 24px backdrop-blur
   - 边框: 1px 30% 白色透明边框
   - 阴影: Strong shadow

4. **Card Container** (`.glass-card`)
   - 背景: 25% 白色透明度
   - 模糊: 32px backdrop-blur
   - 边框: 1px 25% 白色透明边框
   - 阴影: Medium shadow

## 组件规范

### 按钮
- 高度: 32px (小), 40px (中), 48px (大)
- 圆角: Medium (12px)
- 内边距: 12px 16px
- 字体: 14px / 500

### 输入框
- 高度: 40px
- 圆角: Medium (12px)
- 内边距: 12px 16px
- 边框: 1px 透明 (使用玻璃效果)

### 卡片
- 圆角: Large (16px) 或 Extra Large (20px)
- 内边距: Standard (16px) 或 Comfortable (24px)
- 使用玻璃拟态效果

### 头像
- 尺寸: 24px, 32px, 40px, 48px, 64px
- 圆角: Full (9999px)
- 边框: 可选 2px 白色边框

## 动画效果

### 过渡时间
- **Fast**: 150ms - 小元素状态变化
- **Normal**: 300ms - 标准过渡
- **Slow**: 500ms - 大元素或复杂动画

### 缓动函数
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` - 标准材料设计缓动
- **Decelerate**: `cubic-bezier(0, 0, 0.2, 1)` - 减速
- **Accelerate**: `cubic-bezier(0.4, 0, 1, 1)` - 加速

### 常用动画
- **Hover Scale**: `transform: scale(1.02)` - 悬停放大
- **Press Scale**: `transform: scale(0.98)` - 按压缩小
- **Fade In**: `opacity: 0 → 1` - 淡入
- **Slide Up**: `transform: translateY(20px) → translateY(0)` - 上滑

## 响应式设计

### 断点
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### 移动端优先
- 基础样式针对移动端设计
- 使用 `min-width` 媒体查询向上扩展
- 触摸友好的交互区域 (最小 44px)

## 可访问性

### 对比度
- 正文文字: 至少 4.5:1
- 大文字 (18px+): 至少 3:1
- 非文字元素: 至少 3:1

### 焦点状态
- 明显的焦点指示器
- 2px 主色调边框
- 不依赖颜色传达信息

### 语义化
- 正确使用 HTML 语义标签
- 适当的 ARIA 标签
- 有意义的替代文本