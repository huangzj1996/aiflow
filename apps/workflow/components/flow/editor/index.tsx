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
    ReactFlow,
    ReactFlowProvider,
} from '@xyflow/react'
import { useCallback, useMemo, useState } from 'react'

import { nodeTypes } from '../nodes'
import Settings from '../settings'
import { FlowEditorHeader } from './header'

type NodeKind = 'start' | 'llm' | 'tool' | 'condition' | 'end' | 'http'

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
const initialNodes: Node[] = [
    {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 200 },
        data: {
            label: '开始',
            config: {
                inputs: [
                    {
                        name: 'count',
                        type: 'number',
                        defaultValue: '10',
                        required: true,
                        description: '循环次数',
                    },
                    {
                        name: 'userName',
                        type: 'string',
                        defaultValue: 'Guest',
                        required: false,
                        description: '用户名称',
                    },
                ],
            },
        },
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
        id: 'http-1',
        type: 'http',
        position: { x: 900, y: 300 },
        data: {
            label: 'HTTP 请求',
            config: {
                url: 'https://api.example.com/data',
                method: 'POST',
                headers: [],
                params: [],
                bodyType: 'json',
                body: '',
                formData: [],
                timeout: 30000,
            },
        },
    },
    {
        id: 'condition-1',
        type: 'condition',
        position: { x: 1000, y: 200 },
        data: {
            label: '条件',
            config: {
                model: 'qwen3-0.6b',
                intents: [
                    {
                        name: '查询订单',
                        condition: '查询内容包含了订单相关信息',
                    },
                    {
                        name: '计算结果',
                        condition: '计算结果大于等于0',
                    },
                ],
            },
        },
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
    {
        id: 'e1',
        source: 'start-1',
        target: 'llm-1',
    },
    {
        id: 'e2',
        source: 'llm-1',
        target: 'http-1',
    },
    {
        id: 'e3',
        source: 'http-1',
        target: 'condition-1',
    },
    {
        id: 'e4',
        source: 'intent-1',
        target: 'output-1',
    },
    {
        id: 'e5',
        source: 'intent-2',
        target: 'output-2',
    },
    {
        source: 'condition-1',
        sourceHandle: 'intent-0',
        target: 'output-1',
        id: 'xy-edge__condition-1intent-0-output-1',
    },
    {
        source: 'condition-1',
        sourceHandle: 'intent-1',
        target: 'output-2',
        id: 'xy-edge__condition-1intent-1-output-1',
    },
]
const EditorInner = () => {
    const [nodes, setNodes] = useState<Node[]>(initialNodes)
    const [edges, setEdges] = useState<Edge[]>(initialEdges)

    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const onConnect = useCallback((connection: any) => setEdges(eds => addEdge(connection, eds)), [])

    const onNodesChange = useCallback((changes: NodeChange<Node>[]) => setNodes(nodes => applyNodeChanges(changes, nodes)), [])

    const fitViewOptions = useMemo(() => ({ padding: 20, includeHiddenNodes: true }), [])

    const onUpdateNode = useCallback((nodeId: string, newData: any) => {
        setNodes(nodes =>
            nodes.map(node => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: newData,
                    }
                }
                return node
            })
        )
    }, [])

    return (
        <div className="h-full relative flex flex-col">
            <FlowEditorHeader />
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onConnect={onConnect}
                    onNodesChange={onNodesChange}
                    onNodeClick={(_, node) => setSelectedNode(node)}
                    onSelectionChange={({ nodes }) => setSelectedNode(nodes[0] || null)}
                    fitView
                    fitViewOptions={fitViewOptions}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background bgColor="#f4f6fb" />
                    <MiniMap pannable zoomable style={{ right: selectedNode ? 410 : 0, width: 120, height: 80 }} />
                    <Controls />
                </ReactFlow>
            </div>
            {selectedNode && (
                <div className=" absolute top-12 right-4">
                    <Settings node={selectedNode} onUpdateNode={onUpdateNode} nodes={nodes} edges={edges} />
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
