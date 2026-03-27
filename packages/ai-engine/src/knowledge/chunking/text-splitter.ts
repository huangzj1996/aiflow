import type { ChunkingConfig, TextChunk, TextSplitterService } from '../types'
import { DEFAULT_CHUNKING_CONFIG } from '../types'

/**
 * 通用文本切分器
 * 按字符数切分，优先在段落、句子边界处切分
 */
export class TextSplitter implements TextSplitterService {
    private config: ChunkingConfig

    constructor(config?: Partial<ChunkingConfig>) {
        this.config = {
            ...DEFAULT_CHUNKING_CONFIG,
            ...config,
        }
    }

    /**
     * 将文本切分为多个块
     */
    split(text: string, config?: Partial<ChunkingConfig>): TextChunk[] {
        // 1. 解构配置
        const { chunkSize, chunkOverlap } = { ...this.config, ...config }

        // 2. 判断文本是否为空
        if (!text || text.trim().length === 0) {
            return []
        }

        // 3. 验证配置
        if (chunkSize <= 0) {
            throw new Error('chunkSize must be greater than 0')
        }

        if (chunkOverlap < 0 || chunkOverlap >= chunkSize) {
            throw new Error('chunkOverlap must be less than chunkSize')
        }
        // 4. 初始化变量
        const chunks: TextChunk[] = []
        const separators = ['\n\n', '\n', '。', '！', '？', '.', '!', '?', '；', ';', ' ']

        let startOffset = 0
        let index = 0

        // 主循环
        while (startOffset < text.length) {
            // 确定初始结束位置
            let endOffset = Math.min(startOffset + chunkSize, text.length)

            // 智能分隔符切分
            if (endOffset < text.length) {
                // 搜索范围 ：从块中间位置到初始结束位置
                const searchStart = Math.max(startOffset + Math.floor(chunkSize * 0.5), startOffset)
                let bestSplit = endOffset

                //隔符优先级 ：按 separators 数组顺序，找到第一个符合条件的分隔符
                for (const sep of separators) {
                    const lastIndex = text.lastIndexOf(sep, endOffset - 1)
                    if (lastIndex > searchStart && lastIndex < bestSplit) {
                        bestSplit = lastIndex + sep.length
                        break
                    }
                }

                endOffset = bestSplit
            }

            const content = text.slice(startOffset, endOffset).trim()

            if (content.length > 0) {
                chunks.push({
                    content,
                    index,
                    startOffset,
                    endOffset,
                })
                index++
            }

            if (endOffset >= text.length) {
                break
            }

            startOffset = endOffset - chunkOverlap
            // 确保不会无限循环
            if (startOffset <= chunks[chunks.length - 1].startOffset) {
                startOffset = endOffset
            }
        }
        return chunks
    }
}

export function createTextSplitter(config?: Partial<ChunkingConfig>): TextSplitterService {
    return new TextSplitter(config)
}
