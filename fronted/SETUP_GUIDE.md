# 回忆小卖部 - 前端设置指南

## 项目完成情况

✅ **已完成的功能**
- 清新治愈拟物风格设计系统
- 深色/浅色主题切换
- 用户认证系统（登录/注册）
- 明信片日记首页
- 角色广场页面
- 个人中心页面
- 底部导航组件
- API客户端集成
- 响应式移动端设计

## 快速开始

### 1. 安装依赖
```bash
cd fronted
npm install
```

### 2. 环境配置
确保 `.env` 文件包含正确的API地址：
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
打开浏览器访问 `http://localhost:3000`

## 页面路由

| 路径 | 页面 | 描述 |
|------|------|------|
| `/` | 根页面 | 自动重定向到登录或首页 |
| `/login` | 登录页面 | 用户登录 |
| `/register` | 注册页面 | 用户注册 |
| `/home` | 明信片日记首页 | 查看和管理明信片 |
| `/characters` | 角色广场 | 浏览和选择AI角色 |
| `/profile` | 个人中心 | 用户资料和设置 |
| `/postcards/create` | 创建明信片 | 写新明信片 |

## 设计特色

### 🎨 清新治愈风格
- 柔和的渐变色彩
- 拟物化阴影效果
- 毛玻璃背景
- 圆润的边角设计

### 🌙 主题系统
- 自动适配系统主题
- 手动切换深色/浅色模式
- 一致的色彩变量系统

### 📱 移动端优化
- 响应式布局
- 触摸友好的交互
- 底部导航设计
- 安全区域适配

## 组件架构

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # 主要页面路由组
│   │   ├── home/          # 首页
│   │   ├── characters/    # 角色广场
│   │   ├── profile/       # 个人中心
│   │   └── postcards/     # 明信片相关
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   └── layout.tsx         # 根布局
├── components/            # 组件库
│   ├── ui/               # shadcn/ui 组件
│   ├── auth-guard.tsx    # 认证守卫
│   ├── theme-provider.tsx # 主题提供者
│   └── BottomNavigation.tsx # 底部导航
├── lib/                  # 工具库
│   └── api.ts           # API 客户端
└── types/               # 类型定义
    └── api.ts          # API 类型
```

## API 集成

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/users/profile` - 获取用户资料

### 明信片相关
- `GET /api/postcards` - 获取明信片列表
- `POST /api/postcards` - 创建明信片
- `GET /api/postcards/{id}` - 获取明信片详情

### 角色相关
- `GET /api/characters` - 获取角色列表
- `GET /api/characters/{id}` - 获取角色详情
- `POST /api/characters` - 创建角色

## 开发注意事项

### 1. 后端依赖
确保后端API服务正在运行在 `http://localhost:8080`

### 2. 认证流程
- JWT Token存储在localStorage
- 自动添加到API请求头
- Token过期自动跳转登录

### 3. 错误处理
- API错误统一处理
- 用户友好的错误提示
- 网络异常重试机制

### 4. 性能优化
- 组件懒加载
- 图片优化
- API请求缓存

## 待完善功能

### 🚧 开发中
- [ ] 明信片详情页面
- [ ] 角色详情页面
- [ ] 对话记录查看
- [ ] 文件上传功能
- [ ] 搜索功能优化

### 🎯 计划中
- [ ] 实时消息推送
- [ ] 明信片模板系统
- [ ] 社交分享功能
- [ ] PWA支持
- [ ] 国际化支持

## 故障排除

### 构建错误
如果遇到TypeScript错误，大部分是现有代码的问题，新实现的功能应该可以正常工作。

### API连接问题
1. 检查后端服务是否启动
2. 确认API地址配置正确
3. 查看浏览器网络面板

### 样式问题
1. 确保Tailwind CSS正确配置
2. 检查CSS变量定义
3. 验证主题切换功能

## 贡献指南

1. 保持代码风格一致
2. 添加适当的TypeScript类型
3. 遵循组件设计原则
4. 测试响应式布局
5. 确保可访问性

## 联系支持

如有问题，请检查：
1. 控制台错误信息
2. 网络请求状态
3. 本地存储数据
4. API服务状态