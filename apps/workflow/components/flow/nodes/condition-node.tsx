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
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">模型</span>
                    <span className="flex-1 rounded-md py-1 text-sm bg-[#f2f4f7] px-2">{config.model}</span>
                </div>
            </div>
            <Handle type="target" position={Position.Left} />
            {intents.length > 0 ? (
                <div className="space-y-2 mt-2">
                    {intents.map((intent, index) => (
                        <div key={index} className="bg-[#f2f4f7] rounded-md px-2 py-1">
                            <p className="font-bold text-xs text-gray-600 mb-1">意图{index + 1}</p>
                            <p className="font-bold text-zinc-500 text-sm truncate max-w-[180px]" title={intent.name}>
                                {intent.name}
                            </p>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`intent-${index}`}
                                handleClassName={index > 0 ? `translate-y-[${getHandleOffset(index)}px]` : ''}
                                style={{ top: `${110 + index * 56}px` }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-2 text-gray-400 text-xs">请配置意图列表</div>
            )}
        </div>
    )
}

export default ConditionNode
