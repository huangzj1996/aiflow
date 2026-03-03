'use client'

import { MoreHorizontalIcon, PencilIcon, PlayIcon, TagIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from './ui/button'
import { Card } from './ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'

export interface AppInfo {
    id: string
    name: string
    description: string
    icon: string
    type: 'workflow' | 'chatbot' | 'agent'
    updatedAt: string
    author?: string
    tags?: string[]
}

const typeIcons: Record<AppInfo['type'], string> = {
    workflow: '⚡',
    chatbot: '💬',
    agent: '🤖',
}
export function AppCard({ app }: { app: AppInfo }) {
    return (
        <Card className="group hover:shadow-md transition-shadow cursor-pointer border-muted-foreground/10 overflow-hidden">
            <Link href={`app/${app.id}/workflow`}>
                <div className="p-4">
                    {/* 顶部：图标 + 信息 */}
                    <div className="flex items-start gap-3 mb-6">
                        {/* 应用图标 */}
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl shadow-sm">
                                {app.icon}
                            </div>
                            {/* 类型小图标 */}
                            <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs">
                                {typeIcons[app.type]}
                            </div>
                        </div>

                        {/* 应用信息 */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{app.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {app.author || '未知'} · 编辑于 {app.updatedAt}
                            </p>
                        </div>
                    </div>
                    {/* 底部：标签 + 操作 */}
                    <div className="flex items-center justify-between">
                        {/* 添加标签按钮 */}
                        {app.tags && app.tags.length > 0 ? (
                            <div className="flex items-center gap-1">
                                {app.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={e => e.preventDefault()}
                            >
                                <TagIcon size={12} className="mr-1" />
                                添加标签
                            </Button>
                        )}

                        {/* 操作菜单 */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.preventDefault()}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreHorizontalIcon size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <PencilIcon size={14} className="mr-2" />
                                    编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <PlayIcon size={14} className="mr-2" />
                                    运行
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <TrashIcon size={14} className="mr-2" />
                                    删除
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </Link>
        </Card>
    )
}
