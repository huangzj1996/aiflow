import ConditionNode from './condition-node'
import EndNode from './end-node'
import LLMNode from './llm-node'
import StartNode from './start-node'
import ToolNode from './tool-node'

export const nodeTypes = {
    start: StartNode,
    llm: LLMNode,
    tool: ToolNode,
    condition: ConditionNode,
    end: EndNode,
}

export { StartNode }
export { LLMNode }
export { ToolNode }
export { ConditionNode }
export { EndNode }
