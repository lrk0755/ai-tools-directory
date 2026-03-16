import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Tools Directory | 热门AI工具导航',
  description: '发现最流行的AI工具和开源项目 - 实时从GitHub获取热门AI工具目录',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
