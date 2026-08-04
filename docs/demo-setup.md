# 统一问数本地 Demo：启动与演示

本页描述 ASK-DEMO-03 的单轮、本地规则与 Mock 数据演示。页面没有 mode、A/B 或模型选择器。

## 环境准备

在仓库根目录执行：

```bash
npm ci --prefix oa-web
test -x oa-web/node_modules/.bin/vitest
test -x oa-web/node_modules/.bin/vue-tsc
test -x oa-web/node_modules/.bin/vite
```

依赖安装严格使用 `oa-web/package-lock.json`。如公共 npm registry 不可用，应改用运行环境提供的内部 registry，不要删除或重写 lock 文件来绕过安装问题。

## 启动

分别打开两个终端，在仓库根目录运行：

```bash
# 后端（demo profile，默认监听 8081）
mvn -pl oa-server spring-boot:run -Dspring-boot.run.profiles=demo

# 前端（默认监听 5173，并将 /api 代理到 8081）
npm run dev --prefix oa-web
```

浏览器访问 <http://localhost:5173/ask>。页面提交 `text` 和可选 `org`，无需选择执行模式。

## 固定演示问题

| 问题 | 预期展示 |
| --- | --- |
| `本分行存款余额是多少` | `success`；存款余额查询卡片 |
| `总部平均存款比上期增加多少` | `success`；本期、上期、差额和变化率对比卡片 |
| `贷款占比近三个月趋势` | `success`；按响应原始顺序展示三个月趋势，比例仅在页面格式化为百分比 |
| `存款余额和平均存款是多少` | `candidate`；展示多个候选指标，不自动选择 |
| `今天天气怎么样` | `unsupported`；展示当前能力范围和建议问法 |

接口和页面共有五类互斥状态：

- `success`：仅此状态展示查询、对比或趋势结果；结构异常时展示安全提示。
- `candidate`：展示候选指标。
- `unsupported`：展示不支持提示和建议问法。
- `denied`：只展示权限提示，绝不展示响应中的结果数值。
- `error`：展示业务错误和重试入口。

可用无权限的目标机构验证 `denied`；不可识别机构等执行异常用于验证 `error`。这些正常 HTTP 响应和 HTTP 403/404/500 都不会切换到浏览器 fallback。

## Fallback 与执行轨迹

浏览器 fallback **只在 Axios 网络或传输失败并且错误中没有 HTTP response 时**触发，例如后端停止或代理连接失败。它使用浏览器内置的本地演示规则和数据，页面会显示“当前为本地演示数据”。服务端返回 403、404、500，或业务返回 `denied`、`unsupported`、`error`，均不会触发 fallback。

查询成功后页面不会自动获取或打开轨迹。必须点击“查看执行轨迹”才加载轨迹；远程 trace 由后端获取，本地 fallback trace 由浏览器本地获取。轨迹加载失败只影响抽屉，已展示的主结果会保留。

## 验证命令

```bash
npm test --prefix oa-web
npm run build --prefix oa-web
mvn test
git diff --check
```

## 当前限制

- 不支持上下文续问；候选项需要改写为明确问题后重新提交。
- 不接真实数据库、数据仓库或外部数据源，仅使用本地 Mock 数据。
- 不调用真实大模型，也没有 LLM 配置中心。
- fallback 是浏览器内置的本地演示数据，不代表生产数据或后端可用性。
