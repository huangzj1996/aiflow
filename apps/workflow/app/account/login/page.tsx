'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { TaiJi } from './TaiJi'
import { World } from './World'
interface LoginFormValues {
    username: string
    password: string
}

export default function LoginPage() {
    const form = useForm<LoginFormValues>({
        defaultValues: {
            username: '',
            password: '',
        },
    })

    const [inputType, setInputType] = useState<'login' | 'register'>('login')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const handleSubmit = async (values: LoginFormValues) => {
        setIsLoading(true)

        try {
            // 模拟 API 调用 - 暂时不做前后端联调
            await new Promise(resolve => setTimeout(resolve, 1000))

            if (inputType === 'login') {
                // 模拟登录成功
                toast.success('登录成功')

                // 模拟存储 token
                localStorage.setItem('token', 'mock_token_' + Date.now())

                const redirectUrl = searchParams.get('redirect') || '/apps'
                router.push(redirectUrl)
            }

            if (inputType === 'register') {
                toast.success('注册成功，请前往登录')
                setInputType('login')
                form.reset()
            }
        } catch {
            toast.error(inputType === 'login' ? '登录失败，请稍后重试' : '注册失败，请稍后重试')
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="container relative h-screen w-full flex-row items-center justify-end grid max-w-none grid-cols-2 min-w-[1300px]!">
            <div className="relative h-full flex-col bg-muted p-10 text-white dark:border-r flex">
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-4xl mb-8">&ldquo;落霞与孤鹜齐飞，秋水共长天一色&rdquo;</p>
                    </blockquote>
                </div>
            </div>
            <TaiJi />
            <World yi="yin" />
            <World yi="yang" />
            <div className="lg:p-8">
                <div className="flex items-center justify-center">
                    <div className="mx-auto grid w-[350px] gap-6">
                        <div className="grid gap-2 text-center">
                            <h1 className="text-3xl font-bold mb-8">AI 应用引擎</h1>
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    rules={{ required: '请输入用户名' }}
                                    name="username"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel>用户名</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="请输入用户名" disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{ required: '请输入密码' }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>密码</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="请输入密码" disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full bg-zinc-950 hover:bg-zinc-700" disabled={isLoading}>
                                    {isLoading ? '处理中...' : inputType === 'login' ? '登录' : '注册'}
                                </Button>
                            </form>
                        </Form>
                        {inputType === 'login' ? (
                            <div className="text-center text-sm">
                                没有账号?{' '}
                                <Button
                                    variant="link"
                                    className="px-1 text-zinc-950 hover:text-zinc-700"
                                    onClick={() => {
                                        form.clearErrors()
                                        form.reset()
                                        setInputType('register')
                                    }}
                                >
                                    注册
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-sm">
                                已有账号?{' '}
                                <Button
                                    variant="link"
                                    className="px-1 text-zinc-950"
                                    onClick={() => {
                                        form.clearErrors()
                                        form.reset()
                                        setInputType('login')
                                    }}
                                >
                                    登录
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
