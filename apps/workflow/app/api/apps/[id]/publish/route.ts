import { NextRequest, NextResponse } from 'next/server'

import { apiError, ErrorCode } from '@/lib/api-response'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 获取应用发布状态 API
 * GET /api/apps/[id]/publish
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: appId } = await params
        const userId = await getCurrentUserId()

        if (!userId) {
            return apiError(ErrorCode.UNAUTHORIZED, '请先登录')
        }

        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                userId,
                isDeleted: false,
            },
            select: {
                id: true,
                isPublic: true,
                publishedAt: true,
                publishedWorkflowId: true,
            },
        })

        if (!app) {
            return apiError(ErrorCode.APP_NOT_FOUND, '应用不存在')
        }

        return NextResponse.json({
            success: true,
            data: app,
        })
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('获取发布状态失败:', error)
        return apiError(ErrorCode.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : '获取发布状态失败')
    }
}

/**
 * 发布应用 API
 * POST /api/apps/[id]/publish
 *
 * 验证权限后，锁定当前工作流版本，将应用标记为已发布
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: appId } = await params
        const userId = await getCurrentUserId()

        if (!userId) {
            return apiError(ErrorCode.UNAUTHORIZED, '请先登录')
        }

        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                userId,
                isDeleted: false,
            },
            select: {
                id: true,
                name: true,
                isPublic: true,
                publishedWorkflowId: true,
            },
        })

        if (!app) {
            return apiError(ErrorCode.APP_NOT_FOUND, '应用不存在')
        }

        const workflow = await prisma.workflow.findFirst({
            where: {
                appId,
            },
            orderBy: {
                version: 'desc',
            },
        })

        if (!workflow) {
            return apiError(ErrorCode.INVALID_WORKFLOW, '工作流不存在')
        }

        const workflowNodes = workflow.nodes as Array<{ id: string; type: string }>
        if (workflowNodes.length === 0) {
            return apiError(ErrorCode.INVALID_WORKFLOW, '工作流节点不存在')
        }

        // 3. 验证工作流必须有开始节点和结束节点
        const nodeTypes = workflowNodes.map(n => n.type)
        if (!nodeTypes.includes('start')) {
            return apiError(ErrorCode.INVALID_WORKFLOW, '工作流缺少开始节点，无法发布')
        }
        if (!nodeTypes.includes('end')) {
            return apiError(ErrorCode.INVALID_WORKFLOW, '工作流缺少结束节点，无法发布')
        }

        // 4. 检查是否是更新发布
        const isUpdate = app.isPublic

        await prisma.app.update({
            where: {
                id: app.id,
            },
            data: {
                isPublic: true,
                publishedWorkflowId: workflow.id,
                publishedAt: new Date(),
            },
        })

        return NextResponse.json({
            success: true,
            data: {
                isUpdate,
                message: isUpdate ? '应用已更新发布！' : '应用发布成功！',
            },
        })
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('发布应用失败:', error)
        return apiError(ErrorCode.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : '发布失败')
    }
}
