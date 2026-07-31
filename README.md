# 智能 OA 系统 · 第一阶段原型骨架

这是从零搭建的可扩展模块化单体原型。目前提供可运行的登录、JWT 认证、当前用户、工作台统计、企业级页面框架与数据库基线；请假和立项仅提供菜单、页面入口、数据设计和统一审批骨架，**尚未实现业务提交与审批**。

## 目录

```text
oa-web/       Vue 3 前端
oa-server/    Spring Boot 后端
database/     数据库脚本说明（Flyway 为唯一脚本源）
docs/         架构、数据状态、权限矩阵、接口页面规划、开发规范
deploy/       Docker Compose
```

## 环境与本地启动

- JDK 17+、Maven 3.9+
- Node.js 20+、npm 10+
- 可选：Docker Compose 与 MySQL 8

最快启动不依赖 MySQL（使用内存 H2）：

```bash
# 终端 1
mvn -pl oa-server spring-boot:run

# 终端 2
cd oa-web
npm install
npm run dev
```

访问 `http://localhost:5173`。Swagger 位于 `http://localhost:8080/swagger-ui.html`，健康检查为 `GET http://localhost:8080/api/health`。前端 Vite 将 `/api` 代理至后端。

MySQL 模式：先执行 `docker compose -f deploy/docker-compose.yml up mysql -d`，再执行 `SPRING_PROFILES_ACTIVE=mysql mvn -pl oa-server spring-boot:run`。完整容器启动为 `docker compose -f deploy/docker-compose.yml up --build`，访问 `http://localhost`。

## 演示账号

所有账号初始密码均为 `password`，数据库只保存 BCrypt 哈希：

| 用户名 | 姓名 | 角色 |
|---|---|---|
| `employee` | 张员工 | 普通员工 |
| `manager` | 李经理 | 部门负责人 |
| `project` | 王项目 | 项目管理人员 |
| `admin` | 系统管理员 | 系统管理员 |

以上仅为本地演示凭据；生产环境必须删除演示数据并通过安全流程创建账号，同时通过 `OA_JWT_SECRET` 配置高强度密钥。

## 已实现与边界

已实现统一响应、异常和校验，JWT 无状态认证、安全入口、BCrypt 登录、当前用户和统计接口、Actuator/业务健康检查、OpenAPI、Flyway、H2/MySQL 双模式、基础 RBAC 数据结构、审计表，以及前端路由守卫、请求拦截、用户 Store、登录、布局、工作台、403/404 和预留业务入口。

尚未实现动态菜单/细粒度服务端授权、令牌刷新撤销、数据范围、审计切面、审批状态机、请假/立项 CRUD 和审批闭环、通知、智能助手、MCP/Skill 实现以及生产监控。这些内容应按 `docs/architecture.md` 的实施顺序完成，下一任务建议优先交付“统一审批内核 + 请假纵向闭环”。
