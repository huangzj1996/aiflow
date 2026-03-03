'use client'

import { BookOpenIcon, SettingsIcon, WrenchIcon, ZapIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
const navItems = [
    // { title: '探索', url: '/explore', icon: CompassIcon, color: '#10B981' },
    { title: '工作室', url: '/apps', icon: ZapIcon, matchPaths: ['/apps', '/app'], color: '#06B6D4' },
    { title: '知识库', url: '/knowledge', icon: BookOpenIcon, color: '#8B5CF6' },
    { title: '工具', url: '/tools', icon: WrenchIcon, color: '#F59E0B' },
]
export function GlobalHeader() {
    const pathname = usePathname()

    // 检查导航项是否激活
    const isNavActive = (item: (typeof navItems)[0]) => {
        if (item.matchPaths) {
            return item.matchPaths.some(path => pathname.startsWith(path))
        }
        return pathname.startsWith(item.url)
    }
    return (
        <header className="h-12 border-b border-b-muted-foreground/10 bg-[#F3F4FA] shadow-sm flex items-center px-4 gap-4 shrink-0">
            {/* 左侧 Logo 和 Workspace */}
            <div className="flex items-center gap-3">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-linear-to-r from-[#4F46E5] to-[#8B5CF6] rounded-md flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                    </div>
                    <span className="font-semibold text-lg">AI 引擎</span>
                </Link>
            </div>

            {/* 中间导航 */}
            <nav className="flex-1 flex items-center justify-center gap-1">
                {navItems.map(item => {
                    const isActive = isNavActive(item)
                    return (
                        <Link
                            key={item.url}
                            href={item.url}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                isActive ? 'bg-white font-bold shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                            style={{
                                color: isActive ? item.color : undefined,
                            }}
                        >
                            <item.icon size={16} />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>
            {/* 右侧操作区 */}
            <div className="flex items-center justify-end gap-2 w-[140px]">
                {/* <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <PuzzleIcon size={16} className="mr-1.5" />
                    插件
                </Button> */}

                {/* 用户头像 */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                            <Avatar className="w-7 h-7">
                                <AvatarImage src="/avatars/shadcn.jpg" />
                                <AvatarFallback className="bg-blue-600 text-white text-xs">H</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <SettingsIcon size={14} className="mr-2" />
                            设置
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>退出登录</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
