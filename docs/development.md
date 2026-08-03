# 统一开发规范

## 目录和依赖

前端按 `views / layout / stores / api / components` 分层；后端按业务模块组织，每个模块逐步采用 `controller / application / domain / infrastructure`。模块间禁止直接引用对方持久化实现。不得提交密钥、构建产物和明文密码。

## API

URL 使用复数名词，命令动作仅用于无法自然表达的状态转换。JSON 使用 camelCase；时间采用带时区 ISO-8601；分页统一 `page,size,total,items`。响应统一为 `code,message,data`，HTTP 状态表达协议结果，业务错误码表达原因。所有入参使用 Bean Validation，OpenAPI 描述需与实现同步。

## 前后端约定

Java 类名 PascalCase、变量 camelCase、常量 UPPER_SNAKE_CASE；事务放应用服务写命令边界。TypeScript 开启 strict，不使用无理由的 `any`，通用组件通过 props/events 定义契约。页面统一使用浅色卡片、查询区、表格、分页、状态标签和确认弹窗；危险操作必须二次确认。

## Git 与质量

分支提交保持单一目的，提交信息使用祈使句。合入前至少执行 `mvn test`、前端 `npm run build` 与 `npm test`；业务状态机必须有单元测试，认证和关键闭环必须有集成测试。数据库结构只能通过新增 Flyway migration 变更。

## 第二阶段验证
执行 `mvn test`、`cd oa-web && npm install && npm test && npm run build`。默认 H2 启动后按 README 演示；MySQL 8 使用 mysql profile。后续数据库结构只能添加 V4 及以后迁移。OpenAPI 请求时间使用带时区 ISO-8601。

## 立项与迁移验证

V4 是第三阶段唯一数据库增量，加入数据库事务序列和立项字段。默认执行 `mvn test` 会在 H2 MySQL 模式运行 Flyway V1-V4；目标库使用 `docker compose -f deploy/docker-compose.yml up mysql -d` 后执行 `SPRING_PROFILES_ACTIVE=mysql mvn -pl oa-server spring-boot:run`。前端质量命令为 `npm test --prefix oa-web` 和 `npm run build --prefix oa-web`。

## Codespaces 与 GitHub Actions

不维护本机开发环境时，从 GitHub 仓库的 Code/Codespaces 菜单创建环境；`.devcontainer/devcontainer.json` 固定 Java 17、Node.js 20、Docker-in-Docker、端口转发和初始化依赖。开发时默认使用 H2；真实 MySQL 验证由 `Smart OA CI` 的 MySQL 8 service job 执行。CI 的 H2、前端、MySQL 三个 job 全部成功后才可把提交视为通过自动质量门禁；Actions 尚未实际运行的结果不得写成已通过。
