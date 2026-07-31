# 数据库脚本

数据库结构由 Flyway 管理，唯一可执行来源位于 `oa-server/src/main/resources/db/migration`。V1 创建系统基础表以及审批、请假、立项预留表；V2 写入部门、角色、菜单、字典与演示用户。应用启动会自动迁移，禁止直接修改已发布版本，应新增后续版本脚本。

默认开发模式使用内存 H2（MySQL 兼容模式）；`mysql` Profile 使用 MySQL 8。演示用户只保存 BCrypt 哈希。
