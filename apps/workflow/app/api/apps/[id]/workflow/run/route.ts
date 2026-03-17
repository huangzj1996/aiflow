import { createWorkflowEngine, GraphBuilder, NodeKind, WorkflowDefinition } from '@aiflow-demo/ai-engine'
import { NextRequest } from 'next/server'

import { apiError, ErrorCode } from '@/lib/api-response'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
    ErrorEventData,
    NodeEndEventData,
    NodeStartEventData,
    SSEEvent,
    WorkflowEndEventData,
    WorkflowStartEventData,
} from '@/lib/types/test-run'

// ============================================================
// Types
// ============================================================

interface FlowNode {
    id: string
    type: string
    position: { x: number; y: number }
    data?: {
        label: string
        config?: Record<string, unknown>
    }
}

interface FlowEdge {
    id: string
    source: string
    target: string
    sourceHandle?: string
}

interface RunWorkflowRequest {
    nodes: FlowNode[]
    edges: FlowEdge[]
    inputs: Record<string, unknown>
}

// ============================================================
// POST /api/apps/[id]/workflow/run - Execute workflow with SSE
// ============================================================

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        //1. 获取id和用户信息
        const { id: appId } = await params
        const userId = await getCurrentUserId()

        //2. 检查权限
        if (!userId) {
            return apiError(ErrorCode.UNAUTHORIZED, '请先登录')
        }

        //3. 检查app
        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                userId,
                isDeleted: false,
            },
        })

        if (!app) {
            return apiError(ErrorCode.APP_NOT_FOUND, '应用不存在')
        }

        //4. 验证请求体
        const body = (await req.json()) as RunWorkflowRequest
        const { nodes, edges, inputs } = body
        if (!nodes || !Array.isArray(nodes)) {
            return apiError(ErrorCode.VALIDATION_ERROR, '缺少或无效的 nodes 参数')
        }
        if (!edges || !Array.isArray(edges)) {
            return apiError(ErrorCode.VALIDATION_ERROR, '缺少或无效的 edges 参数')
        }
        // Convert to ai-engine WorkflowDefinition format
        const workflow: WorkflowDefinition = {
            id: `test-${appId}-${Date.now()}`,
            name: `${app.name} - 测试运行`,
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type as NodeKind,
                data: {
                    label: n.data?.label || '',
                    config: n.data?.config || {},
                },
            })),
            edges: edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle,
            })),
        }

        // Create SSE stream
        const stream = new ReadableStream({
            async start(controller) {
                // 创建编码器，用于将字符串转换为 Uint8Array
                const encoder = new TextEncoder()

                const send = <T>(event: SSEEvent<T>) => {
                    try {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
                    } catch {
                        // 如果发送失败，关闭流
                    }
                }

                const startTime = Date.now()
                let totalTokens = 0

                try {
                    const engine = createWorkflowEngine({ verbose: true })

                    // Generate execution ID
                    const executionId = `exec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`

                    // Send workflow start event
                    send<WorkflowStartEventData>({
                        type: 'workflow:start',
                        data: { executionId },
                        timestamp: new Date().toISOString(),
                    })

                    const result = await engine.execute(workflow, inputs, {
                        onNodeStart(nodeId, nodeType, nodeName) {
                            send<NodeStartEventData>({
                                type: 'node:start',
                                data: { nodeId, nodeType, nodeName },
                                timestamp: new Date().toISOString(),
                            })
                        },
                        onNodeEnd(nodeId, result) {
                            // Update total tokens
                            if (result.outputs?.tokens !== undefined) {
                                totalTokens += result.outputs.tokens as number
                            }
                            send<NodeEndEventData>({
                                type: 'node:end',
                                data: {
                                    nodeId,
                                    success: result.success,
                                    outputs: result.outputs,
                                    error: result.error,
                                    duration: result.duration,
                                    matchedBranch: result.matchedBranch,
                                },
                                timestamp: new Date().toISOString(),
                            })
                        },
                        onLog(entry) {
                            send({
                                type: 'log',
                                data: {
                                    ...entry,
                                    // Serialize Date to string for JSON
                                    timestamp: entry.timestamp.toISOString(),
                                },
                                timestamp: new Date().toISOString(),
                            })
                        },
                    })

                    const duration = Date.now() - startTime

                    // Send workflow end event
                    send<WorkflowEndEventData>({
                        type: 'workflow:end',
                        data: {
                            success: result.success,
                            outputs: result.outputs,
                            duration,
                            totalTokens,
                            error: result.error?.message,
                        },
                        timestamp: new Date().toISOString(),
                    })
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Workflow execution error:', error)

                    send<ErrorEventData>({
                        type: 'error',
                        data: {
                            message: error instanceof Error ? error.message : '执行工作流失败',
                        },
                        timestamp: new Date().toISOString(),
                    })
                } finally {
                    controller.close()
                }
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        })
    } catch (error) {
        return apiError(ErrorCode.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : '执行工作流失败')
    }
}
