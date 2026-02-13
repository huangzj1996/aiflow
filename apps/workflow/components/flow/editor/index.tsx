'use client'
import '@xyflow/react/dist/base.css'

import {
    addEdge,
    applyNodeChanges,
    Background,
    Controls,
    Edge,
    MiniMap,
    Node,
    NodeChange,
    NodeTypes,
    ReactFlow,
    ReactFlowProvider,
} from '@xyflow/react'
import { useCallback, useMemo, useState } from 'react'

import Settings from '../settings/indx'

type NodeKind = 'start' | 'llm' | 'tool' | 'condition' | 'end'

export type FlowNodeData = {
    label?: string
    config?: Record<string, unknown>
}

export type FlowNode = {
    id: string
    type: NodeKind
    position: { x: number; y: number }
    data?: FlowNodeData
}

export type FlowEdge = {
    id: string
    source: string
    target: string
    sourceHandle?: string
}

export type LangGraphNode = {
    id: string
    kind?: NodeKind
    params?: Record<string, unknown>
}

export type LangGraphEdge = {
    source: string
    target: string
    condition?: string
}

export type LangGraphSpec = {
    nodes: LangGraphNode[]
    edges: LangGraphEdge[]
}

const nodeTypes: NodeTypes[] = []
const initialNodes: Node[] = [
    {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: '开始' },
    },
    {
        id: 'llm-1',
        type: 'llm',
        position: { x: 400, y: 200 },
        data: { label: '大模型', config: { model: 'qwen3-0.6b', prompt: '' } },
    },
    {
        id: 'tool-1',
        type: 'tool',
        position: { x: 700, y: 200 },
        data: { label: '工具', config: { toolName: 'sum', args: {} } },
    },
    {
        id: 'condition-1',
        type: 'condition',
        position: { x: 1000, y: 200 },
        data: { label: '条件', config: { condition: '${llm-1.output}' } },
    },
    {
        id: 'output-1',
        type: 'end',
        position: { x: 1400, y: 200 },
        data: { label: '结束输出' },
    },
    {
        id: 'output-2',
        type: 'end',
        position: { x: 1400, y: 500 },
        data: { label: '结束输出' },
    },
]

const initialEdges: Edge[] = [
    { id: 'e1', source: 'start-1', target: 'llm-1' },
    { id: 'e2', source: 'llm-1', target: 'tool-1' },
    { id: 'e3', source: 'tool-1', target: 'condition-1' },
    {
        id: 'e4',
        source: 'condition-1',
        sourceHandle: 'true',
        target: 'output-1',
    },
    {
        id: 'e5',
        source: 'condition-1',
        sourceHandle: 'false',
        target: 'output-2',
    },
]
const EditorInner = () => {
    const [nodes, setNodes] = useState<Node[]>(initialNodes)
    const [edges, setEdges] = useState<Edge[]>(initialEdges)

    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const onConnect = useCallback((connection: any) => setEdges(eds => addEdge(connection, eds)), [])

    const onNodesChange = useCallback((changes: NodeChange<Node>[]) => setNodes(nodes => applyNodeChanges(changes, nodes)), [])

    const fitViewOptions = useMemo(() => ({ padding: 20, includeHiddenNodes: true }), [])

    return (
        <div className="h-full relative flex flex-col">
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={{}}
                    onConnect={onConnect}
                    onNodesChange={onNodesChange}
                    onNodeClick={(_, node) => setSelectedNode(node)}
                    onSelectionChange={({ nodes }) => setSelectedNode(nodes[0] || null)}
                    fitView
                    fitViewOptions={fitViewOptions}
                >
                    <Background bgColor="#537ce4" />
                    <MiniMap pannable zoomable />
                    <Controls />
                </ReactFlow>
            </div>
            {selectedNode && (
                <div className=" absolute top-4 right-6">
                    <Settings node={selectedNode} />
                </div>
            )}
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
