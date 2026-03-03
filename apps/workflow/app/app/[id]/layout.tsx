import AppSidebar from '@/components/app-sidebar'
import { GlobalHeader } from '@/components/global-header'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { WorkflowSidebar } from '@/components/workflow-sidebar'

export default function AppLayoutInner({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col">
            {/* 全局顶部导航 */}
            <GlobalHeader />
            {/* 主内容区 */}
            <div className="flex-1 flex overflow-hidden">
                <WorkflowSidebar />

                {/* 内容区 */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[#f4f6fb]">{children}</main>
            </div>
        </div>
    )
}
