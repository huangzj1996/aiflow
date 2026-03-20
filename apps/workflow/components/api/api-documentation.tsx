'use client'

import { BookOpenIcon, CheckCircleIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface ApiDocumentationProps {
    appId: string
    appName: string
}

export function ApiDocumentation({ appId, appName }: ApiDocumentationProps) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null)

    // API 基础信息 - api-server 运行在 3100 端口
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:3100'
    const workflowEndpoint = `${apiBaseUrl}/api/v1/apps/run`

    // 复制代码
    const handleCopy = async (code: string, section: string) => {
        try {
            await navigator.clipboard.writeText(code)
            setCopiedSection(section)
            toast.success('已复制到剪贴板')
            setTimeout(() => setCopiedSection(null), 2000)
        } catch {
            toast.error('复制失败')
        }
    }
    // cURL 示例
    const curlExample = `curl -X POST "${workflowEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "inputs": {
      "message": "你好，请介绍一下你自己"
    }
  }'`

    // JavaScript/TypeScript 示例
    const jsExample = `const response = await fetch("${workflowEndpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    inputs: {
      message: "你好，请介绍一下你自己"
    }
  })
});

const result = await response.json();
console.log(result.data);`

    // Python 示例
    const pythonExample = `import requests

url = "${workflowEndpoint}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
payload = {
    "inputs": {
        "message": "你好，请介绍一下你自己"
    }
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()
print(result["data"])`

    // 响应示例
    const responseExample = `{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "status": "SUCCESS",
    "outputs": {
      "result": "你好！我是一个 AI 助手，很高兴为你服务..."
    },
    "duration": 1234,
    "totalTokens": 256
  }
}`

    // 错误响应示例
    const errorResponseExample = `{
  "code": "API_KEY_INVALID",
  "message": "无效的 API Key"
}`

    // 流式响应示例
    const streamExample = `// 流式调用（SSE）
const eventSource = new EventSource(
  "${workflowEndpoint}?stream=true",
  {
    headers: {
      "Authorization": "Bearer YOUR_API_KEY"
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

eventSource.onerror = (error) => {
  console.error("Stream error:", error);
  eventSource.close();
};`

    // 代码块组件
    const CodeBlock = ({ code, language, section }: { code: string; language: string; section: string }) => (
        <div className="relative group">
            <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{code}</code>
            </pre>
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(code, section)}
            >
                {copiedSection === section ? <CheckCircleIcon className="size-4 text-green-500" /> : <CopyIcon className="size-4" />}
            </Button>
        </div>
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpenIcon className="size-5" />
                    接入文档
                </CardTitle>
                <CardDescription>了解如何通过 API 调用「{appName}」应用</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* API 端点 */}
                <section>
                    <h3 className="text-lg font-semibold mb-3">API 端点</h3>
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge>POST</Badge>
                            <code className="text-sm font-mono">{workflowEndpoint}</code>
                        </div>
                        <p className="text-sm text-muted-foreground">运行工作流并获取结果</p>
                    </div>
                </section>

                {/* 认证 */}
                <section>
                    <h3 className="text-lg font-semibold mb-3">认证方式</h3>
                    <p className="text-sm text-muted-foreground mb-3">所有 API 请求都需要在 Header 中携带 API Key 进行认证：</p>
                    <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} language="text" section="auth" />
                </section>

                {/* 请求参数 */}
                <section>
                    <h3 className="text-lg font-semibold mb-3">请求参数</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-3 font-medium">参数</th>
                                    <th className="text-left p-3 font-medium">类型</th>
                                    <th className="text-left p-3 font-medium">必填</th>
                                    <th className="text-left p-3 font-medium">说明</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="p-3 font-mono text-xs">inputs</td>
                                    <td className="p-3">object</td>
                                    <td className="p-3">是</td>
                                    <td className="p-3">工作流输入参数，对应开始节点定义的变量</td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-3 font-mono text-xs">stream</td>
                                    <td className="p-3">boolean</td>
                                    <td className="p-3">否</td>
                                    <td className="p-3">是否使用流式响应，默认 false</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 代码示例 */}
                <section>
                    <h3 className="text-lg font-semibold mb-3">代码示例</h3>
                    <Tabs defaultValue="curl">
                        <TabsList>
                            <TabsTrigger value="curl">cURL</TabsTrigger>
                            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                            <TabsTrigger value="python">Python</TabsTrigger>
                            <TabsTrigger value="stream">流式调用</TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl" className="mt-3">
                            <CodeBlock code={curlExample} language="bash" section="curl" />
                        </TabsContent>
                        <TabsContent value="javascript" className="mt-3">
                            <CodeBlock code={jsExample} language="javascript" section="js" />
                        </TabsContent>
                        <TabsContent value="python" className="mt-3">
                            <CodeBlock code={pythonExample} language="python" section="python" />
                        </TabsContent>
                        <TabsContent value="stream" className="mt-3">
                            <CodeBlock code={streamExample} language="javascript" section="stream" />
                        </TabsContent>
                    </Tabs>
                </section>

                {/* 错误码 */}
                <section>
                    <h3 className="text-lg font-semibold mb-3">错误码说明</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-3 font-medium">错误码</th>
                                    <th className="text-left p-3 font-medium">HTTP 状态码</th>
                                    <th className="text-left p-3 font-medium">说明</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="p-3 font-mono text-xs">API_KEY_INVALID</td>
                                    <td className="p-3">401</td>
                                    <td className="p-3">无效的 API Key</td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-3 font-mono text-xs">API_KEY_EXPIRED</td>
                                    <td className="p-3">401</td>
                                    <td className="p-3">API Key 已过期</td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-3 font-mono text-xs">API_KEY_DISABLED</td>
                                    <td className="p-3">403</td>
                                    <td className="p-3">API Key 已禁用</td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-3 font-mono text-xs">APP_NOT_FOUND</td>
                                    <td className="p-3">404</td>
                                    <td className="p-3">应用不存在或未发布</td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-3 font-mono text-xs">INVALID_WORKFLOW</td>
                                    <td className="p-3">400</td>
                                    <td className="p-3">工作流配置无效</td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-3 font-mono text-xs">INTERNAL_SERVER_ERROR</td>
                                    <td className="p-3">500</td>
                                    <td className="p-3">服务器内部错误</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 使用限制 */}
                <section>
                    <h3 className="text-lg font-semibold mb-3">使用限制</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>每个 API Key 默认无调用次数限制</li>
                        <li>单次请求超时时间为 60 秒</li>
                        <li>请求体最大 1MB</li>
                        <li>建议为不同环境（开发、测试、生产）创建独立的 API Key</li>
                    </ul>
                </section>
            </CardContent>
        </Card>
    )
}
