import { StatsQuery, StatsResponse } from '../types/stats'

async function getStats(appId: string, query?: StatsQuery): Promise<StatsResponse> {
    const params = new URLSearchParams()
    if (query?.period) {
        params.set('period', query.period)
    }

    const url = `/api/apps/${appId}/stats${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    const result = await response.json()

    if (!response.ok || !result.success) {
        throw new Error(result.message || '获取统计数据失败')
    }

    return result.data
}

export const statsService = {
    getStats,
}
