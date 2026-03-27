import './globals.css'

import { Metadata } from 'next'
import { Toaster } from 'sonner'
export const metadata: Metadata = {
    title: 'AI 应用 - WebApp',
    description: '工作流演示应用',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh-CN">
            <body className="min-h-screen w-full antialiased">
                {children}
                <Toaster position="top-center" richColors />
            </body>
        </html>
    )
}
