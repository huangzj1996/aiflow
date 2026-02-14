import { NodeProps, Position } from '@xyflow/react'
import clsx from 'clsx'
import { useState } from 'react'

import { Handle } from '../handle'
import { ICON_MAP } from '../icon-map'

const ToolNode = ({ data, selected }: NodeProps) => {
    const [toolName, setToolName] = useState<string>((data?.config as any)?.toolName ?? 'search')
    const [args, setArgs] = useState<string>(JSON.stringify((data?.config as any)?.args ?? {}, null, 2))
    return (
        <div
            className={clsx('rounded-xl border bg-white shadow-md px-3 py-2 w-64', {
                'border-blue-700': selected,
                'border-transparent': !selected,
            })}
        >
            <div className="flex items-center mb-3">
                <div className="mr-3 bg-blue-700 text-white rounded-lg p-2 shadow-sm">
                    <ICON_MAP.tool size={14} />
                </div>
                <span className="font-bold">工具</span>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">工具名</span>
                    <span className="flex-1 rounded-md py-1 text-sm bg-[#f2f4f7] px-2">{toolName}</span>
                </div>
            </div>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    )
}

export default ToolNode
