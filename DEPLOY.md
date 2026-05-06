# 免费部署指南 — Vercel + Neon PostgreSQL

本指南将帮助你把博客项目**完全免费**部署到线上，支持动态 API、数据库、评论等功能。

## 架构说明

部署后架构如下：

```
用户浏览器
    │
    ▼
Vercel (前端 Nuxt SSR)
    ├── /          → 前端页面 (Nuxt Server-Side Rendering)
    ├── /api/*     → 代理到后端 API
    └── /_nuxt/*   → 静态资源
    │
    ▼
Vercel (后端 Hono Serverless)
    ├── /api/auth/*
    ├── /api/posts/*
    └── 其他 API 端点
    │
    ▼
Neon PostgreSQL (免费云数据库)
```

## 前置准备

- 一个 [GitHub](https://github.com) 账号
- 一个 [Vercel](https://vercel.com) 账号（用 GitHub 登录）
- 一个 [Neon](https://neon.tech) 账号（用 GitHub 登录）

## 第一步：推送代码到 GitHub

```bash
cd /Users/mac/Documents/Claude/Projects/博客网站前后端2026-5-6

# 初始化 Git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit: blog project"

# 推送到 GitHub (替换为你的仓库地址)
git remote add origin https://github.com/YOUR_USERNAME/your-blog-repo.git
git branch -M main
git push -u origin main
```

## 第二步：创建 Neon 数据库（免费）

1. 打开 [neon.tech](https://neon.tech) 并用 GitHub 登录
2. 点击 **Create a project**
3. 输入项目名称（如 `blog-db`），选择区域（选离你最近的）
4. 点击 **Create project**
5. 等待数据库创建完成（约 10 秒）
6. 在 **Connection Details** 中，复制 **Connection string**（长这样）：
   ```
   postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
   ```
   保存好这个地址，稍后要用到。

## 第三步：部署后端 API（Vercel 项目一）

### 3.1 登录 Vercel

打开 [vercel.com](https://vercel.com) 用 GitHub 登录。

### 3.2 导入后端项目

1. 点击 **Add New... → Project**
2. 选择你的 GitHub 仓库
3. 在 **Configure Project** 页面：

   - **Root Directory**：改为 `packages/backend`
   - **Framework Preset**：选择 `Other`
   - **Build Command**：
     ```
     cd ../.. && npx turbo run build --filter=@blog/backend
     ```
   - **Install Command**：
     ```
     cd ../.. && pnpm install --filter=@blog/backend...
     ```
   - **Output Directory**：留空

### 3.3 配置环境变量

点击 **Environment Variables**，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `你的 Neon 连接地址` | 从第二步复制的 |
| `JWT_SECRET` | `自己编一个长随机字符串` | 比如 `my-super-secret-jwt-key-2024` |
| `JWT_EXPIRES_IN` | `7d` | Token 有效期 |
| `ADMIN_EMAIL` | `admin@blog.com` | 管理员邮箱 |
| `ADMIN_PASSWORD` | `自己设一个密码` | 管理员密码 |
| `NUXT_PUBLIC_SITE_URL` | `https://你的前端域名.vercel.app` | 先随便填，部署前端后再更新 |

### 3.4 部署

点击 **Deploy**，等待构建完成。部署成功后会得到一个域名，如：
```
https://your-blog-backend.vercel.app
```

记下这个域名，后面需要用到。

## 第四步：运行数据库迁移

在本地执行数据库迁移（因为 Neon 是云数据库，从你本地连就行）：

```bash
# 设置环境变量（替换为你的 Neon 连接地址）
export DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"

# 运行迁移
cd packages/backend
npx drizzle-kit migrate
```

迁移完成后，管理员账号会自动在第一次 API 调用时创建。

> **验证**：访问 `https://your-blog-backend.vercel.app/api/health`，如果返回 `{"success":true}` 说明后端部署成功！

## 第五步：部署前端（Vercel 项目二）

### 5.1 回到 Vercel 新建项目

1. 点击 **Add New... → Project**
2. 再次选择同一个 GitHub 仓库
3. 在 **Configure Project** 页面：

   - **Root Directory**：改为 `packages/frontend`
   - **Framework Preset**：选择 `Nuxt.js`（Vercel 会自动识别）
   - **Build Command**：保持默认
   - **Install Command**：
     ```
     cd ../.. && pnpm install --filter=@blog/frontend...
     ```

### 5.2 配置环境变量

| 变量名 | 值 |
|--------|-----|
| `NUXT_PUBLIC_API_BASE` | `https://your-blog-backend.vercel.app` |
| `NUXT_PUBLIC_SITE_URL` | 部署后会自动生成，先留空或填 `https://your-blog-frontend.vercel.app` |

### 5.3 更新前端 vercel.json

打开 `packages/frontend/vercel.json`，把 `your-backend.vercel.app` 替换为你的实际后端域名：

```json
"rewrites": [
  { "source": "/api/(.*)", "destination": "https://你的后端域名.vercel.app/api/$1" }
]
```

提交这个修改并推送到 GitHub：

```bash
git add packages/frontend/vercel.json
git commit -m "Update backend API URL"
git push
```

### 5.4 部署

点击 **Deploy**，等待构建完成。

部署成功后访问你的前端域名，博客就上线了！

## 第六步：登录后台

1. 访问 `https://你的前端域名.vercel.app/auth/login`
2. 使用管理员邮箱和密码登录
3. 登录后进入后台：`/admin`，就可以：
   - 写文章（支持 Markdown）
   - 管理分类和标签
   - 审核评论
   - 查看数据统计

## 后续优化（可选）

### 图片上传

Vercel Serverless 没有持久化文件系统，上传的图片会丢失。推荐使用：

**Cloudinary（免费，10GB）**：
1. 注册 [cloudinary.com](https://cloudinary.com)
2. 获取 Cloud Name 和 Upload Preset
3. 在前端直接上传到 Cloudinary，把返回的 URL 存入文章

### 自定义域名

在 Vercel 项目设置中添加你自己的域名（需要先购买域名）。

### 自动迁移

创建一个 GitHub Actions workflow，在每次部署时自动运行数据库迁移：

```yaml
# .github/workflows/migrate.yml
name: Run Database Migrations
on:
  push:
    branches: [main]
    paths:
      - 'packages/backend/drizzle/**'
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --filter=@blog/backend...
      - run: cd packages/backend && npx drizzle-kit migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 免费额度说明

| 服务 | 免费额度 | 是否够用 |
|------|----------|----------|
| **Vercel** | 100GB 带宽/月，6000 分钟构建/月 | ✅ 个人博客完全够用 |
| **Neon** | 0.5GB 存储，100 小时计算/月 | ✅ 小流量博客够用 |
| **GitHub** | 无限公共仓库 | ✅ |

## 常见问题

### Q: 部署后 API 返回 504 超时？

A: Neon 免费数据库在无活动后会休眠（cold start），首次访问需要 5-10 秒唤醒。这是正常的，可以升级到付费版解决。

### Q: 前端页面刷新后 404？

A: 确保 `packages/frontend/vercel.json` 中的 rewrites 正确配置了后端 API 地址。

### Q: 怎么更新文章？

A: 登录后台 `/admin`，进入文章管理，点击编辑即可在线更新。文章保存在 Neon 数据库中。

### Q: 可以绑定自己的域名吗？

A: 可以。在 Vercel 项目设置的 Domains 中添加你的域名，然后配置 DNS 即可。
