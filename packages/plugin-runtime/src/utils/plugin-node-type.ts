/**
 * 解析插件节点类型字符串
 *
 * 类型格式: plugin:{pluginId}:{nodeType}
 * 解析结果：
 * ```js
 * parsePluginNodeType('plugin:@official/current-time:get-time')
 * // → { pluginId: '@official/current-time', nodeType: 'get-time' }
 * ```
 */

/**
 * 为什么用 plugin: 前缀？
 * 1. 区分内置节点（如 llm, http, condition）和插件节点
 * 2. 内置节点类型直接是节点名，插件节点用前缀+插件ID+节点类型
 */
export const PLUGIN_NODE_PREFIX = 'plugin:'

export interface ParsedPluginNodeType {
    pluginId: string
    nodeType: string
}

export function buildPluginNodeType(pluginId: string, nodeType: string) {
    return `${PLUGIN_NODE_PREFIX}${pluginId}:${nodeType}`
}

export function isPluginNodeType(type: string): type is `plugin:${string}:${string}` {
    return type.startsWith(PLUGIN_NODE_PREFIX)
}

export function parsePluginNodeType(type: string): ParsedPluginNodeType | null {
    if (!isPluginNodeType(type)) {
        return null
    }

    const rawType = type.slice(PLUGIN_NODE_PREFIX.length)
    const separatorIndex = rawType.lastIndexOf(':')

    if (separatorIndex <= 0 || separatorIndex >= rawType.length - 1) {
        return null
    }

    return {
        pluginId: rawType.slice(0, separatorIndex),
        nodeType: rawType.slice(separatorIndex + 1),
    }
}
