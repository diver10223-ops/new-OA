# 下一步计划

## 1. 目标

将当前 OA 项目从“原型骨架”推进到“智能审批平台”，明确接下来的实际开发步骤、文档补齐和验证方式。

## 2. 当前任务

- 继续完善现有审批与业务闭环
- 生成并补齐 `docs/prd.md`
- 进一步补齐 `docs/nextplan.md`
- 规划智能助手 / MCP 模块的后续实现

## 3. 执行阶段

### 3.1 阶段一：现状验证与缺口补齐

- 运行当前验收流程
  - `mvn test`
  - `npm run build --prefix oa-web`
- 验证请假功能完整性
  - `oa-web/src/views/LeaveList.vue`
  - `oa-web/src/views/LeaveForm.vue`
  - `oa-web/src/views/LeaveDetail.vue`
  - 后端 `LeaveController` / `LeaveService`
- 验证立项功能完整性
  - `oa-web/src/views/ProjectList.vue`
  - 后端 `ProjectController` / `ProjectService`
- 验证审批功能完整性
  - `oa-web/src/views/ApprovalTasks.vue`
  - 后端 `ApprovalController` / `ApprovalService`
- 检查前端 API 与后端接口一致性
  - `oa-web/src/api/leave.ts`
  - `oa-web/src/api/project.ts`
  - 路由 `oa-web/src/router/index.ts`
- 补齐缺失页面和边界
  - 如果没有“我的申请”页面，补齐入口与路由
  - 如果没有立项详情页，补齐页面与接口
- 修正路由与接口不一致问题
  - 确保前端调用路径与后端实际路径一致
  - 确保提交/撤回/关闭接口返回格式统一

### 3.2 阶段二：审批内核与业务流程稳定

- 审查 `ApprovalService`
  - `create(...)`
  - `decide(...)`
  - `withdraw(...)`
- 完善审批状态机
  - 补全 `approval_instance` / `approval_task` 的状态校验
  - 强化 `PENDING / APPROVED / REJECTED / WITHDRAWN` 逻辑
- 加强并发保护
  - 增加版本冲突单元测试
  - 验证任务重复处理、实例并发更新行为
- 补齐业务回调实现
  - `LeaveApprovalHandler`
  - `ProjectApprovalHandler`
- 优化请假闭环
  - 验证 `DRAFT -> SUBMITTED -> EFFECTIVE|REJECTED|CANCELLED`
- 优化立项闭环
  - 验证 `DRAFT -> SUBMITTED -> ESTABLISHED | REJECTED | CANCELLED`
  - 验证部门负责人到项目管理复核的串行节点逻辑

### 3.3 阶段三：权限与平台管理

- 补齐后端管理接口
  - 组织管理
  - 用户管理
  - 角色管理
  - 菜单管理
  - 字典管理
- 加强服务端权限校验
  - `CurrentUserService`
  - API `@PreAuthorize` 注解
  - 申请人 / 部门归属校验
- 实现数据范围控制
  - 员工只能查看本人申请
  - 负责人只能处理本部门审批
- 修正前端权限入口
  - 菜单显示与角色对应
  - 路由权限控制与真实后端权限一致
- 规划管理页基础能力
  - 先实现“角色/菜单/字典”管理页面

### 3.4 阶段四：通知与审计能力

- 设计通知模型
  - 通知表、API、消息对象
- 实现通知接口
  - 未读消息列表
  - 标记已读
- 增加前端通知入口
  - 工作台/导航栏未读计数
  - 通知中心或弹窗入口
- 实现审计查询
  - `sys_operation_log` 查询接口
  - 过滤条件：操作人、模块、时间、结果
- 增加审计页面
  - 审计日志列表页
  - 筛选与详情查看
- 事件打通
  - 业务审批事件触发通知
  - 关键操作写审计日志
  - 保证通知/审计与主事务隔离

### 3.5 阶段五：智能助手与 MCP

- 新增 `assistant` 模块骨架
  - 建议目录：`oa-server/src/main/java/com/smartoa/assistant`
- 建立意图识别框架
  - `IntentRecognitionService`
  - `IntentResult`
  - `AssistantController`
- 建立 Skill 注册与执行框架
  - `SkillDescriptor`
  - `SkillRegistry`
  - `SkillExecutor`
  - 样例 Skill：`LeaveApplySkill`、`ApprovalListSkill`、`ProjectSubmitSkill`
- 新增 MCP 适配器结构
  - 建议目录：`oa-server/src/main/java/com/smartoa/integration/mcp`
  - 定义 `McpTool` / `McpToolRegistry` / `McpAdapter`
- 规划卡片模板与功能映射
  - 确定“待审批卡片”“详情卡片”“按钮行为”映射规则
  - 定义语义生成入口
- 先搭骨架再接真实模型
  - 先实现框架层面，后续再接入外部大模型

## 4. 文档与交付

- `docs/prd.md`
  - 当前结构、智能助手预留、Skill/MCP 设计、卡片模板映射
- `docs/nextplan.md`
  - 分阶段实施路线、优先级、验收点
- 继续同步：
  - `README.md`
  - `docs/architecture.md`
  - `docs/delivery.md`

## 5. 重点验证

- `mvn test`
- `npm run build --prefix oa-web`
- 完成本地演示场景
  - 请假提交
  - 审批处理
  - 撤回
  - 立项初审与复核
- 在 MySQL Profile 下复现关键流程

## 6. 备注

- 当前仓库已具备 OA 核心闭环，但智能助手 / MCP 仍需独立实现
- 建议先补齐业务闭环，再逐步引入智能能力

## 7. 问数场景 Demo：3 天可执行任务清单

### 7.1 Day 1：冻结契约并建立可测试的数据基线

- [ ] **D1-01 冻结指标与意图口径（1 小时）**
  - 工作内容：确定“存款余额、平均存款、贷款占比”3 个指标，以及“查指标值、比较指标、找趋势”3 个意图；为每个意图补充至少 3 条典型问法、必填槽位和预期输出。
  - 代码文件：`assistant-config/intents.yml`、`assistant-config/scenarios.yml`、`assistant-config/skills.yml`。
  - 完成标准：所有演示问题均能唯一映射到意图和场景，配置中的标识符互相引用一致。
- [ ] **D1-02 定稿 mock 数据与响应字段（1.5 小时）**
  - 工作内容：补齐指标编码、名称、数值、单位、统计周期、同比/环比、趋势序列、数据口径和更新时间；定义无数据与多候选数据。
  - 代码文件：`assistant-config/mocks/deposit.json`、`oa-server/src/main/java/com/smartoa/assistant/MockDatasetService.java`。
  - 完成标准：3 个指标均有可查询、可比较、可展示趋势的数据，缺失指标不会导致异常。
- [ ] **D1-03 校验配置加载与注册关系（2 小时）**
  - 工作内容：校验意图、场景、技能、模板和策略配置；启动时对重复 ID、缺失引用和空关键词给出明确错误。
  - 代码文件：`oa-server/src/main/java/com/smartoa/assistant/RegistryLoader.java`、`assistant-config/templates.yml`、`assistant-config/policies.yml`。
  - 完成标准：合法配置可成功加载，错误配置可被快速定位。
- [ ] **D1-04 固化执行请求、响应与轨迹契约（2 小时）**
  - 工作内容：明确请求问题、可选会话上下文，以及响应结果、候选项、建议问题和执行轨迹字段；保持“输入 -> 意图 -> 场景 -> 技能 -> 模板”的轨迹顺序。
  - 代码文件：`oa-server/src/main/java/com/smartoa/assistant/AssistantController.java`、`oa-server/src/main/java/com/smartoa/assistant/ExecutionPlanner.java`、`oa-server/src/main/java/com/smartoa/assistant/ExecutionTraceService.java`。
  - 完成标准：用固定请求可获得稳定 JSON，前端无需猜测字段含义。
- [ ] **D1-05 确认 Demo 直达入口（1.5 小时）**
  - 工作内容：将问数页设为公开或默认演示入口；确认刷新页面不触发登录跳转，其他 OA 路由权限不被破坏。
  - 代码文件：`oa-web/src/router/index.ts`、`oa-web/src/stores/user.ts`、`oa-web/src/views/Login.vue`。
  - 完成标准：无 token 时可直接打开问数页并输入问题。

### 7.2 Day 2：完成问数主链路与前端展示

- [ ] **D2-01 实现三类规则规划（2.5 小时）**
  - 工作内容：按配置完成指标词、比较词和趋势词匹配；定义精确命中、模糊命中、多个候选和未命中的优先级。
  - 代码文件：`oa-server/src/main/java/com/smartoa/assistant/ExecutionPlanner.java`、`assistant-config/intents.yml`、`assistant-config/scenarios.yml`。
  - 完成标准：3 类意图的代表问题均产生正确计划，并返回可解释的匹配依据。
- [ ] **D2-02 实现指标查询、比较与趋势执行（2.5 小时）**
  - 工作内容：读取本地数据，执行单指标查询、双指标比较和时间序列趋势计算；统一单位、精度和空值处理。
  - 代码文件：`oa-server/src/main/java/com/smartoa/assistant/MockDatasetService.java`、`oa-server/src/main/java/com/smartoa/assistant/AssistantController.java`、`assistant-config/skills.yml`。
  - 完成标准：接口不访问数据库或外部服务即可返回完整结果。
- [ ] **D2-03 完成问答页与结果组件（3 小时）**
  - 工作内容：实现快捷问题、输入与提交状态、指标卡片、候选列表、下一步建议、数据说明和空状态；轨迹面板展示各执行阶段。
  - 代码文件：`oa-web/src/views/AskAnalytics.vue`、`oa-web/src/components/IndicatorCard.vue`、`oa-web/src/components/TraceDrawer.vue`。
  - 完成标准：一次提问可在同页完成提交、查看结果和展开执行轨迹。
- [ ] **D2-04 接通接口并提供本地降级（1 小时）**
  - 工作内容：统一 `/api/assistant/execute` 调用；后端不可用时返回与真实接口同结构的前端 fallback，并以非阻断方式提示演示数据来源。
  - 代码文件：`oa-web/src/api/http.ts`、`oa-web/src/views/AskAnalytics.vue`、`oa-web/vite.config.ts`。
  - 完成标准：后端在线时使用接口，后端离线时页面仍可完成核心演示且无未处理异常。

### 7.3 Day 3：补齐演示路径、测试和交付说明

- [ ] **D3-01 补齐 4 条 Demo 路径（2.5 小时）**
  - 工作内容：覆盖直接命中、候选消歧、模糊匹配、上下文续问；上下文至少保留上一轮指标和时间范围。
  - 代码文件：`oa-server/src/main/java/com/smartoa/assistant/ExecutionPlanner.java`、`oa-server/src/main/java/com/smartoa/assistant/ExecutionTraceService.java`、`oa-web/src/views/AskAnalytics.vue`。
  - 完成标准：4 条路径均有固定演示问题、稳定结果和对应轨迹。
- [ ] **D3-02 完善错误容错与页面体验（2 小时）**
  - 工作内容：处理空输入、未知指标、请求超时、无数据和重复提交；优化移动端布局、加载态、错误提示和 fallback 标识。
  - 代码文件：`oa-web/src/views/AskAnalytics.vue`、`oa-web/src/components/IndicatorCard.vue`、`oa-web/src/components/TraceDrawer.vue`、`oa-web/src/api/http.ts`。
  - 完成标准：任何错误都不会产生空白页，用户始终能看到可执行的下一步建议。
- [ ] **D3-03 增加自动化与构建验证（2.5 小时）**
  - 工作内容：增加后端规则与接口测试，覆盖 3 类意图和 4 条路径；增加前端 fallback/响应映射测试，并执行全量构建。
  - 代码文件：建议新增 `oa-server/src/test/java/com/smartoa/assistant/ExecutionPlannerTest.java`、`oa-server/src/test/java/com/smartoa/assistant/AssistantControllerTest.java`、`oa-web/src/views/AskAnalytics.test.ts`。
  - 完成标准：`mvn test`、`npm test --prefix oa-web`（如已配置）和 `npm run build --prefix oa-web` 通过。
- [ ] **D3-04 完成交付与演示手册（1 小时）**
  - 工作内容：记录启动命令、访问地址、支持意图、演示问题、配置扩展方法、fallback 行为和已知限制。
  - 代码文件：`README.md`、`docs/development.md`、`docs/delivery.md`、`docs/demo-setup.md`。
  - 完成标准：新成员可在 5 分钟内启动并走完 4 条 Demo 路径。

## 8. 下一步立即执行的工作

### 工作任务名称

`D1-01/D1-02：冻结问数语义契约与 mock 数据基线`

### 工作内容

1. 审核并统一 5 份助手配置中的 ID、引用关系、关键词、槽位和输出模板。
2. 将 3 个核心指标的数据字段补齐到可支持查询、比较、趋势展示的程度。
3. 为 3 类意图分别整理至少 3 个输入样例，并为直接命中、多候选、模糊匹配和续问预留数据。
4. 不引入数据库、外部接口或大模型依赖，保证所有结果可由配置与本地 JSON 重现。
5. 完成后先增加配置/数据加载测试，再进入规则规划器开发。

### 可直接复制的任务提示词

```text
任务：完成问数 Demo 的“语义契约与 mock 数据基线”。

请先阅读 assistant-config/intents.yml、scenarios.yml、skills.yml、templates.yml、policies.yml、
assistant-config/mocks/deposit.json，以及 oa-server/src/main/java/com/smartoa/assistant/RegistryLoader.java
和 MockDatasetService.java。

要求：
1. 固定 3 个核心指标：存款余额、平均存款、贷款占比。
2. 固定 3 类意图：查指标值、比较指标、找趋势。
3. 每类意图配置至少 3 条中文代表问法，并明确指标、时间范围、比较对象等槽位。
4. mock 数据必须包含指标编码、名称、值、单位、统计周期、同比/环比、趋势序列、数据口径、更新时间。
5. 配置中的 intent/scenario/skill/template/policy 引用必须一致，不保留无效引用。
6. 预留直接命中、候选列表、模糊匹配、上下文续问 4 条 Demo 路径所需的别名和数据。
7. 禁止接入真实后端数据源、数据库或外部大模型；保持纯配置和本地 JSON 驱动。
8. 为配置加载和 mock 数据读取补充自动化测试，至少验证正常加载、未知指标和缺失字段处理。
9. 运行相关后端测试，并在交付说明中列出修改文件、支持的示例问题、验证命令和结果。

验收：3 个指标均可由本地数据完整表达；3 类意图均有明确样例和配置映射；配置引用校验通过；
后续 ExecutionPlanner 可直接消费这些配置，无需再次修改字段契约。
```
