/* eslint-env node */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const errors = []
const records = []

const fixedPackages = [
  { dir: 'packages/admin-module-types', name: '@kacean/types', kind: 'public' },
  { dir: 'packages/common', name: '@kacean/common', kind: 'public' },
  { dir: 'packages/core', name: '@kacean/core', kind: 'public' },
  { dir: 'packages/shared-components', name: '@kacean/shared', kind: 'public' },
  { dir: 'packages/shell', name: 'shell', kind: 'shell' }
]

const displayPath = (path) => relative(root, path).replaceAll('\\', '/')

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    errors.push(`${displayPath(path)} 不是有效 JSON：${error.message}`)
    return undefined
  }
}

function loadPackage(dir, expectedName, kind) {
  const absoluteDir = join(root, dir)
  const manifestPath = join(absoluteDir, 'package.json')
  if (!existsSync(manifestPath)) {
    errors.push(`${dir} 缺少 package.json`)
    return
  }

  const manifest = readJson(manifestPath)
  if (!manifest) return
  if (manifest.name !== expectedName) {
    errors.push(`${dir}/package.json 的 name 应为 ${expectedName}，实际为 ${manifest.name ?? '空'}`)
  }

  records.push({ dir, absoluteDir, manifest, kind })
  if (kind === 'public' && manifest.exports?.['.'] !== './src/index.ts') {
    errors.push(`${dir} 必须以 ./src/index.ts 作为默认源码导出`)
  }
  if (kind === 'shell' || kind === 'module') {
    for (const script of ['dev', 'build', 'typecheck']) {
      if (!manifest.scripts?.[script]) errors.push(`${dir} 缺少 ${script} 脚本`)
    }
  }
  if (kind === 'module') {
    for (const file of ['src/manifest.ts', 'src/dev/App.tsx']) {
      if (!existsSync(join(absoluteDir, file))) errors.push(`${dir} 缺少 ${file}`)
    }
  }
}

const rootManifest = readJson(join(root, 'package.json'))
if (rootManifest) {
  if (!/^pnpm@\d+\.\d+\.\d+$/.test(rootManifest.packageManager ?? '')) {
    errors.push('根 package.json 的 packageManager 必须锁定明确的 pnpm 版本')
  }
  for (const field of ['dependencies', 'optionalDependencies']) {
    if (Object.keys(rootManifest[field] ?? {}).length > 0) {
      errors.push(`根 package.json 不允许在 ${field} 中声明业务依赖`)
    }
  }
}

const expectedDirectories = new Set([...fixedPackages.map((item) => item.dir.split('/').at(-1)), 'modules'])
for (const entry of readdirSync(join(root, 'packages'), { withFileTypes: true })) {
  if (entry.isDirectory() && !expectedDirectories.has(entry.name)) {
    errors.push(`packages/${entry.name} 不是约定的固定子包，新增前需先确认，并同步文档与本检查脚本`)
  }
}
for (const item of fixedPackages) loadPackage(item.dir, item.name, item.kind)

const modulesRoot = join(root, 'packages/modules')
if (existsSync(modulesRoot)) {
  for (const entry of readdirSync(modulesRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) loadPackage(`packages/modules/${entry.name}`, entry.name, 'module')
  }
}

const packagesByName = new Map()
for (const record of records) {
  const name = record.manifest.name
  if (packagesByName.has(name)) errors.push(`工作区包名重复：${name}`)
  packagesByName.set(name, record)
}

for (const record of records) {
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, version] of Object.entries(record.manifest[field] ?? {})) {
      const target = packagesByName.get(name)
      const isInternal = target || name === 'shell' || name.startsWith('@kacean/')
      if (!isInternal) continue
      if (!target) {
        errors.push(`${record.dir} 引用了不存在的工作区包 ${name}`)
        continue
      }
      if (version !== 'workspace:*') {
        errors.push(`${record.dir} 对 ${name} 的 ${field} 必须使用 workspace:*，实际为 ${version}`)
      }
      if (
        record.kind === 'module' &&
        (target.kind === 'module' || target.kind === 'shell' || name === '@kacean/core')
      ) {
        errors.push(`${record.dir} 不允许依赖 ${name}（禁止模块互依赖及反向依赖 shell/core）`)
      }
      if (record.kind === 'public' && (target.kind === 'module' || target.kind === 'shell')) {
        errors.push(`${record.dir} 不允许反向依赖 ${name}`)
      }
    }
  }
}

const typesPackage = packagesByName.get('@kacean/types')
if (typesPackage && Object.keys(typesPackage.manifest.dependencies ?? {}).length > 0) {
  errors.push('@kacean/types 是纯类型包，不允许声明运行时 dependencies')
}

const shell = packagesByName.get('shell')
const descriptorsPath = join(root, 'packages/shell/src/modules.config.json')
const descriptors = existsSync(descriptorsPath) ? readJson(descriptorsPath) : undefined
if (!Array.isArray(descriptors)) {
  errors.push('packages/shell/src/modules.config.json 必须是模块描述数组')
} else if (shell) {
  const descriptorIds = new Set()
  for (const descriptor of descriptors) {
    const id = descriptor?.id
    if (typeof id !== 'string' || !id) {
      errors.push('modules.config.json 中每个 descriptor 必须包含非空 id')
      continue
    }
    if (descriptorIds.has(id)) errors.push(`modules.config.json 中 descriptor 重复：${id}`)
    descriptorIds.add(id)

    const target = packagesByName.get(id)
    if (!target || (target.kind !== 'module' && target.kind !== 'shell')) {
      errors.push(`modules.config.json 引用了未知模块：${id}`)
      continue
    }
    if (descriptor.version !== undefined && descriptor.version !== target.manifest.version) {
      errors.push(`modules.config.json 中 ${id} 的版本与模块 package.json 不一致`)
    }
    if (target.kind === 'module' && shell.manifest.dependencies?.[id] !== 'workspace:*') {
      errors.push(`shell 必须以 workspace:* 声明已登记模块 ${id}`)
    }
  }

  for (const [name, version] of Object.entries(shell.manifest.dependencies ?? {})) {
    const target = packagesByName.get(name)
    if (target?.kind === 'module' && version === 'workspace:*' && !descriptorIds.has(name)) {
      errors.push(`shell 已引入 ${name}，但 modules.config.json 未登记`)
    }
  }
}

if (errors.length > 0) {
  console.error(`工作区约束检查失败（${errors.length} 项）：`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const moduleCount = records.filter((record) => record.kind === 'module').length
console.log(`工作区约束检查通过：${records.length} 个包，${moduleCount} 个业务模块。`)
