export { NodeRegistry, createNodeRegistry } from './registry'
export { BaseNodeExecutor } from './base-executor'
export { StartExecutor } from './executors/start-executor'
export { EndExecutor } from './executors/end-executor'
export { HttpExecutor } from './executors/http-executor'
export { LLMExecutor } from './executors/llm-executor'
export { ConditionExecutor } from './executors/condition-executor'

import { ConditionExecutor } from './executors/condition-executor'
import { EndExecutor } from './executors/end-executor'
import { HttpExecutor } from './executors/http-executor'
import { LLMExecutor } from './executors/llm-executor'
import { StartExecutor } from './executors/start-executor'
import { NodeRegistry } from './registry'

/**
 * 创建默认注册中心（包含所有内置节点）
 */
export function createDefaultRegistry(): NodeRegistry {
    const registry = new NodeRegistry()
    registry.register('start', new StartExecutor())
    registry.register('end', new EndExecutor())
    registry.register('http', new HttpExecutor())
    registry.register('llm', new LLMExecutor())
    registry.register('condition', new ConditionExecutor())
    return registry
}
