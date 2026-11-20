import type { AdminModuleManifest } from '@kacean/types'

import { manifest as demoModule } from 'demo-module'

/**
 * 业务模块注册表（方案 B：模块自描述 + shell 显式注册）。
 * 每个业务模块在自身包内导出 manifest，此处登记后由 shell 聚合成菜单与路由。
 */
export const moduleManifests: AdminModuleManifest[] = [demoModule]
