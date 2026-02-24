import { IconHistory } from '@tabler/icons-react'
import { Node } from '@xyflow/react'
import clsx from 'clsx'
import { ChevronDownIcon, Play, PlayCircle } from 'lucide-react'
import { History } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

import { getColor, getIcon } from '../icon-map'
import { DynamicFormRenderer } from './dynamic-form-renderer'

const Settings = ({ node, onUpdateNode }: { node?: Node; onUpdateNode?: (nodeId: string, data: any) => void }) => {
    const NodeIcon = node?.type && getIcon(node.type)

    const handleSave = (data: any) => {
        if (node && onUpdateNode) {
            onUpdateNode(node.id, { ...node.data, config: data })
        }
    }
    return (
        <div className="w-[350px] flex flex-col items-end">
            <div className="flex mb-4 gap-2">
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
            <div className="w-full bg-white p-4 rounded-md shadow-md">
                <div className="flex items-center mb-6">
                    {node?.type && (
                        <div className={clsx('mr-3 text-white rounded-lg p-2 shadow-sm', node.type && getColor(node.type))}>{NodeIcon}</div>
                    )}
                    <span className="font-bold">{node?.type}</span>
                </div>
                <div className="space-y-4">{node && <DynamicFormRenderer node={node} onSave={handleSave} />}</div>
            </div>
        </div>
    )
}

export default Settings
