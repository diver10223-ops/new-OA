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