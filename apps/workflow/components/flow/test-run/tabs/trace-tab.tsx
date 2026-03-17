import { ExecutionLogEntry, NodeKind } from '@aiflow-demo/ai-engine'
import { Node } from '@xyflow/react'
import { AlertCircleIcon, CheckCircle2Icon, ChevronDownIcon, ClockIcon, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { NodeTraceInfo, NodeTraceStatus } from '@/lib/types/test-run'
import { cn } from '@/lib/utils'

interface TraceTabProps {
    nodeTraces: Map<string, NodeTraceInfo>
    nodes: Node[]
}

/**
 * Node type labels
 */
const NODE_TYPE_LABELS: Record<string, string> = {
    start: '开始',
    end: '结束',
    llm: 'LLM',
    http: 'HTTP',
    condition: '条件',
    code: '代码',
    loop: '循环',
}

/**
 * Format duration
 */
function formatDuration(ms?: number): string {
    if (ms === undefined) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Status icon component
 */
function StatusIcon({ status }: { status: NodeTraceStatus }) {
    switch (status) {
        case 'running':
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        case 'success':
            return <CheckCircle2Icon className="h-4 w-4 text-green-500" />
        case 'error':
            return <AlertCircleIcon className="h-4 w-4 text-red-500" />
        default:
            return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
}

/**
 * Get status background color
 */
function getStatusBg(status: NodeTraceStatus): string {
    switch (status) {
        case 'running':
            return 'border-blue-200 bg-blue-50/50'
        case 'success':
            return 'border-green-200 bg-green-50/50'
        case 'error':
            return 'border-red-200 bg-red-50/50'
        default:
            return 'border-gray-200 bg-gray-50/50'
    }
}

/**
 * Log level badge
 */
function LogLevelBadge({ level }: { level: ExecutionLogEntry['level'] }) {
    const colors: Record<string, string> = {
        debug: 'bg-gray-100 text-gray-600',
        info: 'bg-blue-100 text-blue-600',
        warn: 'bg-yellow-100 text-yellow-600',
        error: 'bg-red-100 text-red-600',
    }
    return <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${colors[level] || colors.info}`}>{level}</span>
}

/**
 * Node Trace Item Component
 */
function NodeTraceItem({ trace, nodeType }: { trace: NodeTraceInfo; nodeType: NodeKind }) {
    const [isOpen, setIsOpen] = useState(false)

    const hasDetails = trace.outputs || trace.error || trace.logs.length > 0

    return (
        <Collapsible>
            <div className={cn('border rounded-lg transition-colors', getStatusBg(trace.status))}>
                <CollapsibleTrigger asChild>
                    <button
                        className="flex items-center justify-between w-full p-3 text-left hover:bg-black/5 transition-colors"
                        disabled={!hasDetails}
                    >
                        <div className="flex items-center gap-3">
                            <StatusIcon status={trace.status} />
                            <div>
                                <p className="text-sm font-medium">{trace.nodeName}</p>
                                <p className="text-xs text-muted-foreground">{NODE_TYPE_LABELS[nodeType] || nodeType}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {trace.duration !== undefined && (
                                <span className="text-xs text-muted-foreground">{formatDuration(trace.duration)}</span>
                            )}
                            {hasDetails && (
                                <ChevronDownIcon
                                    className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
                                />
                            )}
                        </div>
                    </button>
                </CollapsibleTrigger>
                {hasDetails && (
                    <CollapsibleContent>
                        <div className="border-t p-3 space-y-3">
                            {/* Error */}
                            {trace.error && (
                                <div className="bg-red-50 border border-red-200 rounded p-2 overflow-hidden">
                                    <p className="text-xs font-medium text-red-700 mb-1">错误信息</p>
                                    <p className="text-xs font-mono text-red-600 break-all">{trace.error}</p>
                                </div>
                            )}

                            {/* Outputs */}
                            {trace.outputs && Object.keys(trace.outputs).length > 0 && (
                                <div className="overflow-hidden">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">输出</p>
                                    <pre className="text-xs font-mono bg-muted/50 p-2 rounded overflow-auto max-h-[200px] whitespace-pre-wrap break-all">
                                        {JSON.stringify(trace.outputs, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Logs */}
                            {trace.logs.length > 0 && (
                                <div className="overflow-hidden">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">日志 ({trace.logs.length})</p>
                                    <div className="space-y-1 max-h-[200px] overflow-auto">
                                        {trace.logs.map((log, idx) => (
                                            <div key={idx} className="text-xs font-mono bg-muted/30 p-1.5 rounded flex gap-2">
                                                <LogLevelBadge level={log.level} />
                                                <span className="flex-1 break-all">{log.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                )}
            </div>
        </Collapsible>
    )
}

export function TraceTab({ nodeTraces, nodes }: TraceTabProps) {
    // Order traces based on node order in the workflow
    const orderedTraces = useMemo(() => {
        const traces: Array<{ trace: NodeTraceInfo; nodeType: NodeKind }> = []

        // Create a map for quick node lookup
        const nodeMap = new Map(nodes.map(n => [n.id, n]))

        // Get traces in the order they appear in nodeTraces (which should be execution order)
        for (const [nodeId, trace] of nodeTraces) {
            const node = nodeMap.get(nodeId)
            if (node) {
                traces.push({
                    trace,
                    nodeType: node.type as NodeKind,
                })
            }
        }

        return traces
    }, [nodeTraces, nodes])

    // Calculate summary stats
    const status = useMemo(() => {
        let pending = 0
        let running = 0
        let success = 0
        let error = 0

        for (const { trace } of orderedTraces) {
            switch (trace.status) {
                case 'pending':
                    pending++
                    break
                case 'running':
                    running++
                    break
                case 'success':
                    success++
                    break
                case 'error':
                    error++
                    break
                default:
                    break
            }
        }
        return { pending, running, success, error, total: orderedTraces.length }
    }, [orderedTraces])

    if (orderedTraces.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">运行工作流后查看执行追踪</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {' '}
            {/* Summary */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                    共 <strong className="text-foreground">{status.total}</strong> 个节点
                </span>
                {status.success > 0 && (
                    <span className="flex items-center gap-1">
                        <CheckCircle2Icon className="h-3 w-3 text-green-500" />
                        {status.success} 成功
                    </span>
                )}
                {status.running > 0 && (
                    <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                        {status.running} 运行中
                    </span>
                )}
                {status.error > 0 && (
                    <span className="flex items-center gap-1">
                        <AlertCircleIcon className="h-3 w-3 text-red-500" />
                        {status.error} 失败
                    </span>
                )}
                {status.pending > 0 && (
                    <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        {status.pending} 等待
                    </span>
                )}
            </div>
            {/* Node Traces */}
            <div className="space-y-2">
                {orderedTraces.map(({ trace, nodeType }) => (
                    <NodeTraceItem key={trace.nodeId} trace={trace} nodeType={nodeType} />
                ))}
            </div>
        </div>
    )
}
