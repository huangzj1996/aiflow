import { IconHistory } from '@tabler/icons-react'
import { ArrowLeftIcon, ChevronDownIcon, History, Play, PlayCircle } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

import { ExecutionHistoryDropdown } from '../execution-history'

export type EditorMode = 'edit' | 'detail'

interface FlowEditorHeaderProps {
    appId?: string
    mode?: EditorMode
    appName?: string
    // 是否有未保存的变更
    hasUnsavedChanges?: boolean
    // 是否正在保存
    isSaving?: boolean
    // 最后保存时间
    lastSavedAt?: string | null
    // 保存回调
    onSave?: () => void
    onTestRun?: () => void
    onExitTestRun?: () => void
    onSelectExecution?: (executionId: string) => void
}

export const FlowEditorHeader = memo(function FlowEditorHeader({
    appName,
    appId = '',
    mode = 'edit',
    hasUnsavedChanges,
    isSaving,
    lastSavedAt,
    onSave,
    onTestRun,
    onExitTestRun,
    onSelectExecution,
}: FlowEditorHeaderProps) {
    // Detail Mode Header (viewing execution history)
    if (mode === 'detail') {
        return (
            <div className="flex items-center justify-between px-4 py-2 bg-transparent absolute top-0 left-0 w-full z-10">
                <div className="text-sm font-medium">执行详情</div>
                <Button variant="outline" size="sm" onClick={onExitTestRun}>
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    返回编辑
                </Button>
            </div>
        )
    }

    // Edit Mode Header
    const historyButton = (
        <Button variant="outline" size="icon-sm">
            <History />
        </Button>
    )

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-transparent absolute top-0 left-0 w-full z-10">
            <div className="text-xs text-muted-foreground">
                {isSaving ? (
                    <span>保存中...</span>
                ) : hasUnsavedChanges ? (
                    <span>未保存</span>
                ) : lastSavedAt ? (
                    <span>已保存 {lastSavedAt}</span>
                ) : (
                    <span>自动保存</span>
                )}
            </div>
            <div className="flex gap-2 shrink-0">
                <ButtonGroup>
                    <Button variant="outline" size="sm" onClick={onTestRun}>
                        <Play /> 测试运行
                    </Button>
                    {appId && onSelectExecution ? (
                        <ExecutionHistoryDropdown appId={appId} onSelectExecution={onSelectExecution}>
                            {historyButton}
                        </ExecutionHistoryDropdown>
                    ) : (
                        historyButton
                    )}
                </ButtonGroup>

                <Button variant="outline" size="sm" disabled={!hasUnsavedChanges || isSaving} onClick={onSave}>
                    {isSaving ? '保存中...' : '保存'}
                </Button>

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
})
