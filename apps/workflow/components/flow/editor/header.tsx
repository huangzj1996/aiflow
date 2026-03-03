import { IconHistory } from '@tabler/icons-react'
import { ChevronDownIcon, History, Play, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
const time = new Date().toLocaleTimeString()

export const FlowEditorHeader = () => {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-transparent absolute top-0 left-0 w-full z-10">
            <div className="text-xs text-muted-foreground">自动保存 {time} · 未发布 </div>
            <div className="flex gap-2 shrink-0">
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
                    <PopoverContent align="end" sideOffset={6} className="rounded-xl p-0 text-sm bg-white w-60">
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
        </div>
    )
}
