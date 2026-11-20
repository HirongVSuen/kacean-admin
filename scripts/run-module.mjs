/* eslint-env node */
import { spawnSync } from 'node:child_process'

/**
 * 模块命令统一入口：pnpm dev:module <模块名> / pnpm build:module <模块名>
 * 转发为 pnpm --filter <模块名> dev|build，其余参数原样透传。
 */
const [script, name, ...rest] = process.argv.slice(2)

if (!name) {
  console.error(`用法：pnpm ${script}:module <模块名>`)
  process.exit(1)
}

const result = spawnSync('pnpm', ['--filter', name, script, ...rest], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

process.exit(result.status ?? 1)
