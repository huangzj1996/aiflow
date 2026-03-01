import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { Editor, Extension, Range as TiptapRange } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'

import { AvailableNodeOutput, NodeOutputVariable } from '../node-outputs'
import { SlashCommandList, SlashCommandListRef } from './slash-command-list'

export interface SlashCommandItem {
    type: 'node' | 'variable'
    nodeOutput?: AvailableNodeOutput
    variable?: NodeOutputVariable
}

export interface SlashCommandOptions {
    suggestion: Omit<SuggestionOptions<SlashCommandItem>, 'editor'>
    availableOutputs: AvailableNodeOutput[]
}

export const SlashCommand = Extension.create({
    name: 'slashCommand',
    addOptions() {
        // console.log('Extension addOptions')

        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: { editor: Editor; range: TiptapRange; props: SlashCommandItem }) => {
                    // console.log('slashCommand command', editor, range, props)
                    const item = props
                    if (item.type === 'variable' && item.nodeOutput && item.variable) {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .insertVariable({
                                nodeId: item.nodeOutput.nodeId,
                                nodeLabel: item.nodeOutput.nodeLabel,
                                variableName: item.variable.name,
                                variableLabel: item.variable.label,
                            })
                            .run()
                    }
                },
            },
            availableOutputs: [],
        }
    },
    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
                items: ({ query }) => {
                    const items: SlashCommandItem[] = []
                    const lowerQuery = query.toLowerCase()
                    this.options.availableOutputs.forEach((nodeOutput: AvailableNodeOutput) => {
                        nodeOutput.outputs.forEach((variable: NodeOutputVariable) => {
                            const searchText =
                                `${nodeOutput.nodeLabel} ${nodeOutput.nodeId} ${variable.name} ${variable.label}`.toLowerCase()
                            if (!query || searchText.includes(lowerQuery)) {
                                items.push({
                                    type: 'variable',
                                    nodeOutput,
                                    variable,
                                })
                            }
                        })
                    })
                    return items.slice(0, 10)
                },
                render() {
                    let component: ReactRenderer<SlashCommandListRef> | null = null
                    let floatingEl: HTMLDivElement | null = null
                    let cleanup: (() => void) | null = null
                    let blurHandler: (() => void) | null = null

                    const hideFloating = () => {
                        if (floatingEl) {
                            floatingEl.style.display = 'none'
                        }
                    }
                    const updatePosition = (clientRect: (() => DOMRect | null) | null) => {
                        if (!floatingEl || !clientRect) return

                        const rect = clientRect()
                        if (!rect) return

                        // 创建一个虚拟的参考元素
                        const virtualEl = {
                            getBoundingClientRect: () => rect,
                        }

                        computePosition(virtualEl, floatingEl, {
                            placement: 'bottom-start',
                            strategy: 'fixed',
                            middleware: [offset(4), flip(), shift({ padding: 8 })],
                        }).then(({ x, y }) => {
                            if (floatingEl) {
                                Object.assign(floatingEl.style, {
                                    left: `${x}px`,
                                    top: `${y}px`,
                                })
                            }
                        })
                    }
                    return {
                        onStart: props => {
                            // console.log('onStart', props)
                            component = new ReactRenderer(SlashCommandList, {
                                props,
                                editor: props.editor,
                            })
                            if (!props.clientRect) {
                                return
                            }
                            // 创建浮动容器
                            floatingEl = document.createElement('div')
                            floatingEl.style.cssText = `
                                position: fixed;
                                left: 0;
                                top: 0;
                                z-index: 9999;
                                pointer-events: auto;
                            `
                            floatingEl.appendChild(component.element)
                            document.body.appendChild(floatingEl)

                            // 计算初始位置
                            updatePosition(props.clientRect)

                            // 设置自动更新（当滚动或 resize 时）
                            const rect = props.clientRect()

                            if (rect) {
                                const virtualEl = {
                                    getBoundingClientRect: () => props.clientRect?.() ?? rect,
                                }
                                cleanup = autoUpdate(virtualEl, floatingEl, () => {
                                    updatePosition(props.clientRect ?? null)
                                })
                            }

                            // 监听编辑器失去焦点事件
                            blurHandler = () => {
                                // 延迟一下，让点击事件先执行
                                setTimeout(() => {
                                    hideFloating()
                                }, 150)
                            }
                            props.editor.view.dom.addEventListener('blur', blurHandler)
                        },

                        onUpdate(props) {
                            // console.log('onUpdate', props)

                            component?.updateProps(props)

                            if (!props.clientRect) {
                                return
                            }

                            updatePosition(props.clientRect)
                        },
                        onKeyDown(props) {
                            // console.log('onKeyDown', props)

                            if (props.event.key === 'Escape') {
                                hideFloating()
                                return true
                            }

                            return component?.ref?.onKeyDown(props) ?? false
                        },
                        onExit() {
                            // console.log('onExit')
                            // 移除 blur 事件监听
                            if (blurHandler && component) {
                                component.editor.view.dom.removeEventListener('blur', blurHandler)
                            }
                            cleanup?.()
                            floatingEl?.remove()
                            component?.destroy()
                            floatingEl = null
                            cleanup = null
                            blurHandler = null
                        },
                    }
                },
            }),
        ]
    },
})
