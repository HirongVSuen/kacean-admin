/* eslint-env node */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const errors = []
const records = []

const fixedPackages = [
  { dir: 'packages/types', name: '@kacean/types', kind: 'public' },
  { dir: 'packages/common', name: '@kacean/common', kind: 'public' },
  { dir: 'packages/module', name: '@kacean/module', kind: 'public' },
  { dir: 'packages/core', name: '@kacean/core', kind: 'public' },
  { dir: 'packages/ui', name: '@kacean/ui', kind: 'public' },
  { dir: 'packages/shell', name: 'shell', kind: 'shell' }
]

const moduleModes = ['development', 'production', 'demo']

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
    const requiredScripts = kind === 'shell' ? ['dev', 'dev:module', 'build', 'typecheck'] : ['typecheck']
    for (const script of requiredScripts) {
      if (!manifest.scripts?.[script]) errors.push(`${dir} 缺少 ${script} 脚本`)
    }
  }
  if (kind === 'module') {
    if (!existsSync(join(absoluteDir, 'src/index.ts'))) {
      errors.push(`${dir} 缺少 src/index.ts 模块定义入口`)
    }
    // 构建期以 shell 的 workspace 依赖为登记点，按 kacean.modes 聚合各模式候选集。
    const modes = manifest.kacean?.modes
    if (!Array.isArray(modes) || modes.length === 0 || modes.some((mode) => !moduleModes.includes(mode))) {
      errors.push(`${dir}/package.json 必须声明 kacean.modes（非空数组，可选 ${moduleModes.join('/')}）`)
    }
    if (manifest.dependencies?.['@kacean/module'] !== 'workspace:*') {
      errors.push(`${dir} 必须以 workspace:* 依赖 @kacean/module`)
    }
    const servicePath = manifest.kacean?.servicePath
    const paths = typeof servicePath === 'string' ? { default: servicePath } : servicePath
    if (paths !== undefined) {
      if (typeof paths !== 'object' || paths === null || Array.isArray(paths)) {
        errors.push(`${dir}/package.json 的 kacean.servicePath 必须是路径字符串或 key-value 对象`)
      } else if (Object.keys(paths).length === 0) {
        errors.push(`${dir}/package.json 的 kacean.servicePath 对象至少声明一个服务`)
      } else {
        for (const [key, path] of Object.entries(paths)) {
          if (
            !key.trim() ||
            typeof path !== 'string' ||
            !path.trim().startsWith('/') ||
            path.includes('?') ||
            path.includes('#')
          ) {
            errors.push(
              `${dir}/package.json 的 kacean.servicePath.${key} 必须是非空、以 / 开头且不含 query/hash 的路径`
            )
          }
        }
      }
    }
    const http = manifest.kacean?.http
    if (http !== undefined) {
      if (typeof http !== 'object' || http === null || Array.isArray(http)) {
        errors.push(`${dir}/package.json 的 kacean.http 必须是仅含 origin/basePath 的对象`)
      } else {
        const unsupported = Object.keys(http).filter((field) => !['origin', 'basePath'].includes(field))
        if (unsupported.length > 0) {
          errors.push(`${dir}/package.json 的 kacean.http 不支持：${unsupported.join('、')}`)
        }
        for (const field of ['origin', 'basePath']) {
          if (http[field] !== undefined && typeof http[field] !== 'string') {
            errors.push(`${dir}/package.json 的 kacean.http.${field} 必须是字符串`)
          }
        }
        if (typeof http.basePath === 'string' && http.basePath && !http.basePath.startsWith('/')) {
          errors.push(`${dir}/package.json 的 kacean.http.basePath 必须以 / 开头或为空字符串`)
        }
      }
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

if (errors.length > 0) {
  console.error(`工作区约束检查失败（${errors.length} 项）：`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const moduleCount = records.filter((record) => record.kind === 'module').length
console.log(`工作区约束检查通过：${records.length} 个包，${moduleCount} 个业务模块。`)
