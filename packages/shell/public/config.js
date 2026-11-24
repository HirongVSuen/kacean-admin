// 部署时可直接修改本文件，无需重新构建；仅放公开配置，不要写入密钥。
// 默认不写死覆盖值，让 VITE_* 环境变量与代码默认值可以正常回退。
window.__KACEAN_CONFIG__ = {
  // app: { title: 'kacean-admin', homePath: '/two-ticket-management' },
  http: {
    // origin: 'https://example.com:8080', // 缺省 '' 表示同源；本地联调通常保持同源以走 Vite 代理。
    // basePath: '/api', // 缺省 '/api'；空字符串表示无公共前缀。
    // timeout: 30000
  },
  modules: {
    // 每个模块独立覆盖地址；未配置的字段继承模块 package.json 与全局默认值。
    // 'account-management': {
    //   disabled: true,
    //   order: 30,
    //   http: { origin: 'https://account.example.com', basePath: '/openapi' },
    //   services: {
    //     default: { servicePath: '/two-ticket', http: { basePath: '/account-api' } }
    //   }
    // },
    // 'data-dict-management': { http: { basePath: '/dict-api' } }
  }
}
