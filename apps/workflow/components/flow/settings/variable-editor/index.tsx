'use client'

import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { XIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getColor, ICON_MAP } from '../../icon-map'
import { AvailableNodeOutput, formatVariableExpression, NodeOutputVariable } from '../node-outputs'
import { NodeKind } from '../types'
import { SlashCommand } from './slash-command'
import { VariableMention } from './variable-mention'
interface VariableEditorProps {
    /** 编辑器的值 （纯文本格式，包含 ${nodeId.field} 变量）  */
    value: string
    /** 当值改变时调用的回调函数 */
    onChange: (value: string) => void
    /** 可用的上游节点输出变量 */
    availableOutputs: AvailableNodeOutput[]
    /** 输入框占位符 */
    placeholder?: string
    /** 输入框最小高度 */
    minHeight?: string
    /** 是否禁用输入框 */
    disabled?: boolean
    /** 自定义输入框类名 */
    className?: string
    /** 单行模式：高度与input一致，不显示提示文本 */
    singleLine?: boolean
    /** 单变量模式：只允许输入一个变量，不能输入文本 */
    singleVariable?: boolean
}
/**
 * 将纯文本（包含 ${nodeId.field} 变量）转换为 Tiptap JSON 内容
 */
function textToContent(text: string, availableOutputs: AvailableNodeOutput[]): JSONContent {
    const content: JSONContent[] = []
    const variableRegex = /\$\{([^.]+)\.([^}]+)\}/g

    let lastIndex = 0
    let match

    while ((match = variableRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const textBefore = text.slice(lastIndex, match.index)
            if (textBefore) {
                content.push({
                    type: 'text',
                    text: textBefore,
                })
            }
        }

        const nodeId = match[1]
        const variableName = match[2]

        const nodeOutput = availableOutputs.find(n => n.nodeId === nodeId)
        const variable = nodeOutput?.outputs?.find(o => o.name === variableName)

        content.push({
            type: 'variableMention',
            attrs: {
                nodeId,
                nodeLabel: nodeOutput?.nodeLabel || nodeId,
                variableName,
                variableLabel: variable?.label || variableName,
            },
        })
        lastIndex = match.index + match[0].length
    }

    // 添加最后的文本
    if (lastIndex < text.length) {
        content.push({ type: 'text', text: text.slice(lastIndex) })
    }

    if (content.length === 0) {
        return { type: 'doc', content: [{ type: 'paragraph' }] }
    }
    return {
        type: 'doc',
        content: [{ type: 'paragraph', content }],
    }
}

/**
 * 将 Tiptap JSON 内容转换为纯文本（包含 ${nodeId.field} 变量）
 */
function contentToText(content: JSONContent): string {
    if (!content.content) return ''
    let result = ''
    const processNode = (node: JSONContent) => {
        if (node.type === 'text') {
            result += node.text || ''
        } else if (node.type === 'variableMention') {
            const { nodeId, variableName } = node.attrs || {}
            result += formatVariableExpression(nodeId, variableName)
        } else if (node.type === 'paragraph') {
            if (node.content) {
                node.content.forEach(processNode)
            }
            result += '\n'
        } else if (node.content) {
            node.content.forEach(processNode)
        }
    }
    content.content.forEach(processNode)

    // 移除末尾多余的换行
    return result.replace(/\n$/, '')
}

/**
 * 解析变量表达式，返回节点ID和变量名
 */
function parseVariableExpression(value: string): { nodeId: string; variableName: string } | null {
    const match = value.match(/\$\{([^.]+)\.([^}]+)\}/)
    if (match) {
        return { nodeId: match[1], variableName: match[2] }
    }
    return null
}

/**
 * 变量标签组件 - 与富文本中的样式一致
 */
function VariableTag({
    nodeOutput,
    variable,
    onRemove,
}: {
    nodeOutput: AvailableNodeOutput
    variable: NodeOutputVariable
    onRemove?: () => void
}) {
    const nodeType = nodeOutput.nodeId.split('-')[0] as NodeKind
    const NodeIcon = ICON_MAP[nodeType]
    const bgColor = getColor(nodeType)

    return (
        <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
            style={{
                backgroundColor: 'var(--primary-50, #eff6ff)',
                color: 'var(--primary-700, #1d4ed8)',
            }}
        >
            <span className={`w-4 h-4 rounded flex items-center justify-center text-white ${bgColor}`} style={{ fontSize: '10px' }}>
                {NodeIcon && <NodeIcon size={10} />}
            </span>
            <span className="font-medium">{nodeOutput.nodeLabel}</span>
            <span className="text-gray-400">/</span>
            <span className="font-mono">{variable.name}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={e => {
                        e.stopPropagation()
                        onRemove()
                    }}
                    className="ml-0.5 hover:text-red-500 transition-colors"
                >
                    <XIcon size={12} />
                </button>
            )}
        </span>
    )
}

function SingleVariableSelector({
    value,
    onChange,
    availableOutputs,
    placeholder,
    disabled,
}: Pick<VariableEditorProps, 'value' | 'onChange' | 'availableOutputs' | 'placeholder' | 'disabled'>) {
    const [open, setOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // 扁平化所有变量
    const flatItems = useMemo(() => {
        const items: { nodeOutput: AvailableNodeOutput; variable: NodeOutputVariable }[] = []
        availableOutputs.forEach(nodeOutput => {
            nodeOutput.outputs.forEach(variable => {
                items.push({ nodeOutput, variable })
            })
        })
        return items
    }, [availableOutputs])

    const selectedVariable = useMemo(() => {
        const parsed = parseVariableExpression(value)
        if (!parsed) return null

        const nodeOutput = availableOutputs.find(n => n.nodeId === parsed.nodeId)
        const variable = nodeOutput?.outputs.find(v => v.name === parsed.variableName)

        if (nodeOutput && variable) return { nodeOutput, variable }

        return null
    }, [value, availableOutputs])

    // 按节点分组
    const groupedItems = useMemo(() => {
        const groups: { nodeOutput: AvailableNodeOutput; variables: { variable: NodeOutputVariable; flatIndex: number }[] }[] = []
        let flatIndex = 0
        availableOutputs.forEach(nodeOutput => {
            const variables = nodeOutput.outputs.map(variable => ({ variable, flatIndex: flatIndex++ }))
            groups.push({ nodeOutput, variables })
        })
        return groups
    }, [availableOutputs])

    const handleSelect = (nodeOutput: AvailableNodeOutput, variable: NodeOutputVariable) => {
        const expression = formatVariableExpression(nodeOutput.nodeId, variable.name)
        onChange(expression)
        setOpen(false)
    }

    const handleClear = () => {
        onChange('')
    }

    // 处理键盘导航
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault()
                setOpen(true)
            }
            return
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex((selectedIndex + flatItems.length - 1) % flatItems.length)
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex((selectedIndex + 1) % flatItems.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            const item = flatItems[selectedIndex]
            if (item) {
                handleSelect(item.nodeOutput, item.variable)
            }
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setOpen(false)
        }
    }

    // 失去焦点时关闭
    const handleBlur = (e: React.FocusEvent) => {
        // 检查焦点是否移到了下拉列表内部
        if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
            setOpen(false)
        }
    }

    // 阻止 mousedown 防止失去焦点
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
    }
    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                disabled={disabled}
                className="w-full h-8 px-3 flex items-center justify-between rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white"
            >
                {selectedVariable ? (
                    <VariableTag nodeOutput={selectedVariable.nodeOutput} variable={selectedVariable.variable} onRemove={handleClear} />
                ) : (
                    <span className="text-muted-foreground">{placeholder || '选择变量'}</span>
                )}
            </button>
            {open && (
                <div
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg min-w-[300px]"
                    onMouseDown={handleMouseDown}
                >
                    <div className="px-3 py-2 border-b bg-muted/30">
                        <span className="text-xs font-medium text-muted-foreground">选择变量</span>
                    </div>
                    <div className="max-h-[220px] overflow-auto">
                        {groupedItems.length > 0 ? (
                            groupedItems.map(group => {
                                const { nodeOutput } = group
                                const nodeType = nodeOutput.nodeId.split('-')[0] as NodeKind
                                const NodeIcon = ICON_MAP[nodeType]
                                const bgColor = getColor(nodeType)

                                return (
                                    <div key={nodeOutput.nodeId}>
                                        {/* 节点分组标题 */}
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 border-b">
                                            <span
                                                className={`w-5 h-5 rounded flex items-center justify-center text-white shrink-0 ${bgColor}`}
                                            >
                                                {NodeIcon && <NodeIcon size={12} />}
                                            </span>
                                            <span className="text-xs font-medium text-foreground">{nodeOutput.nodeLabel}</span>
                                            <span className="text-xs text-muted-foreground">({nodeOutput.nodeId})</span>
                                        </div>
                                        {/* 变量列表 */}
                                        {group.variables.map(({ variable, flatIndex }) => (
                                            <button
                                                key={`${nodeOutput.nodeId}-${variable.name}`}
                                                type="button"
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors pl-10 ${
                                                    flatIndex === selectedIndex ? 'bg-primary/10' : 'hover:bg-muted/50'
                                                }`}
                                                onClick={() => handleSelect(nodeOutput, variable)}
                                                onMouseEnter={() => setSelectedIndex(flatIndex)}
                                            >
                                                <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                    {variable.name}
                                                </code>
                                                <span className="text-xs text-muted-foreground flex-1 truncate">{variable.label}</span>
                                                <span className="text-xs text-muted-foreground/60">{variable.type}</span>
                                            </button>
                                        ))}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-3 text-sm text-muted-foreground">没有可用的变量</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * 富文本编辑器内部组件 - 避免条件 Hooks 问题
 */
function RichTextEditor({
    value,
    onChange,
    availableOutputs,
    placeholder,
    minHeight,
    disabled,
    className,
    singleLine,
}: Omit<VariableEditorProps, 'singleVariable'>) {
    const initialContent = useMemo(() => textToContent(value, availableOutputs), [value, availableOutputs])
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                bulletList: false,
                orderedList: false,
                blockquote: false,
                codeBlock: false,
                horizontalRule: false,
                // 单行模式禁用硬换行
                hardBreak: singleLine ? false : {},
            }),
            Placeholder.configure({
                placeholder,
            }),
            VariableMention,
            SlashCommand.configure({
                availableOutputs,
            }),
        ],
        editable: !disabled,
        content: initialContent,
        onUpdate: ({ editor: ed }) => {
            const json = ed.getJSON()
            const text = contentToText(json)
            onChange(text)
        },
        editorProps: {
            attributes: {
                class: 'outline-none',
            },
            handleKeyDown: singleLine
                ? (_view, event) => {
                      if (event.key === 'Enter') {
                          // 阻止默认行为，避免插入换行符
                          event.preventDefault()
                          return true
                      }
                      return false
                  }
                : undefined,
        },
        immediatelyRender: false,
    })
    // 当 availableOutputs 变化时更新 SlashCommand
    useEffect(() => {
        if (editor) {
            // Tiptap 不直接支持动态更新扩展选项，这里通过重新创建来处理
            // 在实际使用中，availableOutputs 通常在节点选择时就确定了
        }
    }, [editor, availableOutputs])
    // 单行模式样式
    const containerStyle = singleLine ? { height: '36px' } : { minHeight }
    const editorClassName = singleLine
        ? 'h-full px-3 flex items-center text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:flex-1 [&_.ProseMirror]:whitespace-nowrap [&_.ProseMirror]:overflow-x-auto [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none'
        : 'px-3 py-2 text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[60px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none'

    return (
        <>
            <div className={`relative ${className || ''}`}>
                <div
                    className="rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                    style={containerStyle}
                >
                    <EditorContent editor={editor} className={editorClassName} />
                </div>
                {!singleLine && availableOutputs.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                        输入 <kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">/</kbd>插入变量
                    </p>
                )}
            </div>
        </>
    )
}

/**
 * 富文本变量编辑器
 * 支持:
 * - 变量以标签形式展示
 * - 输入 / 唤起变量选择菜单
 * - 右上角图标点击插入变量
 */

export function VariableEditor({
    value,
    onChange,
    availableOutputs,
    placeholder = '输入内容，使用 / 插入变量...',
    minHeight = '100px',
    disabled,
    className,
    singleLine = false,
    singleVariable = false,
}: VariableEditorProps) {
    if (singleVariable) {
        return (
            <SingleVariableSelector
                value={value}
                onChange={onChange}
                availableOutputs={availableOutputs}
                placeholder={placeholder}
                disabled={disabled}
            />
        )
    }
    // 富文本编辑模式
    return (
        <>
            <RichTextEditor
                value={value}
                onChange={onChange}
                availableOutputs={availableOutputs}
                placeholder={placeholder}
                minHeight={minHeight}
                disabled={disabled}
                className={className}
                singleLine={singleLine}
            />
        </>
    )
}
