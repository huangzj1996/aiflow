import { NodeProps, Position } from '@xyflow/react'
import clsx from 'clsx'

import { Handle } from '../handle'
import { ICON_MAP } from '../icon-map'

interface OutputParam {
    name: string
    type: string
    value: string
    description?: string
}

interface EndNodeConfig {
    outputs?: OutputParam[]
}

const EndNode = ({ data, selected }: NodeProps) => {
    const config = (data?.config as EndNodeConfig) || {}
    const outputs = config.outputs || []

    return (
        <div
            className={clsx('rounded-xl border bg-white shadow-md px-3 py-2 w-52', {
                'border-orange-500': selected,
                'border-transparent': !selected,
            })}
        >
            <div className="flex items-center">
                <div className="mr-3 bg-orange-500 text-white rounded-lg p-2 shadow-sm">
                    <ICON_MAP.end size={14} />
                </div>
                <span className="font-bold">结束</span>
            </div>
            <Handle type="target" position={Position.Left} />

            {outputs.length > 0 && (
                <div className="mt-2 pt-2 border-t space-y-1">
                    {outputs.map((output, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs">
                            <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{output.name}</span>
                            <span className="text-gray-400">:</span>
                            <span className="text-orange-600 truncate max-w-[100px] font-mono" title={output.value}>
                                {output.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default EndNode
