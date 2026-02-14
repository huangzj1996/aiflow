import { NodeProps, Position } from '@xyflow/react'
import clsx from 'clsx'
import { XIcon } from 'lucide-react'

import { Handle } from '../handle'
import { ICON_MAP } from '../icon-map'

const StartNode = ({ data, selected }: NodeProps) => {
    return (
        <div
            className={clsx('rounded-xl border bg-white shadow-md p-3 w-44', {
                'border-blue-700': selected,
                'border-transparent': !selected,
            })}
        >
            <div className="flex items-center mb-3">
                <div className="mr-3 bg-blue-700 text-white rounded-lg p-2 shadow-sm">
                    <ICON_MAP.start size={14} />
                </div>
                <span className="font-bold">开始</span>
            </div>
            <div className="flex h-6 items-center justify-between space-x-1 rounded-md  bg-[#f2f4f7] px-2">
                <div className="flex w-0 grow items-center space-x-1">
                    <XIcon size={14} color="#155aef" />
                    <span>count</span>
                </div>
                <div className="ml-1 flex items-center space-x-1">
                    <span className="text-xs">必填</span>
                </div>
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    )
}

export default StartNode
