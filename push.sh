#!/bin/bash
cd "/Users/mac/Documents/Claude/Projects/博客网站前后端2026-5-6"

echo "正在修复 CI 文件权限问题..."
git rm --cached .github/workflows/ci.yml 2>/dev/null
git commit --amend -m "Initial commit: full-stack blog with Nuxt3 + Hono + PostgreSQL" --no-edit

echo "正在推送到 GitHub..."
git push -u origin main

echo ""
echo "✅ 推送完成！"
echo "仓库地址: https://github.com/csy14796687732-cloud/blog"
