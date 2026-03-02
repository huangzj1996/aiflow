import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { getAvailableNodeOutputs } from '../node-outputs'
import { NodeSettingsFormProps } from '../types'
import { VariableEditor } from '../variable-editor'

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

function OutputParamCard({
    index,
    param,
    onChange,
    onDelete,
    availableOutputs,
}: {
    index: number
    param: OutputParam
    onChange: (index: number, data: Partial<OutputParam>) => void
    onDelete: (index: number) => void
    availableOutputs: ReturnType<typeof getAvailableNodeOutputs>
}) {
    return (
        <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">参数 {index + 1}</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(index)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                >
                    <Trash2Icon size={14} />
                </Button>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Field>
                    <FieldLabel className="text-xs">参数名</FieldLabel>
                    <FieldContent>
                        <Input
                            value={param.name}
                            onChange={e => onChange(index, { name: e.target.value })}
                            placeholder="result"
                            className="h-8 text-sm"
                        />
                    </FieldContent>
                </Field>
                <Field>
                    <FieldLabel className="text-xs">参数值</FieldLabel>
                    <FieldContent>
                        <VariableEditor
                            value={param.value}
                            onChange={value => onChange(index, { value })}
                            availableOutputs={availableOutputs}
                            placeholder="选择上游变量"
                            singleVariable
                        />
                    </FieldContent>
                </Field>
            </div>
        </div>
    )
}

export function EndSettingsForm({ node, onSave, onCancel, flowContext }: NodeSettingsFormProps<EndNodeConfig>) {
    const [outputs, setOutputs] = useState<OutputParam[]>((node.data?.config as any)?.outputs || [])

    const availableOutputs = useMemo(() => {
        if (!flowContext) {
            return []
        }
        return getAvailableNodeOutputs(node.id, flowContext.nodes, flowContext.edges)
    }, [node.id, flowContext])

    const handleAddParam = () => {
        setOutputs(prevOutputs => [...prevOutputs, { name: '', type: 'string', value: '', description: '' }])
    }

    const handleChangeParam = (index: number, data: Partial<OutputParam>) => {
        setOutputs(outputs.map((output, i) => (i === index ? { ...output, ...data } : output)))
    }

    const handleDeleteParam = (index: number) => {
        setOutputs(outputs.filter((_, i) => i !== index))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // 过滤掉空的参数名
        const validOutputs = outputs.filter(o => o.name.trim())
        onSave?.({ outputs: validOutputs })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">输出参数配置</h3>
                <Button type="button" variant="outline" size="sm" className="h-7" onClick={handleAddParam}>
                    <PlusIcon size={14} className="mr-1" />
                    添加
                </Button>
            </div>
            <div className="space-y-3">
                {outputs.length > 0 ? (
                    outputs.map((output, index) => (
                        <OutputParamCard
                            key={index}
                            param={output}
                            index={index}
                            onChange={handleChangeParam}
                            onDelete={handleDeleteParam}
                            availableOutputs={availableOutputs}
                        />
                    ))
                ) : (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="text-sm">暂无输出参数</p>
                        <p className="text-xs mt-1">点击"添加"配置输出</p>
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground">配置工作流结束时返回的输出参数</p>
        </form>
    )
}
