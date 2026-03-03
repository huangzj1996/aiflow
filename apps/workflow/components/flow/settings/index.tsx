import { Edge, Node } from '@xyflow/react'
import clsx from 'clsx'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { getColor, getIcon } from '../icon-map'
import { DynamicFormRenderer } from './dynamic-form-renderer'
import { FlowContext } from './types'

interface SettingsProps {
    node?: Node | null
    onUpdateNode?: (nodeId: string, data: any) => void
    nodes?: Node[]
    edges?: Edge[]
}

const Settings = ({ node, onUpdateNode, nodes = [], edges = [] }: SettingsProps) => {
    const NodeIcon = node?.type && getIcon(node.type)
    const flowContext: FlowContext = { nodes, edges }
    const handleSave = (data: any) => {
        if (node && onUpdateNode) {
            onUpdateNode(node.id, { ...node.data, config: data })
        }
    }
    return (
        <div className="w-[400px] flex flex-col items-end max-h-screen">
            {node && (
                <div className="w-full bg-white py-4 rounded-md shadow-md">
                    <div className="flex items-center justify-between px-4 mb-6">
                        <div className="flex items-center">
                            {node?.type && (
                                <div className={clsx('mr-3 text-white rounded-lg p-2 shadow-sm', node.type && getColor(node.type))}>
                                    {NodeIcon}
                                </div>
                            )}
                            <span className="font-bold">{node?.type}</span>
                        </div>
                        <Button variant="outline" size="icon-sm">
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
