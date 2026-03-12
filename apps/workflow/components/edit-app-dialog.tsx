'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { appService } from '@/lib/services/app-service'
import { cn } from '@/lib/utils'

import type { AppInfo } from './app-card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

interface EditAppDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    app: AppInfo
    onAppUpdated?: (app: AppInfo) => void
}

const defaultIcons = ['🤖', '💬', '📊', '📄', '🔍', '✨', '🚀', '⚡', '🎯', '💡', '🔧', '📝']

export function EditAppDialog({ open, app, onOpenChange, onAppUpdated }: EditAppDialogProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [icon, setIcon] = useState('🤖')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (app) {
            setName(app.name)
            setDescription(app.description || '')
            setIcon(app.icon || '🤖')
        }
    }, [app])

    const handleSave = async () => {
        if (!name.trim()) return
        setIsSaving(true)
        try {
            const response = await appService.update(app.id, {
                name: name.trim(),
                description: description.trim() || undefined,
                icon,
            })
            // 关闭对话框并重置表单
            onOpenChange(false)
            // 通知父组件
            onAppUpdated?.(response)
            toast.success('应用信息已更新')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '更新应用失败')
        } finally {
            setIsSaving(false)
        }
    }

    const handleClose = () => {
        if (app) {
            setName('')
            setDescription('')
            setIcon('🤖')
        }
        onOpenChange(false)
    }
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>编辑应用信息</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
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
                            onKeyDown={e => {
                                if (e.key === 'Enter' && name.trim()) {
                                    handleSave()
                                }
                            }}
                        />
                        <p className="text-xs text-muted-foreground text-right">{name.length}/50</p>
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
                        <p className="text-xs text-muted-foreground text-right">{description.length}/200</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                        取消
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving ? '保存中...' : '保存'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
