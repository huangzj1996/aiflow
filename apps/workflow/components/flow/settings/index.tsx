import { Edge, Node } from '@xyflow/react'
import clsx from 'clsx'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { NodeTitleEditor } from '../editor/node-title-editor'
import { getColor, getIcon } from '../icon-map'
import { DynamicFormRenderer } from './dynamic-form-renderer'
import { FlowContext } from './types'

interface SettingsProps {
    node?: Node | null
    onUpdateNode?: (nodeId: string, data: any) => void
    onUpdateNodeLabel?: (nodeId: string, label: string) => void
    nodes?: Node[]
    edges?: Edge[]
    onClose?: () => void
}

const Settings = ({ node, onUpdateNode, onUpdateNodeLabel, nodes = [], edges = [], onClose }: SettingsProps) => {
    const NodeIcon = node?.type && getIcon(node.type)
    const flowContext: FlowContext = { nodes, edges }
    const handleSave = (data: any) => {
        if (node && onUpdateNode) {
            onUpdateNode(node.id, { ...node.data, config: data })
        }
    }

    const nodeTitle = (node?.data?.label as string) || getDefaultNodeTitle(node?.type)

    return (
        <div className="w-[400px] flex flex-col items-end max-h-screen">
            {node && (
                <div className="w-full bg-white py-4 rounded-md shadow-md">
                    <div className="flex items-center justify-between px-4 mb-6">
                        <div className="flex items-center gap-2">
                            {node?.type && (
                                <div className={clsx('text-white rounded-lg p-2 shadow-sm', node.type && getColor(node.type))}>
                                    {NodeIcon}
                                </div>
                            )}
                            <NodeTitleEditor
                                title={nodeTitle}
                                onTitleChange={(newLabel: string) => onUpdateNodeLabel?.(node.id, newLabel)}
                            />
                        </div>
                        <Button variant="outline" size="icon-sm" onClick={onClose}>
                            <X />
                        </Button>
                    </div>
                    <div className="space-y-4 px-4 overflow-y-auto h-[calc(100vh-200px)]">
                        {node && <DynamicFormRenderer node={node} onSave={handleSave} flowContext={flowContext} />}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Settings

// 默认节点标题
function getDefaultNodeTitle(type?: string): string {
    const titles: Record<string, string> = {
        start: '开始',
        llm: '大模型',
        http: 'HTTP 请求',
        condition: '条件分支',
        end: '结束',
    }
    return titles[type || ''] || '节点'
}
