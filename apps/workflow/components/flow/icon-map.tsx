import { BookOpen, Brain, GitBranch, Globe, HomeIcon, PaintRoller, Terminal } from 'lucide-react'

export const ICON_MAP = {
    start: HomeIcon,
    llm: Brain,
    tool: PaintRoller,
    end: Terminal,
    condition: GitBranch,
    http: Globe,
    knowledge: BookOpen,
}

export function getIcon(type: string) {
    switch (type) {
        case 'start':
            return <HomeIcon size={14} />
        case 'llm':
            return <Brain size={14} />
        case 'tool':
            return <PaintRoller size={14} />
        case 'end':
            return <Terminal size={14} />
        case 'condition':
            return <GitBranch size={14} />
        case 'http':
            return <Globe size={14} />
        case 'knowledge':
            return <BookOpen size={14} />
    }
}

export const getColor = (type: string) => {
    switch (type) {
        case 'start':
            return 'bg-blue-700'
        case 'llm':
            return 'bg-purple-700'
        case 'tool':
            return 'bg-blue-700'
        case 'end':
            return 'bg-orange-700'
        case 'condition':
            return 'bg-purple-700'
        case 'http':
            return 'bg-green-700'
        case 'knowledge':
            return 'bg-cyan-700'
    }
}
