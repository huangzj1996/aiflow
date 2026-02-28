import { IconHistory } from '@tabler/icons-react'
import { Edge, Node } from '@xyflow/react'
import clsx from 'clsx'
import { ChevronDownIcon, Play, PlayCircle, X } from 'lucide-react'
import { History } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

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
            <div className="flex mb-4 gap-2 shrink-0">
                <ButtonGroup>
                    <Button variant="outline" size="sm">
                        <Play /> 测试运行
                    </Button>
                    <Button variant="outline" size="icon-sm">
                        <History />
                    </Button>
                </ButtonGroup>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="default" size="sm" aria-label="Open Popover">
                            发布
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="rounded-xl p-0 text-sm">
                        <div className="p-4 text-sm *:[p:not(:last-child)]:mb-2">
                            <p className="font-medium">最新发布</p>
                            <p className="text-muted-foreground">发布于 4 个月前</p>
                            <Button variant="default" size="sm" className="w-full">
                                发布更新
                            </Button>
                        </div>
                        <Separator />
                        <div className="p-4 text-sm *:[p:not(:last-child)]:mb-2">
                            <Button variant="secondary" size="sm" className="w-full justify-start">
                                <PlayCircle size={12} /> 运行
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button variant="outline" size="icon-sm">
                    <IconHistory />
                </Button>
            </div>
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
                    <div className="space-y-4 px-4 overflow-y-auto h-[calc(100vh-240px)]">
                        {node && <DynamicFormRenderer node={node} onSave={handleSave} flowContext={flowContext} />}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Settings
