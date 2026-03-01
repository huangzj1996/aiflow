'use client'
import { Node } from '@xyflow/react'
import { useMemo } from 'react'

import { nodeSettingsRegistry } from './registry'
import { FlowContext, NodeKind } from './types'

interface DynamicFormRendererProps {
    node: Node
    onSave: (data: any) => void
    flowContext?: FlowContext
}

export function DynamicFormRenderer({ node, onSave, flowContext }: DynamicFormRendererProps) {
    const FormComponent = useMemo(() => {
        return node.type ? nodeSettingsRegistry.getFormComponent(node.type as NodeKind) : null
    }, [node.type])

    if (!FormComponent) {
        return (
            <div className="text-sm text-muted-foreground text-center py-8">
                {node.type === 'start' || node.type === 'end' ? '此节点无需配置' : '未找到该节点类型的配置表单'}
            </div>
        )
    }

    // eslint-disable-next-line react-hooks/static-components
    return <FormComponent node={node} onSave={onSave} flowContext={flowContext} />
}
