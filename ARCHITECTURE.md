# 系统架构文档

## 系统架构图（文字描述）

```
┌─────────────────────────────────────────────────────────┐
│                       用户浏览器                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx (反向代理)                       │
│              http://localhost:80                         │
└──────┬──────────────────┬──────────────────────────────┘
       │                  │
       ▼                  ▼
┌──────────────┐  ┌──────────────┐
│   Frontend   │  │   Backend    │
│  Nuxt 3 SSR  │  │  Hono API    │
│  :3000       │  │  :3001       │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │                 ▼
       │          ┌──────────────┐
       │          │  PostgreSQL  │
       │          │  :5432       │
       │          └──────────────┘
       │
       ▼
┌──────────────┐
│  Static      │
│  Files       │
└──────────────┘
```

## 前端架构

### Nuxt 3 工作方式

本项目采用 Nuxt 3 的 Universal 渲染模式（SSR + SSG）：

1. **SSR（服务端渲染）**：首次请求时，Nuxt 在服务端渲染 Vue 组件，生成 HTML 返回给浏览器
2. **Hydration**：浏览器加载 HTML 后，Vue 在客户端激活，成为 SPA
3. **SSG（静态生成）**：首页、文章列表等页面预渲染为静态 HTML
4. **客户端导航**：页面切换通过 Vue Router 在前端进行，无需重新加载

### 目录结构说明

```
frontend/app/
├── components/     # 可复用组件（自动导入）
│   ├── admin/      # 后台管理组件
│   ├── auth/       # 认证相关组件
│   ├── blog/       # 博客展示组件
│   ├── common/     # 通用 UI 组件
│   └── layout/     # 布局组件
├── composables/    # 组合式函数（自动导入）
├── layouts/        # 页面布局
├── middleware/     # 路由中间件
├── pages/         # 页面文件（文件路由）
├── stores/        # Pinia 状态仓库
└── server/        # API 代理（可选）
```

### 数据流

```
页面组件 → Composable → API 请求 → Pinia Store → 组件响应式更新
                     ↓
               Nuxt Server Routes (代理)
                     ↓
               Hono API Backend
```

## 后端架构

### Hono 路由与中间件

Hono 是一个轻量级、高性能的 API 框架。路由和中间件按以下方式组织：

```
请求进入
    │
    ▼
CORS 中间件 (全局)
    │
    ▼
路由匹配 (/api/auth/*, /api/posts/*, 等)
    │
    ▼
认证中间件 (按需)
    │
    ▼
验证中间件 (按需，使用 Zod)
    │
    ▼
路由处理器 → 服务层 → 数据库
    │
    ▼
统一响应格式 { success, message, data }
```

### 中间件链

1. **错误处理中间件** — 全局异常捕获，统一错误响应
2. **认证中间件** — JWT token 验证，注入用户信息
3. **管理员中间件** — 角色权限验证
4. **验证中间件** — 请求数据 Zod 验证

## 数据流说明

### 认证流程

```
用户提交登录表单
    │
    ▼
前端 POST /api/auth/login
    │
    ▼
后端验证邮箱和密码
    │
    ▼
生成 JWT Token (含 userId, role)
    │
    ▼
返回 Token + 用户信息
    │
    ▼
前端存储 Token (localStorage)
    │
    ▼
后续请求通过 Authorization Header 携带 Token
    │
    ▼
后端中间件验证 Token，注入用户信息
```

### 文章发布流程

```
管理员创建/编辑文章
    │
    ▼
选择状态 (draft / published)
    │
    ▼
POST/PUT /api/posts
    │
    ▼
生成唯一 slug
    │
    ▼
保存文章，建立标签关联
    │
    ▼
如为发布状态，设置 published_at
    │
    ▼
返回完善的文章数据（含关联信息）
```

## 数据库 ER 图（文字描述）

```
┌─────────┐       ┌──────────────┐       ┌──────────┐
│  users  │       │    posts     │       │comments  │
├─────────┤       ├──────────────┤       ├──────────┤
│ id (PK) │◄──────│ author_id    │       │ id (PK)  │
│ username│       │ id (PK)      │◄──────│ post_id  │
│ email   │       │ title        │       │ user_id  │◄────┐
│ password│       │ slug (UNIQUE)│       │ content  │     │
│ role    │       │ content      │       │ status   │     │
└─────────┘       │ category_id  │◄──┐   │parent_id │─────┘
                  │ status       │   │   └──────────┘
                  │ featured     │   │
                  │ view_count   │   │   ┌──────────┐
                  │ published_at │   │   │  likes   │
                  └──────────────┘   │   ├──────────┤
                       │    │        │   │ id (PK)  │
                       │    │        │   │ user_id  │◄────┐
                       │    │        │   │ post_id  │─────┤
                       │    │        │   │ UNIQUE   │     │
                       │    │        │   └──────────┘     │
                       │    │        │                     │
                 ┌─────┘    │        │   ┌──────────┐     │
                 ▼          │        │   │category  │─────┘
          ┌──────────┐      │        │   ├──────────┤
          │ post_tags│      │        └───│ id (PK)  │
          ├──────────┤      │            │ name     │
          │ post_id  │──────┘            │ slug     │
          │ tag_id   │──────┐            └──────────┘
          └──────────┘      │
                            │     ┌──────────┐
                            │     │  tags    │
                            │     ├──────────┤
                            └─────│ id (PK)  │
                                  │ name     │
                                  │ slug     │
                                  └──────────┘

┌────────────┐
│ page_views │
├────────────┤
│ id (PK)    │
│ post_id    │
│ ip         │
│ path       │
│ created_at │
└────────────┘
```

## 部署架构

### Docker Compose 生产环境

```
┌──────────────────────────────────────────┐
│              Docker Host                  │
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │  Nginx   │  │PostgreSQL│             │
│  │  :80     │  │  :5432   │             │
│  └────┬─────┘  └──────────┘             │
│       │                                  │
│  ┌────┴─────┐  ┌──────────┐             │
│  │ Frontend │  │ Backend  │             │
│  │  :3000   │  │  :3001   │             │
│  └──────────┘  └──────────┘             │
└──────────────────────────────────────────┘
```

### 网络流向

```
用户 → Nginx (:80)
    ├── /api/* → Backend (:3001) → PostgreSQL
    ├── /uploads/* → Backend (:3001)
    ├── /_nuxt/* → Frontend (:3000) (静态资源)
    └── /* → Frontend (:3000) (SSR 页面)
```

## 关键设计决策

### 1. Monorepo 架构

**决策**：使用 pnpm workspace + Turborepo 管理多包仓库。

**理由**：
- 共享类型定义和验证规则，前后端一致
- 统一的构建和测试流程
- 简化依赖管理
- Turborepo 提供增量构建缓存

### 2. Nuxt 3 + Hono 组合

**决策**：前端使用 Nuxt 3（Vue），后端使用 Hono（TypeScript）。

**理由**：
- Nuxt 3 提供 SSR/SSG 双模式，有利于 SEO
- Hono 极致轻量，支持多个运行时（Bun/Node/Deno）
- 前后端统一使用 TypeScript，减少上下文切换

### 3. Drizzle ORM

**决策**：使用 Drizzle ORM 而非 Prisma 或 TypeORM。

**理由**：
- 类型安全：完整的 TypeScript 类型推断
- SQL-like API：更接近原生 SQL，学习成本低
- 轻量级：无代码生成步骤
- 性能优越：比 Prisma 更快

### 4. JWT 认证

**决策**：使用 JWT（无状态）而非 Session（有状态）。

**理由**：
- 无需服务端存储 session，易于水平扩展
- 前端可灵活处理 Token（localStorage/httpOnly cookie）
- 适用于前后端分离架构

### 5. Zod 共享验证

**决策**：在 shared 包中定义 Zod schema，前后端共用。

**理由**：
- 确保前后端验证规则一致
- 减少重复代码
- 类型安全：自动推导 TypeScript 类型

### 6. 评论审核机制

**决策**：用户发表评论后默认为待审核状态，需管理员审核通过。

**理由**：
- 防止垃圾评论
- 保护博客评论区环境
- 管理员可灵活控制审核策略

### 7. Tailwind CSS

**决策**：使用 Tailwind CSS 作为样式方案。

**理由**：
- 原子化 CSS，避免命名冲突
- 内置暗黑模式支持
- 响应式设计工具类
- 按需生成，构建体积小

### 8. 暗黑模式

**决策**：支持系统自动检测 + 手动切换，持久化到 localStorage。

**理由**：
- 提升用户体验
- 减少眼睛疲劳
- 符合现代 Web 应用标准
