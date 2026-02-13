import { NextRequest } from 'next/server'
/** Types are generated during next dev, next build or next typegen. */
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/blog/[id]'>) {
    const { id } = await ctx.params
    return Response.json({ id })
}
