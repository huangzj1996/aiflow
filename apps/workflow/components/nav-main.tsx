'use client'

import { Icon } from '@tabler/icons-react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'

const NavMain = ({ items }: { items: { title: string; url: string; icon?: Icon }[] }) => {
    const pathname = usePathname()
    const isActive = (url: string) => pathname.includes(url)

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map(item => (
                        <SidebarMenuItem key={item.title}>
                            <Link href={`/app/1/${item.url}`}>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    className={clsx(
                                        isActive(item.url)
                                            ? 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear font-bold'
                                            : ''
                                    )}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export default NavMain
