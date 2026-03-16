import { NextResponse } from 'next/server'

// In-memory cache
let cachedTools: any[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 1000 * 60 * 30 // 30 minutes

// Curated AI tools based on HelloGitHub recommendations + GitHub popularity
const FALLBACK_TOOLS = [
  // === LLMs & Chat ===
  {
    id: 1,
    name: 'AutoGPT',
    full_name: 'Significant-Gravitas/AutoGPT',
    description: 'AutoGPT is the vision of accessible AI for everyone, to use and to build on.',
    html_url: 'https://github.com/Significant-Gravitas/AutoGPT',
    stargazers_count: 163000,
    forks_count: 35400,
    language: 'Python',
    topics: ['ai', 'autogpt', 'gpt-4', 'artificial-intelligence', 'automation', 'agent'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'Significant-Gravitas' }
  },
  {
    id: 2,
    name: 'LangChain',
    full_name: 'langchain-ai/langchain',
    description: 'Build applications with LLMs through composability.',
    html_url: 'https://github.com/langchain-ai/langchain',
    stargazers_count: 98000,
    forks_count: 27500,
    language: 'Python',
    topics: ['llm', 'langchain', 'ai', 'gpt', 'machine-learning', 'nlp'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/126730484?v=4', login: 'langchain-ai' }
  },
  {
    id: 3,
    name: 'Ollama',
    full_name: 'ollama/ollama',
    description: 'Get up and running with Llama 2, Mistral, Gemma, and other large language models.',
    html_url: 'https://github.com/ollama/ollama',
    stargazers_count: 95000,
    forks_count: 7500,
    language: 'Go',
    topics: ['ollama', 'llama', 'mistral', 'gemma', 'ai', 'llm'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/150069273?v=4', login: 'ollama' }
  },
  {
    id: 4,
    name: 'Dify',
    full_name: 'langgenius/dify',
    description: 'Production-ready platform for agentic workflow development.',
    html_url: 'https://github.com/langgenius/dify',
    stargazers_count: 78000,
    forks_count: 13500,
    language: 'TypeScript',
    topics: ['llm', 'ai', 'workflow', 'agent', 'gpt', 'rag'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1467813?v=4', login: 'langgenius' }
  },
  
  // === Image Generation ===
  {
    id: 5,
    name: 'Stable Diffusion WebUI',
    full_name: 'AUTOMATIC1111/stable-diffusion-webui',
    description: 'Stable Diffusion web UI - A browser interface for Stable Diffusion',
    html_url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    stargazers_count: 135000,
    forks_count: 28000,
    language: 'Python',
    topics: ['stable-diffusion', 'ai-art', 'deep-learning', 'image-generation', 'diffusion'],
    updated_at: '2026-03-02T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/33507258?v=4', login: 'AUTOMATIC1111' }
  },
  {
    id: 6,
    name: 'ComfyUI',
    full_name: 'Comfy-Org/ComfyUI',
    description: 'The most powerful and modular diffusion model GUI, api and backend.',
    html_url: 'https://github.com/Comfy-Org/ComfyUI',
    stargazers_count: 45000,
    forks_count: 4800,
    language: 'Python',
    topics: ['comfyui', 'ai', 'image-generation', 'diffusion', 'gui', 'nodes'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/112354216?v=4', login: 'Comfy-Org' }
  },
  
  // === Automation & Agents ===
  {
    id: 7,
    name: 'n8n',
    full_name: 'n8n-io/n8n',
    description: 'Fair-code workflow automation platform with native AI capabilities.',
    html_url: 'https://github.com/n8n-io/n8n',
    stargazers_count: 87000,
    forks_count: 9800,
    language: 'TypeScript',
    topics: ['workflow', 'automation', 'n8n', 'ai', 'nodejs', 'integration'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/45487769?v=4', login: 'n8n-io' }
  },
  {
    id: 8,
    name: 'Open WebUI',
    full_name: 'open-webui/open-webui',
    description: 'User-friendly AI Interface (Supports Ollama, OpenAI API, Gemini, Claude).',
    html_url: 'https://github.com/open-webui/open-webui',
    stargazers_count: 32000,
    forks_count: 4100,
    language: 'Python',
    topics: ['ollama', 'openai', 'ai', 'chatgpt', 'webui', 'llm'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/145458891?v=4', login: 'open-webui' }
  },
  
  // === Developer Tools ===
  {
    id: 9,
    name: 'Transformers',
    full_name: 'huggingface/transformers',
    description: 'State-of-the-art Machine Learning for JAX, PyTorch, and TensorFlow.',
    html_url: 'https://github.com/huggingface/transformers',
    stargazers_count: 125000,
    forks_count: 28000,
    language: 'Python',
    topics: ['transformers', 'pytorch', 'tensorflow', 'machine-learning', 'nlp', 'huggingface'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/25720743?v=4', login: 'huggingface' }
  },
  {
    id: 10,
    name: 'OpenAI Python',
    full_name: 'openai/openai-python',
    description: 'The official Python library for the OpenAI API.',
    html_url: 'https://github.com/openai/openai-python',
    stargazers_count: 22000,
    forks_count: 4200,
    language: 'Python',
    topics: ['openai', 'api', 'python', 'ai', 'gpt', 'sdk'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1498108?v=4', login: 'openai' }
  },
  
  // === RAG & Knowledge Base ===
  {
    id: 11,
    name: 'RAGFlow',
    full_name: 'infiniflow/ragflow',
    description: 'RAGFlow is a leading open-source Retrieval-Augmented Generation engine.',
    html_url: 'https://github.com/infiniflow/ragflow',
    stargazers_count: 22000,
    forks_count: 2800,
    language: 'Python',
    topics: ['rag', 'ai', 'llm', 'retrieval', 'knowledge-base'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'infiniflow' }
  },
  {
    id: 12,
    name: 'Anything LLM',
    full_name: 'Anything-LLM/Anything-LLM',
    description: 'A private ChatGPT for any documents.',
    html_url: 'https://github.com/Anything-LLM/Anything-LLM',
    stargazers_count: 18000,
    forks_count: 2200,
    language: 'JavaScript',
    topics: ['llm', 'chatgpt', 'rag', 'document', 'ai', 'vector-db'],
    updated_at: '2026-03-15T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'Anything-LLM' }
  },
  
  // === Learning Tutorials ===
  {
    id: 13,
    name: 'LLMs from Scratch',
    full_name: 'rasbt/LLMs-from-scratch',
    description: 'Implement a ChatGPT-like LLM in PyTorch from scratch, step by step.',
    html_url: 'https://github.com/rasbt/LLMs-from-scratch',
    stargazers_count: 38000,
    forks_count: 4200,
    language: 'Jupyter Notebook',
    topics: ['llm', 'pytorch', 'machine-learning', 'deep-learning', 'tutorial', 'gpt', 'course', 'learn'],
    updated_at: '2026-03-07T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/15933789?v=4', login: 'rasbt' }
  },
  {
    id: 14,
    name: 'Generative AI for Beginners',
    full_name: 'microsoft/generative-ai-for-beginners',
    description: '21 Lessons, Get Started Building with Generative AI.',
    html_url: 'https://github.com/microsoft/generative-ai-for-beginners',
    stargazers_count: 65000,
    forks_count: 18000,
    language: 'Jupyter Notebook',
    topics: ['ai', 'generative-ai', 'tutorial', 'course', 'microsoft', 'learning', 'learn', 'guide'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4', login: 'microsoft' }
  },
  {
    id: 15,
    name: 'no-magic',
    full_name: 'Mathews-Tom/no-magic',
    description: 'Zero-dependency single-file implementations of modern AI algorithms.',
    html_url: 'https://github.com/Mathews-Tom/no-magic',
    stargazers_count: 12000,
    forks_count: 1500,
    language: 'Python',
    topics: ['ai', 'machine-learning', 'deep-learning', 'gpt', 'lora', 'tutorial', 'learn'],
    updated_at: '2026-03-10T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'Mathews-Tom' }
  },
  {
    id: 16,
    name: 'learn-claude-code',
    full_name: 'shareAI-lab/learn-claude-code',
    description: 'Learn to build AI Agent from scratch like Claude Code. 12 lessons.',
    html_url: 'https://github.com/shareAI-lab/learn-claude-code',
    stargazers_count: 8000,
    forks_count: 900,
    language: 'Python',
    topics: ['ai', 'agent', 'claude', 'tutorial', 'llm', 'learning', 'course', 'guide'],
    updated_at: '2026-03-12T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'shareAI-lab' }
  },
  
  // === Tools & Utilities ===
  {
    id: 17,
    name: 'Firecrawl',
    full_name: 'firecrawl/firecrawl',
    description: 'Turn entire websites into LLM-ready markdown or structured data.',
    html_url: 'https://github.com/firecrawl/firecrawl',
    stargazers_count: 25000,
    forks_count: 2800,
    language: 'TypeScript',
    topics: ['ai', 'llm', 'web-scraping', 'data', 'mcp', 'api', 'tool'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'firecrawl' }
  },
  {
    id: 18,
    name: 'Awesome MCP Servers',
    full_name: 'punkpeye/awesome-mcp-servers',
    description: 'A collection of MCP servers - Model Context Protocol servers.',
    html_url: 'https://github.com/punkpeye/awesome-mcp-servers',
    stargazers_count: 18000,
    forks_count: 1500,
    language: null,
    topics: ['mcp', 'ai', 'model-context-protocol', 'servers', 'tool', 'awesome'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'punkpeye' }
  },
  {
    id: 19,
    name: 'zvec',
    full_name: 'alibaba/zvec',
    description: 'Lightweight in-process vector database by Alibaba.',
    html_url: 'https://github.com/alibaba/zvec',
    stargazers_count: 3500,
    forks_count: 400,
    language: 'Python',
    topics: ['vector-database', 'ai', 'embedding', 'search', 'tool', 'alibaba'],
    updated_at: '2026-03-08T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1961952?v=4', login: 'alibaba' }
  },
  
  // === OpenClaw Ecosystem (New Category!) ===
  {
    id: 20,
    name: 'OpenClaw',
    full_name: 'openclaw/openclaw',
    description: 'Your own personal AI assistant. Any OS. Any Platform. 🦞',
    html_url: 'https://github.com/openclaw/openclaw',
    stargazers_count: 5500,
    forks_count: 600,
    language: 'TypeScript',
    topics: ['ai', 'assistant', 'agent', 'telegram', 'whatsapp', 'slack', 'openclaw', 'skill', 'mcp'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'openclaw' }
  },
  {
    id: 21,
    name: 'pi-mono',
    full_name: 'badlogic/pi-mono',
    description: 'Minimalist AI Agent toolbox. The foundation of OpenClaw.',
    html_url: 'https://github.com/badlogic/pi-mono',
    stargazers_count: 4500,
    forks_count: 350,
    language: 'TypeScript',
    topics: ['ai', 'agent', 'llm', 'cli', 'tools', 'openclaw', 'skill'],
    updated_at: '2026-03-11T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/2247170?v=4', login: 'badlogic' }
  },
  {
    id: 22,
    name: 'Gemini CLI',
    full_name: 'google-gemini/gemini-cli',
    description: 'An open-source AI agent that brings the power of Gemini into your terminal.',
    html_url: 'https://github.com/google-gemini/gemini-cli',
    stargazers_count: 15000,
    forks_count: 1800,
    language: 'TypeScript',
    topics: ['gemini', 'cli', 'ai', 'agent', 'google', 'terminal', 'tool'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'google-gemini' }
  },
  {
    id: 23,
    name: 'anthropic/skills',
    full_name: 'anthropics/skills',
    description: 'Claude Official - Learn how to create skills for AI assistants.',
    html_url: 'https://github.com/anthropics/skills',
    stargazers_count: 5000,
    forks_count: 400,
    language: null,
    topics: ['claude', 'skill', 'ai', 'agent', 'tutorial', 'guide', 'openclaw'],
    updated_at: '2026-03-12T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'anthropics' }
  },
  {
    id: 24,
    name: 'Awesome OpenClaw Skills',
    full_name: 'openclaw/skills',
    description: 'OpenClaw bundled skills and examples.',
    html_url: 'https://github.com/openclaw/skills',
    stargazers_count: 2000,
    forks_count: 200,
    language: null,
    topics: ['openclaw', 'skill', 'ai', 'agent', 'tutorial', 'example', 'docs'],
    updated_at: '2026-03-10T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'openclaw' }
  },
  
  // === More Tutorials ===
  {
    id: 25,
    name: 'AI Agent Tutorial',
    full_name: 'e2b-dev/awesome-ai-agents',
    description: 'A curated list of AI agents and tutorials.',
    html_url: 'https://github.com/e2b-dev/awesome-ai-agents',
    stargazers_count: 15000,
    forks_count: 1800,
    language: null,
    topics: ['ai', 'agent', 'tutorial', 'course', 'learn', 'guide', 'awesome'],
    updated_at: '2026-03-14T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'e2b-dev' }
  },
  {
    id: 26,
    name: 'Deep Learning Course',
    full_name: 'deeplearning-ai/deep-learning-specialization',
    description: 'Neural Networks and Deep Learning by Andrew Ng.',
    html_url: 'https://github.com/deeplearning-ai/deep-learning-specialization',
    stargazers_count: 25000,
    forks_count: 8000,
    language: null,
    topics: ['deep-learning', 'neural-networks', 'tutorial', 'course', 'learn', 'education', 'andrew-ng'],
    updated_at: '2026-03-01T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'deeplearning-ai' }
  },
  {
    id: 27,
    name: 'FastAI Course',
    full_name: 'fastai/fastbook',
    description: 'Making neural nets uncool again - Interactive Deep Learning Course.',
    html_url: 'https://github.com/fastai/fastbook',
    stargazers_count: 28000,
    forks_count: 6500,
    language: 'Jupyter Notebook',
    topics: ['deep-learning', 'fastai', 'pytorch', 'tutorial', 'course', 'learn', 'education'],
    updated_at: '2026-02-20T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'fastai' }
  },
  
  // === ChatGPT Prompts ===
  {
    id: 28,
    name: 'Awesome ChatGPT Prompts',
    full_name: 'f/awesome-chatgpt-prompts',
    description: 'Share, discover, and collect prompts from the community.',
    html_url: 'https://github.com/f/awesome-chatgpt-prompts',
    stargazers_count: 85000,
    forks_count: 12000,
    language: 'HTML',
    topics: ['chatgpt', 'prompts', 'ai', 'prompt-engineering', 'awesome'],
    updated_at: '2026-03-16T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'f' }
  },
  
  // === Deep Learning & CV ===
  {
    id: 29,
    name: 'Deep-Live-Cam',
    full_name: 'hacksider/Deep-Live-Cam',
    description: 'Real time face swap and one-click video deepfake.',
    html_url: 'https://github.com/hacksider/Deep-Live-Cam',
    stargazers_count: 28000,
    forks_count: 5200,
    language: 'Python',
    topics: ['deepfake', 'face-swap', 'ai', 'computer-vision', 'deep-learning'],
    updated_at: '2026-03-13T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'hacksider' }
  },
  {
    id: 30,
    name: 'FreeMoCap',
    full_name: 'freemocap/freemocap',
    description: 'Free and open source motion capture system.',
    html_url: 'https://github.com/freemocap/freemocap',
    stargazers_count: 8500,
    forks_count: 700,
    language: 'Python',
    topics: ['motion-capture', 'ai', 'computer-vision', '3d', 'animation'],
    updated_at: '2026-03-14T00:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', login: 'freemocap' }
  }
]

export async function GET() {
  const now = Date.now()
  
  // Return cached data if still valid
  if (cachedTools && (now - lastFetchTime) < CACHE_DURATION) {
    return NextResponse.json(cachedTools)
  }

  try {
    // Try to fetch fresh data from GitHub
    const repos = FALLBACK_TOOLS.map(t => t.full_name)
    const tools: any[] = []
    
    // Fetch in batches
    for (let i = 0; i < repos.length; i += 10) {
      const batch = repos.slice(i, i + 10)
      const response = await fetch(`https://api.github.com/repos/${batch.join(',')}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Tools-Directory',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const results = Array.isArray(data) ? data : [data]
        
        for (const repo of results) {
          if (repo && repo.id) {
            tools.push({
              id: repo.id,
              name: repo.name,
              full_name: repo.full_name,
              description: repo.description,
              html_url: repo.html_url,
              stargazers_count: repo.stargazers_count || 0,
              forks_count: repo.forks_count || 0,
              language: repo.language,
              topics: repo.topics || [],
              updated_at: repo.updated_at,
              owner: {
                avatar_url: repo.owner.avatar_url,
                login: repo.owner.login,
              },
            })
          }
        }
      }
    }
    
    if (tools.length > 0) {
      tools.sort((a, b) => b.stargazers_count - a.stargazers_count)
      cachedTools = tools
      lastFetchTime = now
      return NextResponse.json(tools)
    }
    
    cachedTools = FALLBACK_TOOLS
    lastFetchTime = now
    return NextResponse.json(FALLBACK_TOOLS)
    
  } catch (error) {
    console.error('Error fetching tools:', error)
    
    if (cachedTools) {
      return NextResponse.json(cachedTools)
    }
    
    cachedTools = FALLBACK_TOOLS
    lastFetchTime = now
    return NextResponse.json(FALLBACK_TOOLS)
  }
}
