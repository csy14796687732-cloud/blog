# 个人博客

一个基于前沿技术的个人博客前后端分离应用，包含完整的前台展示、后台管理、用户系统和数据统计功能。

## 技术栈

### 前端
- **Nuxt 3** — Vue 全栈框架（SSR + SSG）
- **Vue 3** — Composition API + `<script setup>`
- **TypeScript** — 类型安全
- **Tailwind CSS v4** — 原子化 CSS
- **Pinia** — 状态管理
- **VueUse** — 组合式工具库
- **Shiki** — 代码高亮

### 后端
- **Hono** — 轻量级 API 框架
- **TypeScript** — 类型安全
- **Drizzle ORM** — 类型安全的 SQL ORM
- **PostgreSQL** — 关系型数据库
- **JWT** — 用户认证
- **Zod** — 数据验证
- **Bcrypt** — 密码加密

### 工程化
- **pnpm** — 包管理器（workspace 模式）
- **Turborepo** — 构建缓存与编排
- **Docker + Docker Compose** — 容器化部署
- **GitHub Actions** — CI/CD

## 功能特性

- [x] 用户注册与登录（JWT 认证）
- [x] 文章 CRUD（Markdown 编辑器）
- [x] 文章分类与标签管理
- [x] 文章评论系统（用户评论 + 后台审核）
- [x] 文章点赞功能
- [x] 搜索功能（按标题/内容/标签）
- [x] 后台管理面板（数据统计仪表盘）
- [x] 草稿/发布工作流
- [x] 黑暗模式 / 明亮模式切换
- [x] 响应式设计（移动端优先）
- [x] RSS 订阅
- [x] SEO 优化
- [x] 图片上传
- [x] 社交分享

## 环境要求

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose（推荐）
- PostgreSQL 16（本地开发）

## 快速开始

### 使用 Docker（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/blog.git
cd blog

# 2. 配置环境变量
cp .env.example .env

# 3. 启动所有服务
docker compose up -d

# 4. 访问
# 前台: http://localhost:3000
# 后台: http://localhost/admin
# API: http://localhost:3001/api

# 默认管理员账号: admin@blog.com / admin123
```

### 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 启动数据库（需要 Docker）
docker compose -f docker-compose.dev.yml up -d

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接等

# 4. 运行数据库迁移
pnpm db:generate
pnpm db:migrate

# 5. 启动开发服务器
pnpm dev

# 6. 访问
# 前台: http://localhost:3000
# 后台: http://localhost:3000/admin
# API: http://localhost:3001/api
```

## 项目目录结构

```
blog/
├── .github/workflows/     # CI/CD 配置
├── docker/                # Docker 配置
├── packages/
│   ├── frontend/          # Nuxt 3 前端应用
│   │   └── app/
│   │       ├── components/  # 可复用组件
│   │       ├── composables/ # 组合式函数
│   │       ├── layouts/     # 页面布局
│   │       ├── middleware/  # 路由中间件
│   │       ├── pages/       # 页面文件
│   │       ├── stores/      # Pinia 状态仓库
│   │       └── assets/      # 静态资源
│   ├── backend/           # Hono API 后端
│   │   └── src/
│   │       ├── routes/     # API 路由
│   │       ├── middleware/ # 中间件
│   │       ├── services/   # 业务逻辑
│   │       └── db/         # 数据库
│   └── shared/            # 共享代码
│       └── src/
│           ├── types/      # 类型定义
│           ├── validations/ # Zod 验证
│           └── utils/      # 工具函数
├── docker-compose.yml
└── docker-compose.dev.yml
```

## 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接地址 | `postgresql://blog:blog123@localhost:5432/blog` |
| `JWT_SECRET` | JWT 密钥 | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` |
| `NUXT_PUBLIC_API_BASE` | API 地址 | `http://localhost:3001/api` |
| `NUXT_PUBLIC_SITE_URL` | 站点 URL | `http://localhost:3000` |
| `UPLOAD_DIR` | 上传目录 | `./uploads` |
| `MAX_FILE_SIZE` | 最大文件大小（字节） | `5242880` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@blog.com` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` |

## API 文档

完整 API 文档请参考 [ARCHITECTURE.md](ARCHITECTURE.md) 中的 API 设计章节。

### 主要 API 端点

- `POST /api/auth/register` — 用户注册
- `POST /api/auth/login` — 用户登录
- `GET /api/posts` — 获取文章列表
- `GET /api/posts/slug/:slug` — 通过 slug 获取文章
- `POST /api/posts` — 创建文章（需 admin）
- `GET /api/categories` — 获取全部分类
- `GET /api/tags` — 获取全部标签
- `GET /api/search?q=keyword` — 搜索文章
- `GET /api/rss` — RSS Feed

## 部署指南

### Docker 部署

```bash
# 构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

### 手动部署

```bash
# 构建前端
pnpm --filter @blog/frontend build

# 构建后端
pnpm --filter @blog/backend build

# 启动后端
cd packages/backend
node dist/index.js

# 启动前端（使用 Node 服务器）
cd packages/frontend
node .output/server/index.mjs
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交修改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

## 许可证

MIT License
