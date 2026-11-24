import type { ModuleDefinition, ModuleDefinitionResult, ModuleSelf } from './index'

/** 由 @kacean/module/vite 按 importer 所属模块生成。 */
export const self: ModuleSelf

/** 已绑定当前模块 self，无需传入 name/version/servicePath。 */
export function defineModule(definition: ModuleDefinition): ModuleDefinitionResult
