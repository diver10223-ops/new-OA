# 需求说明文档

## 1. 目标

本需求说明文档用于梳理当前仓库整体代码结构、智能助手与 MCP 的预留位置、Skill 注册与执行规划方式，以及 OA 流程与卡片模板的关联关系。

目标是明确：

- 当前已有功能与未实现功能范围
- 未来新 OA 流程的开发路径
- 卡片模板与功能执行的关联方式
- 后台管理如何定义和模拟卡片模板

## 2. 当前仓库整体结构

### 2.1 后端模块

- `oa-server/src/main/java/com/smartoa/auth`
  - 认证、JWT、登录
- `oa-server/src/main/java/com/smartoa/authorization`
  - 当前用户、权限解析
- `oa-server/src/main/java/com/smartoa/approval`
  - 统一审批内核、审批实例、审批任务
- `oa-server/src/main/java/com/smartoa/leave`
  - 请假业务接口与服务、请假审批回调
- `oa-server/src/main/java/com/smartoa/project`
  - 立项业务接口与服务、立项审批回调
- `oa-server/src/main/java/com/smartoa/audit`
  - 审计记录服务
- `oa-server/src/main/java/com/smartoa/common`
  - 统一响应、异常、数据库 ID 生成、分页等基础设施
- `oa-server/src/main/java/com/smartoa/dashboard`
  - 工作台统计与健康检查
- `oa-server/src/main/java/com/smartoa/security`
  - Spring Security 配置

### 2.2 前端模块

- `oa-web/src/views`
  - 页面视图：登录、工作台、请假、立项、审批、详情
- `oa-web/src/router`
  - 路由配置与页面入口
- `oa-web/src/api`
  - 后端 REST API 封装
- `oa-web/src/stores`
  - 用户状态管理
- `oa-web/src/layout`
  - 页面布局组件
- `oa-web/src/utils`
  - 通用工具函数，例如状态映射

## 3. 智能助手 / MCP 当前状态

### 3.1 当前已实现

- 已实现统一审批、请假与立项业务闭环
- 文档中预留了智能助手架构
- `docs/architecture.md` 中提出：
  - `Agent Gateway -> Skill Registry -> MCP Adapter -> Application Service`

### 3.2 当前未实现

- 意图识别引擎：仓库内无相关代码
- Skill 注册与定义：无 `skill` 目录或 Skill 元数据文件
- MCP 适配器与工具登记：无 `mcp` / `integration` 模块下实现
- 卡片模板管理：无后台管理界面或模板配置实现

## 4. 对应实现位置与建议

### 4.1 意图识别

#### 当前状态

- 无对应实现文件

#### 建议位置

- `oa-server/src/main/java/com/smartoa/assistant`

#### 建议文件

- `IntentRecognitionService.java`
- `IntentResult.java`
- `AssistantController.java`

### 4.2 执行规划

#### 当前状态

- 无对应实现文件

#### 建议位置

- `oa-server/src/main/java/com/smartoa/assistant`

#### 建议文件

- `ExecutionPlanner.java`
- `SkillRegistry.java`
- `SkillExecutor.java`

### 4.3 Skill 文件登记

#### 当前状态

- 无 Skill 注册或声明

#### 建议实现

- 新增目录：`oa-server/src/main/java/com/smartoa/assistant/skill`
- 建议文件：
  - `SkillDescriptor.java`
  - `SkillRegistry.java`
  - `LeaveApplySkill.java`
  - `ApprovalListSkill.java`
  - `ProjectSubmitSkill.java`
- 规则可存放于：
  - `src/main/resources/assistant/skills/*.yaml`
  - 或注解方式声明

### 4.4 MCP 文件登记

#### 当前状态

- 无 MCP 相关目录

#### 建议实现

- 新增目录：`oa-server/src/main/java/com/smartoa/integration/mcp`
- 建议文件：
  - `McpTool.java`
  - `McpToolRegistry.java`
  - `McpAdapter.java`
  - `McpRequest.java`
  - `McpResponse.java`

## 5. 新 OA 流程实现方式

### 5.1 业务流程定义

1. 定义新的业务实体（如报销申请、采购申请）
2. 新增数据库表与 DTO/实体
3. 定义业务状态机
4. 新增业务 Controller / Service
5. 实现审批回调接口

### 5.2 审批流程接入

1. 业务服务调用 `ApprovalService.create(businessType, businessId, currentUser)`
2. 实现 `ApprovalBusinessHandler`
3. 审批通过/拒绝时更新业务状态

### 5.3 前端接入

1. 定义列表页、表单页、详情页
2. 定义 `api/<business>.ts`
3. 注册路由
4. 增加导航入口

## 6. 卡片模板与功能映射

### 6.1 当前映射关系

- 待审批列表卡片：`oa-web/src/views/ApprovalTasks.vue`
- 详情卡片：`oa-web/src/views/LeaveDetail.vue`
- 请假申请列表卡片：`oa-web/src/views/LeaveList.vue`
- 立项申请列表卡片：`oa-web/src/views/ProjectList.vue`

### 6.2 未来卡片模板设计

卡片模板应包含：

- 标题
- 摘要信息
- 状态标签
- 操作按钮
- 业务 ID / 审批实例 ID
- 对应 Skill/接口入口

### 6.3 模板与功能关联

- 后端定义卡片模板元数据
- 前端根据模板渲染
- 操作按钮映射到 Skill 或接口
- 语义生成由大模型生成文案，后端返回“标题 + 内容 + 按钮”

## 7. 后台管理新增卡片模板

### 7.1 管理页内容

- 新增/编辑卡片模板
- 选择业务类型
- 配置展示字段
- 配置按钮与 Skill/接口映射
- 提供预览功能

### 7.2 关联方式

- 每个模板绑定 Skill 或接口
- 示例：
  - `approval.task.card` → `ApprovalListSkill`
  - `leave.request.card` → `LeaveApplySkill`
  - `project.review.card` → `ProjectApprovalSkill`

### 7.3 模拟展示

- 管理页面提供参数输入
- 预览卡片样式
- 显示操作按钮和执行目标

## 8. 结论与建议

### 8.1 当前结论

- 当前项目具备 OA 核心业务闭环
- 智能助手 / Skill / MCP 仅为架构预留，无实际实现

### 8.2 建议后续实施顺序

1. 先完善审批内核与业务流程
2. 再新增 `assistant` 模块实现意图识别与 Skill 框架
3. 最后补齐 MCP 适配与卡片模板管理

### 8.3 输出模板对应关系建议

- 待审批列表：基础模板由 `ApprovalTasks.vue` 提供
- 详情页：由 `LeaveDetail.vue` 等页面提供
- 语义模板：后端/模型返回“卡片标题 + 描述 + 操作按钮”
- 功能执行：返回最新业务状态，前端刷新卡片展示