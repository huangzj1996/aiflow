export { NodeRegistry, createNodeRegistry } from './registry'
export { BaseNodeExecutor } from './base-executor'
export { StartExecutor } from './executors/start-executor'

import { StartExecutor } from './executors/start-executor'
import { NodeRegistry } from './registry'

/**
 * 创建默认注册中心（包含所有内置节点）
 */
export function createDefaultRegistry(): NodeRegistry {
    const registry = new NodeRegistry()
    registry.register('start', new StartExecutor())
    return registry
}
