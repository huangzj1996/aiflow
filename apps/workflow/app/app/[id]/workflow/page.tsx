'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { FlowEditor } from '@/components/flow/editor'
import { appService } from '@/lib/services/app-service'
import { workflowService } from '@/lib/services/workflow-service'
import type { FlowEdge, FlowNode } from '@/lib/types/workflow'
const WorkflowPage = () => {
    const { id: appId } = useParams<{ id: string }>()

    const [loading, setLoading] = useState(true)
    const [appName, setAppName] = useState('')
    const [initialNodes, setInitialNodes] = useState<FlowNode[]>([])
    const [initialEdges, setInitialEdges] = useState<FlowEdge[]>([])

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                const [app, workflow] = await Promise.all([
                    appService.getById(appId),
                    workflowService.getByAppId(appId).catch(() => ({ edges: [], nodes: [] })),
                ])

                setAppName(app.name)
                setInitialNodes(workflow.nodes)
                setInitialEdges(workflow.edges)
            } catch (error) {
                toast.error(error instanceof Error ? error.message : '加载数据失败')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [appId])

    if (loading) {
        return (
            <div className="flex-1 overflow-hidden flex items-center justify-center">
                <div className="text-muted-foreground">加载中...</div>
            </div>
        )
    }

    return (
        <>
            <FlowEditor appId={appId} appName={appName} initialNodes={initialNodes} initialEdges={initialEdges} />
        </>
    )
}

export default WorkflowPage
