import { Node } from '@xyflow/react'
import { ComponentType } from 'react'

/**
 * 节点类型
 */
export type NodeKind = 'start' | 'llm' | 'tool' | 'condition' | 'end'

/**
 * 节点设置表单的属性接口
 */
export interface NodeSettingsFormProps<T = any> {
    node: Node
    onSave?: (data: T) => void
    onCancel?: () => void
}

/**
 * 节点设置表单组件类型
 */
export type NodeSettingsFormComponent<T = any> = ComponentType<NodeSettingsFormProps<T>>

/**
 * 节点设置表单策略接口
 */
export interface NodeSettingsStrategy {
    /**
     * 获取指定节点类型的设置表单组件
     */
    getFormComponent(nodeType: NodeKind): NodeSettingsFormComponent | null

    /**
     * 注册节点类型的设置表单组件
     */
    register(nodeType: NodeKind, component: NodeSettingsFormComponent): void

    /**
     * 检查是否支持该节点类型
     */
    supports(nodeType: NodeKind): boolean
}
