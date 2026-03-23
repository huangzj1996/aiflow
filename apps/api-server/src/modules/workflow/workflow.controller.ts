import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { ApiKeyGuard } from '../../common/api-key.guard.js'
import { RunWorkflowDto, WorkflowExecutionResultDto } from './dto/run-workflow.dto.js'
import { WorkflowService } from './workflow.service.js'

@Controller('v1/apps')
@UseGuards(ApiKeyGuard)
export class WorkflowController {
    constructor(private readonly workflowService: WorkflowService) {}

    /**
     * 运行工作流
     * POST /api/v1/apps/run
     *
     * 通过 API Key 鉴权后，自动获取对应的应用信息并执行工作流
     */
    @Post('/run')
    async runWorkflow(@Body() body: RunWorkflowDto, @Req() request: Request): Promise<WorkflowExecutionResultDto> {
        const { id: appId, publishedWorkflowId } = request.appContext!
        return this.workflowService.runWorkflow(appId, publishedWorkflowId, body)
    }
}
