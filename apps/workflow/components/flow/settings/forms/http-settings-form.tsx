/* eslint-disable react-hooks/incompatible-library */
'use client'

import { PlusIcon, TrashIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { getAvailableNodeOutputs } from '../node-outputs'
import { NodeSettingsFormProps } from '../types'
import { VariableEditor } from '../variable-editor'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type BodyType = 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary' | 'json'

export interface KeyValuePair {
    key: string
    value: string
}

export interface HttpNodeConfig {
    url: string
    method: HttpMethod
    headers: KeyValuePair[]
    bodyType: BodyType
    body: string
    params: KeyValuePair[]
    formData: KeyValuePair[]
    timeout?: number
}

export function HttpSettingsForm({ node, onSave, onCancel, flowContext }: NodeSettingsFormProps<HttpNodeConfig>) {
    const defaultValues: HttpNodeConfig = {
        url: (node.data?.config as any)?.url || '',
        method: (node.data?.config as any)?.method || 'GET',
        headers: (node.data?.config as any)?.headers || [],
        params: (node.data?.config as any)?.params || [],
        bodyType: (node.data?.config as any)?.bodyType || 'none',
        body: (node.data?.config as any)?.body || '',
        formData: (node.data?.config as any)?.formData || [],
        timeout: (node.data?.config as any)?.timeout || 30000,
    }

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
        control,
    } = useForm<HttpNodeConfig>({ defaultValues })

    const {
        fields: headerFields,
        append: appendHeader,
        remove: removeHeader,
    } = useFieldArray({
        control,
        name: 'headers',
    })

    const {
        fields: paramFields,
        append: appendParam,
        remove: removeParam,
    } = useFieldArray({
        control,
        name: 'params',
    })

    const {
        fields: formDataFields,
        append: appendFormData,
        remove: removeFormData,
    } = useFieldArray({
        control,
        name: 'formData',
    })

    const availableOutputs = useMemo(() => {
        if (!flowContext) {
            return []
        }
        return getAvailableNodeOutputs(node.id, flowContext.nodes, flowContext.edges)
    }, [node.id, flowContext])

    const method = watch('method')
    const bodyType = watch('bodyType')
    const body = watch('body')

    const onSubmit = (data: HttpNodeConfig) => {
        onSave?.(data)
    }

    // 是否显示请求体配置（GET 和 DELETE 通常不发送 body）
    const showBody = method !== 'GET' && method !== 'DELETE'
    // 是否使用表单数据（键值对形式）
    const useFormData = bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded'

    // 是否使用文本编辑器
    const useTextEditor = bodyType === 'json' || bodyType === 'raw'
    // Body 类型选项
    const bodyTypeOptions: { value: BodyType; label: string }[] = [
        { value: 'none', label: 'none' },
        { value: 'form-data', label: 'form-data' },
        { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
        { value: 'json', label: 'JSON' },
        { value: 'raw', label: 'raw' },
        { value: 'binary', label: 'binary' },
    ]
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 请求方法和 URL */}
            <Field>
                <FieldLabel htmlFor="url">
                    请求 URL <span className="text-red-500">*</span>
                </FieldLabel>
                <div className="flex gap-2 items-center">
                    <Select value={method} onValueChange={(value: HttpMethod) => setValue('method', value)}>
                        <SelectTrigger className="w-28 shrink-0 h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex-1">
                        <VariableEditor
                            value={watch('url')}
                            onChange={value => setValue('url', value)}
                            availableOutputs={availableOutputs}
                            placeholder="https://api.example.com/endpoint"
                            singleLine
                        />
                    </div>
                </div>
                {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
            </Field>
            {/* 超时设置 */}
            <Field>
                <FieldLabel htmlFor="timeout">超时时间 (ms)</FieldLabel>
                <Input id="timeout" type="number" placeholder="30000" {...register('timeout', { valueAsNumber: true })} />
            </Field>
            {/* 请求头 */}
            <Field>
                <div className="flex items-center justify-between mb-2">
                    <FieldLabel htmlFor="headers">请求头 (Headers)</FieldLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={() => appendHeader({ key: '', value: '' })}>
                        <PlusIcon size={14} className="mr-1" />
                        添加
                    </Button>
                </div>
                <div className="space-y-2">
                    {headerFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center">
                            <Input placeholder="Header Name" className="flex-1 h-9" {...register(`headers.${index}.key` as const)} />
                            <div className="flex-1">
                                <VariableEditor
                                    value={watch(`headers.${index}.value`)}
                                    onChange={value => setValue(`headers.${index}.value`, value)}
                                    availableOutputs={availableOutputs}
                                    placeholder="Header Value"
                                    singleLine
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeHeader(index)}>
                                <TrashIcon size={14} />
                            </Button>
                        </div>
                    ))}
                    {headerFields.length === 0 && <p className="text-xs text-muted-foreground">点击上方添加按钮添加请求头</p>}
                </div>
                {/* Query 参数 */}
                <Field>
                    <div className="flex items-center justify-between mb-2">
                        <FieldLabel>Query 参数 (Params)</FieldLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={() => appendParam({ key: '', value: '' })}>
                            <PlusIcon size={14} className="mr-1" />
                            添加
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {paramFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-center">
                                <Input placeholder="Param Name" className="flex-1 h-9" {...register(`params.${index}.key` as const)} />
                                <div className="flex-1">
                                    <VariableEditor
                                        value={watch(`params.${index}.value`)}
                                        onChange={value => setValue(`params.${index}.value`, value)}
                                        availableOutputs={availableOutputs}
                                        placeholder="Param Value"
                                        singleLine
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeParam(index)}>
                                    <TrashIcon size={14} />
                                </Button>
                            </div>
                        ))}
                        {paramFields.length === 0 && <p className="text-xs text-muted-foreground">点击上方添加按钮添加 Query 参数</p>}
                    </div>
                </Field>
                {/* 请求体 */}
                {showBody && (
                    <Field>
                        <FieldLabel className="mb-3">请求体 (Body)</FieldLabel>

                        {/* Body 类型 Radio Group */}
                        <RadioGroup
                            value={bodyType}
                            onValueChange={(value: BodyType) => setValue('bodyType', value)}
                            className="flex flex-wrap gap-4 mb-4"
                        >
                            {bodyTypeOptions.map(option => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={`body-type-${option.value}`} />
                                    <Label htmlFor={`body-type-${option.value}`} className="text-sm font-normal cursor-pointer">
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        {/* JSON 或 raw 模式：使用多行编辑器 */}
                        {useTextEditor && (
                            <VariableEditor
                                value={body}
                                onChange={value => setValue('body', value)}
                                availableOutputs={availableOutputs}
                                placeholder={bodyType === 'json' ? '{"key": "value"}' : '请输入文本内容...'}
                                minHeight="120px"
                                className="font-mono text-xs"
                            />
                        )}

                        {/* Form 模式：键值对形式 */}
                        {useFormData && (
                            <div className="space-y-2">
                                <div className="flex justify-end">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => appendFormData({ key: '', value: '' })}>
                                        <PlusIcon size={14} className="mr-1" />
                                        添加字段
                                    </Button>
                                </div>
                                {formDataFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Field Name"
                                            className="flex-1 h-9"
                                            {...register(`formData.${index}.key` as const)}
                                        />
                                        <div className="flex-1">
                                            <VariableEditor
                                                value={watch(`formData.${index}.value`)}
                                                onChange={value => setValue(`formData.${index}.value`, value)}
                                                availableOutputs={availableOutputs}
                                                placeholder="Field Value"
                                                singleLine
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeFormData(index)}>
                                            <TrashIcon size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {formDataFields.length === 0 && (
                                    <p className="text-xs text-muted-foreground">点击上方添加按钮添加表单字段</p>
                                )}
                            </div>
                        )}

                        {/* binary 模式：文件上传提示 */}
                        {bodyType === 'binary' && (
                            <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground text-sm">
                                Binary 模式暂不支持，请使用其他方式上传文件
                            </div>
                        )}
                    </Field>
                )}
            </Field>
        </form>
    )
}
