# 第二阶段交付

已实现统一审批实例/任务、服务端选人、并发控制、待办/已办/时间线/同意/拒绝/撤回；请假 CRUD、分页筛选、提交与状态闭环；JWT 角色权限、归属及自审校验；隔离型 best-effort 审计；请假和审批完整页面；V3 字段、约束和索引。

权限：员工仅管理本人申请；负责人/管理员仅处理分配给自己的任务；任何人不得越权查看、处理未分配任务或自审。账号均为 `password`：`employee` 提交，`manager` 处理，`admin` 在无负责人时兜底。审计位于 `sys_operation_log`。

接口：请假 CRUD/list/detail/submit/withdraw；审批 pending/completed/instance detail/approve/reject。页面：请假列表/表单/详情、我的申请、待办、已办、审批详情。

尚未实现立项、动态多节点、通知和审计管理页。下一阶段建议复用业务回调端口实现立项多节点和可靠通知。新增 approval、leave、audit、authorization 模块、V3 migration、前端 API/页面；修改安全、异常、路由、状态映射和全部交付文档。
