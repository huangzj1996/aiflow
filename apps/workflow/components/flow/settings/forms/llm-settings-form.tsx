import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { NodeSettingsFormProps } from '../types'

export interface LLMNodeConfig {
    model: string
    systemPrompt?: string
    userPrompt?: string
    assistantPrompt?: string
    temperature?: number
    maxTokens?: number
}

export function LLMSettingsForm({ node, onCancel, onSave }: NodeSettingsFormProps<LLMNodeConfig>) {
    const defaultValues: LLMNodeConfig = {
        model: (node.data?.config as any)?.model || 'gpt-3.5-turbo',
        systemPrompt: (node.data?.config as any)?.systemPrompt || '',
        userPrompt: (node.data?.config as any)?.userPrompt || (node.data?.config as any)?.prompt || '',
        assistantPrompt: (node.data?.config as any)?.assistantPrompt || '',
        temperature: (node.data?.config as any)?.temperature || 0.7,
        maxTokens: (node.data?.config as any)?.maxTokens || 2000,
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<LLMNodeConfig>({
        defaultValues,
    })
    const selectedModel = watch('model')

    const onSubmit = (data: LLMNodeConfig) => {
        onSave?.(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-auto h-96">
            <Field>
                <FieldLabel htmlFor="model">
                    模型 <span className="text-red-500">*</span>
                </FieldLabel>
                <Select value={selectedModel} onValueChange={value => setValue('model', value)}>
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
                {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
            </Field>

            <Field>
                <FieldLabel htmlFor="systemPrompt">系统提示词 (System)</FieldLabel>
                <Textarea
                    id="systemPrompt"
                    placeholder="设定 AI 的角色、行为规范和背景信息..."
                    className="min-h-[80px]"
                    {...register('systemPrompt')}
                />
                <p className="text-xs text-muted-foreground mt-1">定义 AI 的角色和行为准则</p>
            </Field>
            <Field>
                <FieldLabel htmlFor="userPrompt">
                    用户提示词 (User) <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                    id="userPrompt"
                    placeholder="用户的输入内容，可使用 ${nodeId.field} 引用其他节点输出..."
                    className="min-h-[100px]"
                    {...register('userPrompt', {
                        required: '用户提示词不能为空',
                    })}
                />
                {errors.userPrompt && <p className="text-sm text-red-500">{errors.userPrompt.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">支持使用 ${'{nodeId.field}'} 引用其他节点的输出</p>
            </Field>
            <Field>
                <FieldLabel htmlFor="assistantPrompt">助理提示词 (Assistant)</FieldLabel>
                <Textarea
                    id="assistantPrompt"
                    placeholder="预设的助理回复开头，引导模型按特定格式或方向回答..."
                    className="min-h-[60px]"
                    {...register('assistantPrompt')}
                />
                <p className="text-xs text-muted-foreground mt-1">可预设回复的开头内容，引导输出格式</p>
            </Field>

            <Field>
                <FieldLabel htmlFor="temperature">温度 (Temperature)</FieldLabel>
                <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    placeholder="0.7"
                    {...register('temperature', {
                        valueAsNumber: true,
                        min: { value: 0, message: '温度不能小于 0' },
                        max: { value: 2, message: '温度不能大于 2' },
                    })}
                />
                {errors.temperature && <p className="text-sm text-red-500">{errors.temperature.message}</p>}
            </Field>
            <Field>
                <FieldLabel htmlFor="maxTokens">最大 Token 数</FieldLabel>
                <Input
                    id="maxTokens"
                    type="number"
                    step="100"
                    min="1"
                    placeholder="2000"
                    {...register('maxTokens', {
                        valueAsNumber: true,
                        min: { value: 1, message: '最大 Token 数不能小于 1' },
                    })}
                />
                {errors.maxTokens && <p className="text-sm text-red-500">{errors.maxTokens.message}</p>}
            </Field>

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
        </form>
    )
}
