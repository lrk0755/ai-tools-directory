'use client'

import { useState, useEffect, useMemo } from 'react'

// Types
interface Tool {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  topics: string[]
  updated_at: string
  owner: {
    avatar_url: string
    login: string
  }
}

type Category = '全部' | 'LLM' | '图像生成' | '自动化' | '开发工具' | '教育' | 'OpenClaw技能' | '教程'
type SortOption = 'stars' | 'updated' | 'name'

const categories: Category[] = ['全部', 'LLM', '图像生成', '自动化', '开发工具', '教育', 'OpenClaw技能', '教程']

const categoryKeywords: Record<string, string[]> = {
  'LLM': ['llm', 'gpt', 'language-model', 'chatgpt', 'ollama', ' llama'],
  '图像生成': ['diffusion', 'stable-diffusion', 'image-generation', 'ai-art', 'comfyui', 'sd-webui'],
  '自动化': ['automation', 'workflow', 'n8n', 'autogpt', 'agent', 'auto-agent'],
  '开发工具': ['developer-tools', 'cli', 'code', 'programming', 'developer'],
  '教育': ['tutorial', 'course', 'learn', 'education', 'beginner', 'learning'],
  'OpenClaw技能': ['openclaw', 'skill', 'mcp', 'tool', 'agent'],
  '教程': ['tutorial', 'course', 'learn', 'guide', 'docs', 'documentation', 'how-to'],
}

function categorizeTool(topics: string[], language: string): Category {
  const allTopics = [...topics, language?.toLowerCase() || ''].join(' ').toLowerCase()
  
  // First check for OpenClaw-related
  if (allTopics.includes('openclaw') || allTopics.includes('pi-mono')) {
    return 'OpenClaw技能'
  }
  
  // Then check other categories
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (cat === 'OpenClaw技能' || cat === '教程') continue
    if (keywords.some(k => allTopics.includes(k.toLowerCase()))) {
      return cat as Category
    }
  }
  
  // Check for tutorials
  if (topics.some(t => ['tutorial', 'course', 'learn', 'guide', 'docs'].includes(t.toLowerCase()))) {
    return '教程'
  }
  
  return '开发工具'
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}月前`
  return `${Math.floor(days / 365)}年前`
}

// Skeleton loader
function ToolCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-border" />
        <div className="flex-1">
          <div className="h-5 bg-border rounded w-3/4 mb-2" />
          <div className="h-4 bg-border rounded w-full mb-4" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 bg-border rounded-full" />
        <div className="h-6 w-20 bg-border rounded-full" />
      </div>
    </div>
  )
}

// Tool Card Component
function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const category = categorizeTool(tool.topics, tool.language)
  
  return (
    <a 
      href={tool.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-card border border-border rounded-xl p-6 glow-border animate-fade-in opacity-0 animate-delay-${(index % 5) + 1}`}
    >
      <div className="flex items-start gap-4">
        <img 
          src={tool.owner.avatar_url}
          alt={tool.owner.login}
          className="w-12 h-12 rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate hover:text-primary transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-slate-400 truncate mt-1">
            {tool.description || '暂无描述'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-1 text-accent">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span className="font-mono">{formatNumber(tool.stargazers_count)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          <span className="font-mono">{formatNumber(tool.forks_count)}</span>
        </div>
        {tool.language && (
          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
            {tool.language}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className={`px-2 py-1 rounded text-xs ${
          category === 'OpenClaw技能' ? 'bg-orange-500/20 text-orange-400' :
          category === '教程' ? 'bg-green-500/20 text-green-400' :
          'bg-accent/10 text-accent'
        }`}>
          {category}
        </span>
        <span className="text-xs text-slate-500">
          {formatDate(tool.updated_at)}
        </span>
      </div>
    </a>
  )
}

// Main Component
export default function Home() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('全部')
  const [sortBy, setSortBy] = useState<SortOption>('stars')

  useEffect(() => {
    async function fetchTools() {
      try {
        const res = await fetch('/api/tools')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setTools(data)
      } catch (err) {
        setError('加载失败，请刷新页面重试')
      } finally {
        setLoading(false)
      }
    }
    fetchTools()
  }, [])

  const filteredTools = useMemo(() => {
    let result = [...tools]
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.topics.some(topic => topic.toLowerCase().includes(searchLower))
      )
    }
    
    // Filter by category
    if (category !== '全部') {
      result = result.filter(t => categorizeTool(t.topics, t.language) === category)
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    
    return result
  }, [tools, search, category, sortBy])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">AI Tools</span>
              <span className="text-slate-400"> Directory</span>
            </h1>
            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            发现热门 <span className="gradient-text">AI 工具</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            实时从 GitHub 获取最流行的 AI 和机器学习项目
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="搜索 AI 工具..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === cat 
                      ? cat === 'OpenClaw技能' ? 'bg-orange-500 text-white'
                        : cat === '教程' ? 'bg-green-500 text-white'
                        : 'bg-primary text-white'
                      : 'bg-card border border-border text-slate-400 hover:border-primary hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-slate-400 focus:outline-none focus:border-primary"
            >
              <option value="stars">⭐ 按星标</option>
              <option value="updated">📅 按更新</option>
              <option value="name">📝 按名称</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center text-slate-400 mb-8">
          {loading ? (
            <span>加载中...</span>
          ) : (
            <span>共 {filteredTools.length} 个工具</span>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors"
            >
              刷新页面
            </button>
          </div>
        )}

        {/* Tools Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">没有找到相关工具</p>
            <button 
              onClick={() => { setSearch(''); setCategory('全部'); }}
              className="mt-4 px-6 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors"
            >
              清除筛选
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>数据来自 GitHub · 构建于 {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
