# 第二阶段交付

已实现统一审批实例/任务、服务端选人、并发控制、待办/已办/时间线/同意/拒绝/撤回；请假 CRUD、分页筛选、提交与状态闭环；JWT 角色权限、归属及自审校验；隔离型 best-effort 审计；请假和审批完整页面；V3 字段、约束和索引。

权限：员工仅管理本人申请；负责人/管理员仅处理分配给自己的任务；任何人不得越权查看、处理未分配任务或自审。账号均为 `password`：`employee` 提交，`manager` 处理，`admin` 在无负责人时兜底。审计位于 `sys_operation_log`。

接口：请假 CRUD/list/detail/submit/withdraw；审批 pending/completed/instance detail/approve/reject。页面：请假列表/表单/详情、我的申请、待办、已办、审批详情。

尚未实现立项、动态多节点、通知和审计管理页。下一阶段建议复用业务回调端口实现立项多节点和可靠通知。新增 approval、leave、audit、authorization 模块、V3 migration、前端 API/页面；修改安全、异常、路由、状态映射和全部交付文档。

## 演示账号密码修复

H2 与 MySQL profile 的 Flyway `passwordHash` 默认值现统一为明文 `password` 对应的 BCrypt 哈希，环境变量 `DEMO_PASSWORD_HASH` 仍可覆盖 MySQL 默认值。V2 历史迁移保持不变；空库、CI 和新部署会直接使用正确哈希。对于已经执行 V2 的数据库，V5 只在四个明确演示用户名仍持有旧错误哈希时进行修复，因此不会覆盖用户已自行修改的密码。生产环境不应保留演示账号；部署 V5 前仍须核对是否存在同名真实账号，并优先删除演示数据。

## 第三阶段交付

新增立项申请 API 与页面、多节点审批推进、项目管理角色审批、数据库 ID 分配、撤回版本条件、已处理节点撤回保护、拒绝意见服务端校验和立项状态机测试。V4 未修改历史 migration。已知边界：首版仍为固定流程定义的串行单人节点；MySQL/Testcontainers、浏览器截图需在可用 Docker 和依赖镜像环境复验；通知与可视化流程配置未实现。
