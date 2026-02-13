'use client'
import '@xyflow/react/dist/base.css'

import { Background, Controls, MiniMap, ReactFlow, ReactFlowProvider } from '@xyflow/react'

const EditorInner = () => {

    return (
        <div className="h-full relative flex flex-col">
            <div className="flex-1">
                <ReactFlow>
                    <Background bgColor="#537ce4" />
                    <MiniMap pannable zoomable />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    )
}

const FlowEditor = () => {
    return (
        <ReactFlowProvider>
            <EditorInner />
        </ReactFlowProvider>
    )
}

export default FlowEditor
