# AI Tools Directory - 开发文档

## 项目简介

一个展示 GitHub 热门 AI 工具的目录网站，实时从 GitHub 获取热门项目数据。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **数据源**: GitHub API

## 项目结构

```
ai-tools-website/
├── app/
│   ├── api/tools/route.ts   # GitHub API 代理接口
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 主页面组件
├── components/               # 组件目录 (可扩展)
├── lib/                      # 工具函数目录
├── data/                     # 静态数据目录
├── public/                   # 静态资源
├── SPEC.md                   # 项目规格说明书
├── package.json              # 项目依赖
├── next.config.js            # Next.js 配置
├── tailwind.config.js        # Tailwind 配置
├── postcss.config.js         # PostCSS 配置
└── tsconfig.json             # TypeScript 配置
```

## 快速开始

### 1. 安装依赖

```bash
cd ai-tools-website
npm install
```

### 2. 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 生产构建

```bash
npm run build
npm start
```

## 主要功能

### 数据获取

- 从 GitHub API 获取热门 AI 工具数据
- 内置缓存机制（30分钟）
- 包含 25+ 精选 AI 工具

### 页面功能

- 🔍 实时搜索
- 📂 分类筛选（LLM、图像生成、自动化、开发工具等）
- ⭐ 按星标/更新时间/名称排序
- 📱 响应式布局

### 自定义工具列表

修改 `app/api/tools/route.ts` 中的 `FALLBACK_TOOLS` 数组：

```typescript
const FALLBACK_TOOLS = [
  {
    id: 1,
    name: '工具名称',
    full_name: 'owner/repo',
    description: '工具描述',
    html_url: 'https://github.com/owner/repo',
    stargazers_count: 10000,
    forks_count: 1000,
    language: 'Python',
    topics: ['ai', 'machine-learning'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { 
      avatar_url: 'https://avatars.githubusercontent.com/...', 
      login: 'owner' 
    }
  },
  // 添加更多...
]
```

### 添加新页面

在 `app/` 目录下创建新文件：

```typescript
// app/about/page.tsx
export default function About() {
  return <h1>关于页面</h1>
}
```

### 自定义样式

修改 `app/globals.css`：

```css
:root {
  --background: #0a0a0f;    /* 背景色 */
  --card: #12121a;          /* 卡片背景 */
  --primary: #6366f1;       /* 主色调 */
  --accent: #22d3ee;        /* 强调色 */
  --border: #1e1e2e;        /* 边框色 */
}
```

修改 `tailwind.config.js` 添加自定义颜色和字体。

## 部署

### 方式1: Vercel (推荐)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 方式2: 自己的服务器

```bash
# 构建
npm run build

# 使用 PM2 运行
pm2 start npm --name "ai-tools" -- start

# 或直接运行
npm start
```

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

构建运行：
```bash
docker build -t ai-tools .
docker run -p 3000:3000 ai-tools
```

## 环境变量

如需使用 GitHub API Token，创建 `.env.local`：

```env
GITHUB_TOKEN=your_github_token_here
```

## 常见问题

### 1. GitHub API 限流

项目已内置缓存机制，默认缓存 30 分钟。如仍有限流问题：

- 添加 GitHub Token（见上方环境变量）
- 或使用静态数据（默认 fallback）

### 2. 图片加载失败

检查网络连接，确保能访问 `avatars.githubusercontent.com`

### 3. 样式问题

确保 Tailwind CSS 正确安装：

```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 扩展开发

### 添加新组件

在 `components/` 目录创建：

```typescript
// components/ToolCard.tsx
export function ToolCard({ tool }: { tool: any }) {
  return (
    <div className="tool-card">
      <h3>{tool.name}</h3>
    </div>
  )
}
```

### 添加新 API

在 `app/api/` 创建新路由：

```typescript
// app/api/categories/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 1, name: 'LLM' },
    { id: 2, name: '图像生成' }
  ])
}
```

## 许可证

MIT License
