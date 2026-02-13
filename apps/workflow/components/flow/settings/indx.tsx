import { IconHistory } from '@tabler/icons-react'
import { Node } from '@xyflow/react'
import clsx from 'clsx'
import { ChevronDownIcon, Play, PlayCircle } from 'lucide-react'
import { History } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Field, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import { getColor, getIcon } from '../icon-map'

const Settings = ({ node }: { node?: Node }) => {
    const NodeIcon = node?.type && getIcon(node.type)

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
                <div className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                            模型 <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Select>
                            <SelectTrigger className="w-full" id="checkout-7j9-card-number-uw1">
                                <SelectValue placeholder="请选择默认模型" />
                            </SelectTrigger>
                            <SelectContent id="checkout-7j9-card-number-uw1">
                                <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                                <SelectItem value="gpt-4">gpt-4</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </div>
        </div>
    )
}

export default Settings
