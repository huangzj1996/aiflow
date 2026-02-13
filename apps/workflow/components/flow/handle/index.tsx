import { Handle as XYFlowHandle, Position } from '@xyflow/react'
import clsx from 'clsx'

interface HandleProps {
    type: 'source' | 'target'
    position: Position
    id?: string
    className?: string
    handleClassName?: string
}

export const Handle = ({ ...props }: HandleProps) => {
    const { type, position, id, handleClassName, className } = props
    return (
        <XYFlowHandle
            id={id}
            type={type}
            position={position}
            className={clsx('flex', position === Position.Right ? 'justify-end' : 'justify-start', handleClassName)}
            style={{
                backgroundColor: 'transparent',
            }}
        >
            <div className={clsx('w-[2px] h-2 bg-purple-700', className)}></div>
        </XYFlowHandle>
    )
}
