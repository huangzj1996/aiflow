// 统计概览数据
export interface StatsOverview {
    totalCalls: number // 总调用次数
    totalTokens: number // 总token数
    uniqueApiKeys: number // 不同 API key 数
    avgDuration: number // 平均响应时间
    successRate: number // 成功率0-100
}

// 每日统计数据（用于图表）
export interface DailyStat {
    date: string // 日期
    calls: number // 调用次数
    tokens: number // token数
    errors: number // 错误次数
    successCalls: number // 成功调用次数
}

// API Key 使用统计
export interface ApiKeyUsage {
    id: string // API Key ID
    name: string // API Key 名称
    calls: number // 调用次数
    tokens: number // token数
    lastUsedAt: string | null // 最后使用时间
}
// 完整的统计响应
export interface StatsResponse {
    overview: StatsOverview
    dailyStats: DailyStat[]
    topApiKeys: ApiKeyUsage[]
    period: string // 统计周期
}
// 查询参数
export interface StatsQuery {
    period?: '7d' | '30d' | '90d' // 统计周期，默认 7d
}
