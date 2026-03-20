'use client'

import { useParams } from 'next/navigation'

import { ApiDocumentation, ApiKeyList } from '@/components/api'
import { useApp } from '@/lib/contexts/app-context'

const ApiPage = () => {
    const { id: appId } = useParams<{ id: string }>()
    const { app } = useApp()
    return (
        <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6 max-w-5xl mx-auto pb-12">
                {/* 页面标题 */}
                <div>
                    <h1 className="text-2xl font-bold">API 访问</h1>
                    <p className="text-muted-foreground">管理 API Key 并了解如何通过 API 调用此应用</p>
                </div>

                {/* API Key 管理 */}
                <ApiKeyList appId={appId} />

                {/* 接入文档 */}
                <ApiDocumentation appId={appId} appName={app?.name || '应用'} />
            </div>
        </div>
    )
}

export default ApiPage
