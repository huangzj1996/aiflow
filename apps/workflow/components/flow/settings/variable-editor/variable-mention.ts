export interface VariableMentionOptions {
    HTMLAttributes?: Record<string, unknown>
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        variableMention: {
            insertVariable: (attrs: { nodeId: string; nodeLabel: string; variableName: string; variableLabel: string }) => ReturnType
        }
    }
}
