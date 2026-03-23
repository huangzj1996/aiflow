import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { PrismaService } from '../../prisma/prisma.service.js'
import { RunWorkflowDto, WorkflowExecutionResultDto } from './dto/run-workflow.dto'

@Injectable()
export class WorkflowService {
    private readonly logger = new Logger(WorkflowService.name)
    constructor(private readonly prisma: PrismaService) {}
    /*************  ✨ Windsurf Command ⭐  *************/
    /**
     * 执行工作流
     * @param appId 应用 ID
     * @param publishedWorkflowId 发布的工作流 ID
     * @param body 工作流执行参数
     * @returns 工作流执行结果
     * @throws {BadRequestException} 如果应用未配置工作流
     * @throws {NotFoundException} 如果工作流不存在
     */
    async runWorkflow(appId: string, publishedWorkflowId: string | null, body: RunWorkflowDto): Promise<WorkflowExecutionResultDto> {
        // 获取发布的工作流
        if (!publishedWorkflowId) {
            throw new BadRequestException({ code: 'WORKFLOW_NOT_FOUND', message: '应用未配置工作流' })
        }

        const workflow = await this.prisma.workflow.findUnique({
            where: { id: publishedWorkflowId },
        })

        if (!workflow) {
            throw new NotFoundException({
                code: 'WORKFLOW_NOT_FOUND',
                message: '工作流不存在',
            })
        }

        // 生成执行 ID
        const executionId = `exec_${randomUUID().replace(/-/g, '').slice(0, 16)}`
        const startTime = Date.now()

        // 创建执行记录
        const execution = await this.prisma.workflowExecution.create({
            data: {
                executionId,
                appId,
                status: 'RUNNING',
                inputs: body.inputs as object,
            },
        })

        try {
            // TODO: 这里需要接入 ai-engine 包执行工作流
            // 目前返回模拟结果
            this.logger.log(`start workflow execution: ${executionId} `)
            // 模拟工作流执行
            const result = await this.executeWorkflowNodes(workflow.nodes as unknown[], body.inputs)

            const duration = Date.now() - startTime

            // 更新执行记录
            await this.prisma.workflowExecution.update({
                where: {
                    id: execution.id,
                },
                data: {
                    duration,
                    outputs: result as object,
                    status: 'SUCCESS',
                    completedAt: new Date(),
                },
            })

            return {
                executionId,
                status: 'SUCCESS',
                outputs: result,
                duration,
                totalTokens: 0,
            }
        } catch (error) {
            const duration = Date.now() - startTime
            const errorMessage = error instanceof Error ? error.message : '执行失败'

            await this.prisma.workflowExecution.update({
                where: {
                    id: execution.id,
                },
                data: {
                    status: 'ERROR',
                    error: errorMessage,
                    duration,
                    completedAt: new Date(),
                },
            })

            return {
                executionId,
                status: 'ERROR',
                error: errorMessage,
                duration,
            }
        }
    }
    /**
     * 执行工作流节点（临时实现，后续接入 ai-engine）
     */
    private async executeWorkflowNodes(nodes: unknown[], inputs: Record<string, unknown>): Promise<Record<string, unknown>> {
        // TODO: 接入 @miaoma-aiflow/ai-engine 执行实际工作流
        // 目前返回简单的回显结果
        return {
            result: `Workflow executed with inputs: ${JSON.stringify(inputs)}`,
            timestamp: new Date().toISOString(),
            nodeCount: Array.isArray(nodes) ? nodes.length : 0,
        }
    }
}
