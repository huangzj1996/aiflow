import { Edit2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { NodeSettingsFormProps } from '../types'

export interface Intent {
    name: string
    description?: string
}

export interface ConditionNodeConfig {
    model: string
    intents: Intent[]
}

function IntentEditDialog({
    open,
    onOpenChange,
    intent,
    onSave,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    intent?: Intent
    onSave: (intent: Intent) => void
}) {
    const isEdit = !!intent

    const defaultValues: Intent = intent || { name: '', description: '' }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<Intent>({ defaultValues })

    const onSubmit = (data: Intent) => {
        onSave(data)
        reset()
        onOpenChange(false)
    }

    const handleCancel = () => {
        reset()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? '编辑意图' : '添加意图'}</DialogTitle>
                    <DialogDescription>配置意图识别的分支选项</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="name">
                            意图名称 <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                            <Input
                                id="name"
                                placeholder="例如: 查询订单、咨询价格、投诉反馈"
                                {...register('name', {
                                    required: '意图名称不能为空',
                                })}
                            />
                        </FieldContent>
                        <FieldError errors={errors.name ? [errors.name] : undefined} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="description">意图描述</FieldLabel>
                        <FieldContent>
                            <Textarea
                                id="description"
                                placeholder="描述这个意图的特征，帮助大模型更准确识别..."
                                className="min-h-[80px]"
                                {...register('description')}
                            />
                        </FieldContent>
                    </Field>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            取消
                        </Button>
                        <Button type="submit" variant="default">
                            保存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function ConditionSettingsForm({ node, onSave, onCancel }: NodeSettingsFormProps<ConditionNodeConfig>) {
    const defaultConfig = (node.data?.config as any) || {}
    const [model, setModel] = useState<string>(defaultConfig.model || 'gpt-3.5-turbo')
    const [intents, setIntents] = useState<Intent[]>(defaultConfig.intents || [])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const handleAddIntent = () => {
        setEditingIndex(null)
        setDialogOpen(true)
    }

    const handleEditIntent = (index: number) => {
        setEditingIndex(index)
        setDialogOpen(true)
    }

    const handleDeleteIntent = (index: number) => {
        setIntents(intents.filter((_, i) => i !== index))
    }

    const handleSaveIntent = (intent: Intent) => {
        if (editingIndex !== null) {
            setIntents(intents.map((i, index) => (index === editingIndex ? intent : i)))
        } else {
            setIntents([...intents, intent])
        }
        setDialogOpen(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave?.({
            model,
            intents,
        })
    }

    const currentIntent = editingIndex !== null ? (intents[editingIndex] as any) : {}

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
                <FieldLabel htmlFor="model">
                    识别模型 <span className="text-red-500">*</span>
                </FieldLabel>
                <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-full" id="model">
                        <SelectValue placeholder="请选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                        <SelectItem value="gpt-4">gpt-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                        <SelectItem value="qwen3-0.6b">qwen3-0.6b</SelectItem>
                        <SelectItem value="qwen-max">qwen-max</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">选择用于意图识别的大语言模型</p>
            </Field>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">意图列表</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddIntent}>
                    <PlusIcon size={16} className="mr-1" />
                    添加意图
                </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {intents.length > 0 ? (
                    intents.map((intent, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{intent.name}</span>
                                    <span className="text-xs text-gray-500 bg-purple-100 px-2 py-0.5 rounded">分支 {index + 1}</span>
                                </div>
                                {intent.description && <p className="text-xs text-gray-500 truncate">{intent.description}</p>}
                            </div>

                            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleEditIntent(index)}>
                                    <Edit2Icon size={14} />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteIntent(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2Icon size={14} />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                        <p>暂无意图配置</p>
                        <p className="text-sm mt-1">点击"添加意图"按钮添加识别分支</p>
                    </div>
                )}
            </div>

            <p className="text-xs text-muted-foreground">大模型会根据输入内容识别用户意图，并路由到对应分支。无法识别时将走"其他"分支。</p>

            <div className="flex gap-2 pt-4">
                <Button type="submit" variant="default" className="flex-1">
                    保存
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                        取消
                    </Button>
                )}
            </div>
            <IntentEditDialog open={dialogOpen} onOpenChange={setDialogOpen} intent={currentIntent} onSave={handleSaveIntent} />
        </form>
    )
}
