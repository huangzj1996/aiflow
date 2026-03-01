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

export type OutputParamType = 'string' | 'number' | 'boolean' | 'object' | 'array'

export interface OutputParam {
    name: string
    type: OutputParamType
    value: string //使用表达式引用其他节点的输出，如 ${llm-1.output}
    description?: string
}

export interface EndNodeConfig {
    outputs: OutputParam[]
}

const TYPE_LABELS: Record<OutputParamType, string> = {
    string: '字符串',
    number: '数字',
    boolean: '布尔值',
    object: '对象',
    array: '数组',
}

function OutputParamEditDialog({
    open,
    onOpenChange,
    param,
    onSave,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    param?: OutputParam
    onSave: (data: OutputParam) => void
}) {
    const isEdit = !!param

    const defaultValues: OutputParam = param || {
        name: '',
        type: 'string',
        value: '',
        description: '',
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
    } = useForm<OutputParam>({
        defaultValues,
    })

    const paramType = watch('type')

    const onSubmit = (data: OutputParam) => {
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
                    <DialogTitle>{isEdit ? '编辑输出参数' : '添加输出参数'}</DialogTitle>
                    <DialogDescription>配置工作流的输出参数</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="name">
                            参数名 <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                            <Input
                                id="name"
                                placeholder="例如: result, summary"
                                {...register('name', {
                                    required: '参数名不能为空',
                                    pattern: {
                                        value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                                        message: '参数名必须以字母或下划线开头，只能包含字母、数字和下划线',
                                    },
                                })}
                            />
                        </FieldContent>
                        <FieldError errors={errors.name ? [errors.name] : undefined} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="type">
                            参数类型 <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                            <Select value={paramType} onValueChange={value => setValue('type', value as OutputParamType)}>
                                <SelectTrigger className="w-full" id="type">
                                    <SelectValue placeholder="请选择参数类型" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="string">字符串 (string)</SelectItem>
                                    <SelectItem value="number">数字 (number)</SelectItem>
                                    <SelectItem value="boolean">布尔值 (boolean)</SelectItem>
                                    <SelectItem value="array">数组 (array)</SelectItem>
                                    <SelectItem value="object">对象 (object)</SelectItem>
                                </SelectContent>
                            </Select>
                        </FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="value">
                            参数值 <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                            <Textarea
                                id="value"
                                placeholder="例如: ${llm-1.output} 或直接输入固定值"
                                className="min-h-[80px] font-mono text-sm"
                                {...register('value', {
                                    required: '参数值不能为空',
                                })}
                            />
                        </FieldContent>
                        <FieldError errors={errors.value ? [errors.value] : undefined} />
                        <p className="text-xs text-muted-foreground mt-1">支持使用 ${'{nodeId.field}'} 引用其他节点的输出</p>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description">参数描述</FieldLabel>
                        <FieldContent>
                            <Textarea
                                id="description"
                                placeholder="描述这个输出参数的用途..."
                                className="min-h-[60px]"
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

export function EndSettingsForm({ node, onSave, onCancel }: NodeSettingsFormProps<EndNodeConfig>) {
    const [outputs, setOutputs] = useState<OutputParam[]>((node.data?.config as any)?.outputs || [])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const handleAddParam = () => {
        setEditingIndex(null)
        setDialogOpen(true)
    }

    const handleEditParam = (index: number) => {
        setEditingIndex(index)
        setDialogOpen(true)
    }

    const handleDeleteParam = (index: number) => {
        setOutputs(outputs.filter((_, i) => i !== index))
    }

    const handleSaveParam = (data: OutputParam) => {
        if (editingIndex !== null) {
            // 编辑现有参数
            setOutputs(outputs.map((output, i) => (i === editingIndex ? data : output)))
        } else {
            // 添加新参数
            setOutputs([...outputs, data])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave?.({ outputs })
    }

    const currentParam = editingIndex !== null ? outputs[editingIndex] : undefined

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">输出参数配置</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddParam}>
                    <PlusIcon size={16} className="mr-1" />
                    添加参数
                </Button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {outputs.length > 0 ? (
                    outputs.map((output, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{output.name}</span>
                                    <span className="text-xs text-gray-500 bg-orange-100 px-2 py-0.5 rounded">
                                        {TYPE_LABELS[output.type]}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 font-mono truncate">{output.value}</p>
                                {output.description && <p className="text-xs text-gray-400 mt-1 truncate">{output.description}</p>}
                            </div>
                            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleEditParam(index)}>
                                    <Edit2Icon size={14} />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteParam(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2Icon size={14} />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                        <p>暂无输出参数配置</p>
                        <p className="text-sm mt-1">点击"添加参数"按钮配置工作流输出</p>
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground">配置工作流结束时返回的输出参数，可引用前置节点的输出作为最终结果。</p>
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
            <OutputParamEditDialog open={dialogOpen} onOpenChange={setDialogOpen} param={currentParam} onSave={handleSaveParam} />
        </form>
    )
}
