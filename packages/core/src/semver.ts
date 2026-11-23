/**
 * 轻量语义化版本匹配：仅支持稳定版 x.y.z（minor/patch 可缺省补 0），
 * 范围仅支持 `^` / `~` / 精确版本 / `*`。
 * 刻意不引入完整 semver 依赖；后期如需复合范围（>=、|| 等）再评估替换。
 */

interface SemVer {
  major: number
  minor: number
  patch: number
}

function parseVersion(version: string, owner: string): SemVer {
  const match = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(version.trim())
  if (!match) {
    throw new Error(`[kacean-core] 无法解析版本号 "${version}"（${owner}），仅支持稳定版 x.y.z`)
  }
  return { major: Number(match[1]), minor: Number(match[2] ?? 0), patch: Number(match[3] ?? 0) }
}

function compare(a: SemVer, b: SemVer): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch
}

/** 判断 version 是否满足 range；range 非法时抛错 */
export function satisfiesVersion(version: string, range: string, owner: string): boolean {
  const trimmed = range.trim()
  if (trimmed === '*' || trimmed === '') return true

  const operator = trimmed.startsWith('^') ? '^' : trimmed.startsWith('~') ? '~' : '='
  const target = parseVersion(operator === '=' ? trimmed : trimmed.slice(1), owner)
  const current = parseVersion(version, owner)
  if (compare(current, target) < 0) return false

  if (operator === '=') return compare(current, target) === 0
  if (operator === '~') return current.major === target.major && current.minor === target.minor
  // caret：^1.2.3 -> <2.0.0；^0.2.3 -> <0.3.0；^0.0.3 -> <0.0.4
  if (target.major > 0) return current.major === target.major
  if (target.minor > 0) return current.major === 0 && current.minor === target.minor
  return current.major === 0 && current.minor === 0 && current.patch === target.patch
}
