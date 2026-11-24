/* eslint-env node */
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'

/**
 * dev:module 转发脚本：使用 shell 的 module-dev 单模块模式，复用真实布局、Provider 与 HTTP 配置。
 * 模块统一以 shell 为底座集成，不提供独立构建；其余参数原样透传。
 */
const [script, name, ...rest] = process.argv.slice(2)

if (script !== 'dev' || !name) {
  console.error('用法：pnpm dev:module <模块名>')
  process.exit(1)
}

// 可选模块即 packages/modules 下的模块包；是否进入各模式候选集由 shell 依赖与 kacean.modes 决定。
const moduleNames = readdirSync(new URL('../packages/modules/', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
if (!moduleNames.includes(name)) {
  console.error(`未知模块：${name}。可选：${moduleNames.join(', ')}`)
  process.exit(1)
}

const forwardedArgs = rest[0] === '--' ? rest.slice(1) : rest
const result = spawnSync('pnpm', ['--filter', 'shell', 'dev:module', ...forwardedArgs], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, VITE_DEV_MODULE: name }
})

process.exit(result.status ?? 1)
