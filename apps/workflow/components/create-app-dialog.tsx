import { BotIcon, MessageSquareIcon, WorkflowIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from './ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

type AppType = 'workflow' | 'chatbot' | 'agent'

interface CreateAppDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}
const appTypes: { value: AppType; label: string; description: string; icon: React.ReactNode }[] = [
    {
        value: 'workflow',
        label: '工作流',
        description: '通过可视化编排构建复杂的自动化流程',
        icon: <WorkflowIcon size={20} />,
    },
    {
        value: 'chatbot',
        label: '聊天助手',
        description: '创建智能对话机器人，支持多轮对话',
        icon: <MessageSquareIcon size={20} />,
    },
    {
        value: 'agent',
        label: 'Agent',
        description: '创建自主决策的智能代理',
        icon: <BotIcon size={20} />,
    },
]

const defaultIcons = ['🤖', '💬', '📊', '📄', '🔍', '✨', '🚀', '⚡', '🎯', '💡', '🔧', '📝']

export function CreateAppDialog({ open, onOpenChange }: CreateAppDialogProps) {
    const router = useRouter()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<AppType>('workflow')
    const [icon, setIcon] = useState('🤖')
    const [isCreating, setIsCreating] = useState(false)
    const handleCreate = async () => {
        if (!name.trim()) return

        setIsCreating(true)
        // 模拟创建应用
        await new Promise(resolve => setTimeout(resolve, 500))

        // 创建成功后跳转到编辑页面
        const newAppId = Date.now().toString()
        onOpenChange(false)
        router.push(`/app/${newAppId}/workflow`)
    }

    const handleClose = () => {
        setName('')
        setDescription('')
        setType('workflow')
        setIcon('🤖')
        onOpenChange(false)
    }
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>创建应用</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <div className="space-y-2">
                        <Label>应用类型</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {appTypes.map(appType => (
                                <div
                                    key={appType.value}
                                    className={cn(
                                        'flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors',
                                        type === appType.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-muted hover:border-muted-foreground/30'
                                    )}
                                    onClick={() => setType(appType.value)}
                                >
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-lg flex items-center justify-center',
                                            type === appType.value ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        {appType.icon}
                                    </div>
                                    <span className={cn('text-sm font-medium', type === appType.value && 'text-blue-600')}>
                                        {appType.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 应用图标 */}
                    <div className="space-y-2">
                        <Label>应用图标</Label>
                        <div className="flex flex-wrap gap-2">
                            {defaultIcons.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={cn(
                                        'w-9 h-9 rounded-lg flex items-center justify-center text-lg border-2 transition-colors',
                                        icon === emoji ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-muted'
                                    )}
                                    onClick={() => setIcon(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 应用名称 */}
                    <div className="space-y-2">
                        <Label htmlFor="app-name">
                            应用名称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="app-name"
                            placeholder="请输入应用名称"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={50}
                        />
                    </div>

                    {/* 应用描述 */}
                    <div className="space-y-2">
                        <Label htmlFor="app-description">应用描述</Label>
                        <Textarea
                            id="app-description"
                            placeholder="请输入应用描述（可选）"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            maxLength={200}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        取消
                    </Button>
                    <Button onClick={handleCreate} disabled={!name.trim() || isCreating} className="bg-blue-600 hover:bg-blue-700">
                        {isCreating ? '创建中...' : '创建'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
