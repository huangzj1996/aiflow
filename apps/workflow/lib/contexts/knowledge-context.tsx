'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

import { KnowledgeBaseDetail } from '../services/knowledge-service'

interface KnowledgeContextType {
    knowledgeBase: KnowledgeBaseDetail | null
    setKnowledgeBase: (kb: KnowledgeBaseDetail | null) => void
    refreshKnowledgeBase: () => void
    isRefreshing: boolean
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined)

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseDetail | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshCount, setRefreshCount] = useState(0)

    const refreshKnowledgeBase = useCallback(() => {
        setIsRefreshing(true)
        setRefreshCount(a => a + 1)

        setTimeout(() => {
            setIsRefreshing(false)
        }, 100)
    }, [])

    return (
        <KnowledgeContext.Provider
            value={{
                knowledgeBase,
                setKnowledgeBase,
                refreshKnowledgeBase,
                isRefreshing,
            }}
        >
            {children}
        </KnowledgeContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useKnowledge() {
    const context = useContext(KnowledgeContext)

    if (context === undefined) {
        throw new Error('useKnowledge must be used within a KnowledgeProvider')
    }

    return context
}
