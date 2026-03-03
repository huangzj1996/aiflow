'use client'
import { LayoutGridIcon, ListIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'

import { AppCard, AppInfo } from '@/components/app-card'
import { CreateAppDialog } from '@/components/create-app-dialog'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 模拟应用数据
const mockApps: AppInfo[] = [
    {
        id: '1',
        name: 'miaoma-aiflow-demo',
        description: '这是一个演示工作流应用，展示了如何使用 AI 工作流处理复杂任务。',
        icon: '🤖',
        type: 'workflow',
        updatedAt: '2025/12/21 09:19',
        author: '妙码学院',
        tags: ['AI', '工作流'],
    },
    {
        id: '2',
        name: '智能客服助手',
        description: '基于大语言模型的智能客服系统，支持多轮对话和知识库检索。',
        icon: '💬',
        type: 'chatbot',
        updatedAt: '2025/12/20 14:30',
        author: '妙码学院',
        tags: ['客服', 'LLM'],
    },
    {
        id: '3',
        name: '数据分析 Agent',
        description: '自动分析数据并生成报告的智能代理，支持 SQL 查询和可视化。',
        icon: '📊',
        type: 'agent',
        updatedAt: '2025/12/18 10:00',
        author: '妙码学院',
        tags: ['数据分析', 'Agent'],
    },
    {
        id: '4',
        name: '文档处理工作流',
        description: '自动处理文档的工作流，支持 OCR、分类、提取和总结。',
        icon: '📄',
        type: 'workflow',
        updatedAt: '2025/12/14 16:45',
        author: '妙码学院',
    },
    {
        id: '5',
        name: '代码审查助手',
        description: 'AI 驱动的代码审查工具，帮助团队提高代码质量。',
        icon: '🔍',
        type: 'chatbot',
        updatedAt: '2025/12/07 11:20',
        author: '妙码学院',
    },
    {
        id: '6',
        name: '营销内容生成器',
        description: '自动生成营销文案、社交媒体帖子和广告创意。',
        icon: '✨',
        type: 'workflow',
        updatedAt: '2025/11/30 09:00',
        author: '妙码学院',
    },
]

export default function AppsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const filteredApps = mockApps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = typeFilter === 'all' || app.type === typeFilter
        return matchesSearch && matchesType
    })

    return (
        <div className="px-12 py-6">
            {/* 筛选和搜索栏 */}
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex gap-4">
                    {/* 搜索框 */}
                    <div className="relative flex-1 max-w-md">
                        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="搜索应用..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    {/* 类型筛选 */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-32 h-9">
                            <SelectValue placeholder="全部类型" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部类型</SelectItem>
                            <SelectItem value="workflow">工作流</SelectItem>
                            <SelectItem value="chatbot">聊天助手</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* 视图切换 */}
                <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'grid' | 'list')}>
                    <TabsList className="h-9">
                        <TabsTrigger value="grid" className="px-2">
                            <LayoutGridIcon size={16} />
                        </TabsTrigger>
                        <TabsTrigger value="list" className="px-2">
                            <ListIcon size={16} />
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            {/* 应用列表 */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-3'}>
                {/* 创建应用卡片 */}
                <Card
                    className="flex items-center justify-center cursor-pointer border-dashed border-2 border-muted-foreground/20 hover:border-blue-400 hover:bg-blue-50/50 transition-colors min-h-[140px]"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <PlusIcon size={20} />
                        </div>
                        <span className="text-sm">创建应用</span>
                    </div>
                </Card>
                {/* 应用卡片列表 */}
                {filteredApps.map(app => (
                    <AppCard key={app.id} app={app} />
                ))}
            </div>
            {/* 空状态 */}
            {filteredApps.length === 0 && searchQuery && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <SearchIcon size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">没有找到应用</h3>
                    <p className="text-sm text-muted-foreground">尝试调整搜索条件</p>
                </div>
            )}
            <CreateAppDialog open={createDialogOpen} onOpenChange={value => setCreateDialogOpen(value)} />
        </div>
    )
}
