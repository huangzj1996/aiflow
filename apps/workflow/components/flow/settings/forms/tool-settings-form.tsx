import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { NodeSettingsFormProps } from '../types'

export interface ToolNodeConfig {
    toolName: string
    description?: string
    args?: Record<string, any>
}

export function ToolSettingsForm({ node, onCancel, onSave }: NodeSettingsFormProps<ToolNodeConfig>) {
    const defaultValues: ToolNodeConfig = {
        toolName: (node.data?.config as any)?.toolName || '',
        description: (node.data?.config as any)?.description || '',
        args: (node.data?.config as any)?.args || {},
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ToolNodeConfig>({
        defaultValues,
    })

    const onSubmit = (data: ToolNodeConfig) => {
        try {
            if (typeof (data as any).argsJson === 'string') {
                data.args = JSON.parse((data as any).argsJson || '{}')
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse args JSON:', error)
        }
        onSave?.(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field>
                <FieldLabel htmlFor="toolName">
                    工具名称 <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                    id="toolName"
                    placeholder="请输入工具名称，如: calculator"
                    {...register('toolName', {
                        required: '工具名称不能为空',
                    })}
                />
                {errors.toolName && <p className="text-sm text-red-500">{errors.toolName.message}</p>}
            </Field>
            <Field>
                <FieldLabel htmlFor="description">工具描述</FieldLabel>
                <Textarea id="description" placeholder="请输入工具描述..." className="min-h-[80px]" {...register('description')} />
            </Field>
            <Field>
                <FieldLabel htmlFor="argsJson">参数配置 (JSON)</FieldLabel>
                <Textarea
                    id="argsJson"
                    placeholder='{"param1": "value1", "param2": "value2"}'
                    className="min-h-[100px] font-mono text-xs"
                    defaultValue={JSON.stringify(defaultValues.args, null, 2)}
                    {...register('argsJson' as any, {
                        validate: value => {
                            if (!value) return true
                            try {
                                JSON.parse(value)
                                return true
                            } catch {
                                return '请输入有效的 JSON 格式'
                            }
                        },
                    })}
                />
                {errors.args && <p className="text-sm text-red-500">{(errors as any).argsJson?.message}</p>}
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
