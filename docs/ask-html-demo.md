# ASK-HTML-01-LEADER：行长经营问数台

## 为什么使用纯 HTML

本页是 Spring Boot 直接托管的业务场景原型、接口输入输出验证器，以及后续正式前端的契约参考。它使用纯 HTML、CSS、原生 JavaScript 和 Fetch API，不依赖 npm、Vue、Vite、Webpack、Element Plus 或 CDN，因而可以在前端 registry 不稳定时独立验证统一问数后端。

页面文件为 `oa-server/src/main/resources/static/ask-leader.html`。在仓库根目录启动：

```bash
mvn -pl oa-server spring-boot:run
```

访问 <http://localhost:8080/ask-leader.html>。页面使用相对 API 地址，部署到其他域名时无需修改。

## API 输入契约

页面固定以行长 `demo_leader` 查询总部 `HEADQUARTERS`，每次仅发送以下契约，不发送其他上下文或模型字段：

```http
POST /api/assistant/execute
Content-Type: application/json
X-User-Id: demo_leader

{
  "text": "用户输入的问题",
  "org": "HEADQUARTERS"
}
```

页面加载时以 `GET /api/health` 检查连接。成功执行后，仅当用户点击“查看执行轨迹”才请求 `GET /api/assistant/trace/{traceId}`；路径参数经过 URL 编码，不自动加载或打开轨迹。关闭并重开同一轨迹可使用页面内缓存，新一次 execute 会清空缓存。

## API 输出契约

`AssistantResponse` 包含 `traceId`、`intent`、`scenario`、`status`、`slots`、`matchedRules`、`template`、`result`、`candidates`、`suggestions` 和 `error`。HTTP 状态与业务 `status` 在页面中分别展示。业务状态互斥：

- `success`：依据字段守卫展示普通指标、对比或趋势；不依赖 `result.type`。比例仅在展示层格式化，趋势保持后端数组顺序。结构不完整时给出提示并保留原始 JSON。
- `candidate`：列出 `code`、`name`、`unit`，不自动选择或二次提交。
- `unsupported`：展示后端建议；点击建议只填充输入框。
- `denied`：只展示无权提示，绝不渲染 `result` 数值。
- `error`：展示后端错误 `code`、`message` 和重新提交入口。

轨迹按后端 `stages` 原始顺序展示阶段中文名、原始 stage、`at` 和 `details`，原始 trace JSON 默认折叠。轨迹失败不会清除主查询结果。

## 五个固定演示问题

1. `总部存款余额是多少`：普通指标查询。
2. `总部平均存款比上期增加多少`：本期、上期、差额和变化率对比。
3. `总部贷款占比近三个月趋势`：三个月比例趋势。
4. `存款余额和平均存款是多少`：多个候选指标。
5. `今天天气怎么样`：超出当前能力，展示建议问法。

快捷按钮只填入问题，仍需用户点击“开始问数”。Enter 提交，Shift+Enter 换行。

## 错误与调试行为

网络失败明确显示“无法连接后端”和浏览器原始错误，不生成本地假结果。HTTP 非 2xx 保留状态及 JSON 或文本响应；JSON 解析失败保留 HTTP 状态、原始文本和解析错误。健康检查失败会显示后端不可用，不会伪装成功。

底部“接口调试信息”默认折叠，展示安全筛选后的 Request、Response 和 Trace Response。它不展示 Authorization、Cookie 或密码；服务端和用户内容均通过 `textContent` 或 DOM API 渲染。

## 当前限制

- 只实现行长角色和总部机构，不提供角色切换。
- 只支持单轮问数，不支持上下文续问。
- 不连接真实数据库、数据仓库或外部数据源，仅使用既有 Mock 数据。
- 不调用真实 LLM，不提供 LLM 配置中心、A/B、执行模式、provider 或模型选择。
- 不使用浏览器 fallback；错误不会被本地演示结果掩盖。
- 本页是演示和接口调试工具，不是最终生产前端。

后续正式技术框架应以本页已经验证的 API 契约为准，而不是复制页面内部实现。
