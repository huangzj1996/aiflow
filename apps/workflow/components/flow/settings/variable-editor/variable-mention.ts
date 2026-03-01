import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { VariableMentionComponent } from './variable-mention-component'

export interface VariableMentionOptions {
    HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        variableMention: {
            insertVariable: (attrs: { nodeId: string; nodeLabel: string; variableName: string; variableLabel: string }) => ReturnType
        }
    }
}

export const VariableMention = Node.create<VariableMentionOptions>({
    name: 'variableMention',
    group: 'inline',
    inline: true,
    selectable: true,
    atom: true,
    addOptions() {
        return {
            HTMLAttributes: {},
        }
    },
    addAttributes() {
        return {
            nodeId: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-node-id'),
                renderHTML: (attributes: Record<string, unknown>) => {
                    // console.log('addAttributes - renderHTML')

                    return {
                        'data-node-id': attributes.nodeId,
                    }
                },
            },
            nodeLabel: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-node-id'),
                renderHTML: (attributes: Record<string, unknown>) => ({
                    'data-node-label': attributes.nodeLabel,
                }),
            },
            variableName: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-variable-name'),
                renderHTML: (attributes: Record<string, unknown>) => ({
                    'data-variable-name': attributes.variableName,
                }),
            },
            variableLabel: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-variable-label'),
                renderHTML: (attributes: Record<string, unknown>) => ({
                    'data-variable-label': attributes.variableLabel,
                }),
            },
        }
    },
    parseHTML() {
        // console.log('parseHTML')

        return [
            {
                tag: 'span[data-variable-mention]',
            },
        ]
    },
    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
        // console.log('renderHTML', HTMLAttributes)

        return [
            'span',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-variable-mention': '', class: 'variable-mention' }),
        ]
    },
    addNodeView() {
        // console.log('addNodeView')

        return ReactNodeViewRenderer(VariableMentionComponent)
    },
    addCommands() {
        // console.log('addCommands')
        return {
            insertVariable:
                attrs =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs,
                    })
                },
        }
    },
})
