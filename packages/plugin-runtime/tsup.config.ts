import { defineConfig } from 'tsup'

export default defineConfig([
    {
        entry: ['src/index.ts'],
        outDir: 'build/esm',
        format: ['esm'],
        dts: true,
        bundle: true,
        clean: true,
        sourcemap: true,
        minify: true,
        external: ['@aiflow/ai-engine', '@aiflow/plugin-core'],
    },
    {
        entry: ['src/index.ts'],
        outDir: 'build/cjs',
        format: ['cjs'],
        dts: true,
        bundle: true,
        clean: true,
        sourcemap: true,
        minify: true,
        external: ['@aiflow/ai-engine', '@aiflow/plugin-core'],
    },
])
