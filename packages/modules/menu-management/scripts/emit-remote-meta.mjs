import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** 生成后期 HttpLoader 使用的远程模块元数据；当前静态模式不消费。 */
const root = fileURLToPath(new URL('..', import.meta.url))
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

const entry = `${pkg.name}.umd.js`
const code = readFileSync(path.join(root, 'dist', entry))
const integrity = `sha384-${createHash('sha384').update(code).digest('base64')}`
const globalName = pkg.name.replace(/(^|-)(\w)/g, (_match, _sep, char) => char.toUpperCase())

const meta = { id: pkg.name, version: pkg.version, entry, integrity, global: globalName }
writeFileSync(path.join(root, 'dist', 'manifest.json'), `${JSON.stringify(meta, null, 2)}\n`)
console.log(`[${pkg.name}] dist/manifest.json 已生成（entry: ${entry}）`)
