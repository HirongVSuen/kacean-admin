/** shell 构建/开发模式集中定义，模块加载与菜单来源共用，避免判断条件漂移。 */
export const isDemoMode = import.meta.env.MODE === 'demo'
export const isModuleDevelopmentMode = import.meta.env.MODE === 'module-dev'
export const developmentModuleName = import.meta.env.VITE_DEV_MODULE

/**
 * development / production 均为真实业务模式（联调与生产仅环境配置不同）；
 * demo 样例模式与 template-module 单模块开发不加载业务菜单。
 */
export const shouldLoadBusinessMenus =
  (!isDemoMode && !isModuleDevelopmentMode) || (isModuleDevelopmentMode && developmentModuleName !== 'template-module')
