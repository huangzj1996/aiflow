// ============================================================
// 类型定义
// ============================================================

import { NextRequest } from 'next/server'

import { Prisma } from '@/generated/prisma/browser'
import { apiError, apiSuccess, ErrorCode } from '@/lib/api-response'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface FlowNode {
    id: string
    type: string
    position: { x: number; y: number }
    data?: Record<string, unknown>
}

interface FlowEdge {
    id: string
    source: string
    sourceHandle?: string
    target: string
    [key: string]: unknown
}

interface WorkflowData {
    nodes: FlowNode[]
    edges: FlowEdge[]
}

interface UpdateWorkflowRequest {
    nodes: FlowNode[]
    edges: FlowEdge[]
}

// ============================================================
// GET /api/apps/[id]/workflow - 获取应用工作流
// ============================================================

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const userId = await getCurrentUserId()

        if (!userId) {
            return apiError(ErrorCode.UNAUTHORIZED, '请先登录')
        }

        // 获取app
        const app = await prisma.app.findFirst({
            where: {
                id,
                userId,
                isDeleted: false,
            },
        })

        if (!app) {
            return apiError(ErrorCode.APP_NOT_FOUND, '应用不存在')
        }

        // 获取工作流（如果存在）
        const workflow = await prisma.workflow.findFirst({
            where: {
                appId: id,
            },
            orderBy: {
                version: 'desc',
            },
        })

        if (!workflow) {
            return apiSuccess<WorkflowData>({
                nodes: [],
                edges: [],
            })
        }

        return apiSuccess<WorkflowData>({
            nodes: workflow.nodes as unknown as FlowNode[],
            edges: workflow.edges as unknown as FlowEdge[],
        })
    } catch (error) {
        return apiError(ErrorCode.INTERNAL_SERVER_ERROR, '获取工作流失败')
    }
}

// ============================================================
// POST /api/apps/[id]/workflow - 创建/更新工作流
// ============================================================
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const userId = await getCurrentUserId()
        if (!userId) {
            return apiError(ErrorCode.UNAUTHORIZED, '请先登录')
        }

        const app = await prisma.app.findFirst({
            where: {
                id,
                userId,
                isDeleted: false,
            },
        })

        if (!app) {
            return apiError(ErrorCode.APP_NOT_FOUND, '应用不存在')
        }

        const body = (await req.json()) as UpdateWorkflowRequest
        const { nodes, edges } = body

        if (!nodes || !Array.isArray(nodes)) {
            return apiError(ErrorCode.INVALID_REQUEST, '节点数据格式错误')
        }

        if (!edges || !Array.isArray(edges)) {
            return apiError(ErrorCode.INVALID_REQUEST, '边数据格式错误')
        }

        const existingWorkflow = await prisma.workflow.findFirst({
            where: {
                appId: id,
            },
            orderBy: {
                version: 'desc',
            },
        })

        let workflow
        if (existingWorkflow) {
            workflow = await prisma.workflow.update({
                where: {
                    id: existingWorkflow.id,
                },
                data: {
                    nodes: nodes as unknown as Prisma.InputJsonValue,
                    edges: edges as unknown as Prisma.InputJsonValue,
                    updatedAt: new Date(),
                },
            })
        } else {
            workflow = await prisma.workflow.create({
                data: {
                    name: `${app.name} - 工作流`,
                    appId: id,
                    nodes: nodes as unknown as Prisma.InputJsonValue,
                    edges: edges as unknown as Prisma.InputJsonValue,
                    version: 1,
                },
            })
        }
        return apiSuccess<WorkflowData>({
            nodes: workflow.nodes as unknown as FlowNode[],
            edges: workflow.edges as unknown as FlowEdge[],
        })
    } catch (error) {
        return apiError(ErrorCode.INTERNAL_SERVER_ERROR, '保存工作流失败')
    }
}
