/**
 * 取消发布应用 API
 * POST /api/apps/[id]/unpublish
 *
 * 将应用标记为未发布，清除 API Key
 */

import { NextRequest, NextResponse } from 'next/server'

import { apiError, ErrorCode } from '@/lib/api-response'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
                isPublished: true,
            },
        })

        if (!app) {
            return apiError(ErrorCode.APP_NOT_FOUND, '应用不存在')
        }

        if (!app.isPublished) {
            return apiError(ErrorCode.APP_NOT_FOUND, '应用未发布')
        }

        await prisma.app.update({
            where: {
                id: appId,
            },
            data: {
                isPublished: false,
                apiKey: null,
                publishedAt: null,
                publishedWorkflowId: null,
            },
        })

        return NextResponse.json({
            success: true,
            data: {
                message: '应用已取消发布',
            },
        })
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('取消发布应用失败:', error)
        return apiError(ErrorCode.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : '取消发布失败')
    }
}
