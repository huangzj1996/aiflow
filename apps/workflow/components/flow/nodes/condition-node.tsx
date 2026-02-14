import { NodeProps, Position } from '@xyflow/react'
import { clsx } from 'clsx'

import { Handle } from '../handle'
import { ICON_MAP } from '../icon-map'

interface Intent {
    name: string
    description?: string
}

interface IntentNodeConfig {
    model?: string
    intents?: Intent[]
}

const ConditionNode = ({ data, selected }: NodeProps) => {
    const config = (data?.config as IntentNodeConfig) || {}
    const intents = config?.intents || []

    const getHandleOffset = (index: number) => {
        return index * 45
    }

    return (
        <div
            className={clsx('rounded-xl border bg-white shadow-md p-3 w-64', {
                'border-purple-700': selected,
                'border-transparent': !selected,
            })}
        >
            <div className="flex items-center mb-2">
                <div className="mr-3 bg-purple-700 text-white rounded-lg p-2 shadow-sm">
                    <ICON_MAP.condition size={14} />
                </div>
                <span className="font-bold">意图识别</span>
            </div>

            <Handle type="target" position={Position.Left} />
            {intents.length > 0 ? (
                <div className="space-y-2 mt-2">
                    {intents.map((intent, index) => (
                        <div key={index} className="flex justify-end items-center">
                            <span className="font-bold text-zinc-500 text-sm truncate max-w-[180px]" title={intent.name}>
                                {intent.name}
                            </span>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`intent-${index}`}
                                handleClassName={index > 0 ? `translate-y-[${getHandleOffset(index)}px]` : ''}
                                style={{ top: `${50 + index * 32}px` }}
                            />
                        </div>
                    ))}
                    {/* 默认分支 - 无法识别时 */}
                    <div className="flex justify-end items-center border-t pt-2 mt-2">
                        <span className="font-bold text-zinc-400 text-sm">其他</span>
                        <Handle type="source" position={Position.Right} id="default" style={{ top: `${50 + intents.length * 32}px` }} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-2 text-gray-400 text-xs">请配置意图列表</div>
            )}
        </div>
    )
}

export default ConditionNode
