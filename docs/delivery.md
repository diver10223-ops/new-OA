# 本次交付清单

## 可运行能力

- 后端应用入口、统一响应、全局异常、参数校验、JWT 认证、Spring Security 方法权限基础、BCrypt 登录、当前用户、首页统计、健康检查、OpenAPI 与 Actuator。
- H2 零依赖开发模式、MySQL 8 Profile、Flyway 基线和安全哈希演示数据。
- 登录页、系统主框架、顶部栏、侧栏、工作台、路由守卫、Axios 拦截器、Pinia 用户状态、403/404、业务占位入口和统一视觉样式。
- Docker Compose、前后端镜像配置、架构设计、权限矩阵、状态设计、接口/页面清单、实施计划与开发规范。

## 明确未交付

本次没有实现请假和立项的表单保存、提交、审批、查询业务，没有实现统一审批状态机、动态授权管理、通知投递、审计切面或智能助手执行能力。数据表与模块入口用于降低下一阶段返工，不代表完整业务能力。

## 新增及修改文件

```text
.gitignore
README.md
pom.xml
database/README.md
deploy/docker-compose.yml
docs/architecture.md
docs/development.md
docs/delivery.md
oa-server/Dockerfile
oa-server/pom.xml
oa-server/src/main/java/com/smartoa/OaApplication.java
oa-server/src/main/java/com/smartoa/auth/AuthController.java
oa-server/src/main/java/com/smartoa/common/ApiResponse.java
oa-server/src/main/java/com/smartoa/common/GlobalExceptionHandler.java
oa-server/src/main/java/com/smartoa/dashboard/DashboardController.java
oa-server/src/main/java/com/smartoa/security/JwtFilter.java
oa-server/src/main/java/com/smartoa/security/JwtService.java
oa-server/src/main/java/com/smartoa/security/SecurityConfig.java
oa-server/src/main/resources/application.yml
oa-server/src/main/resources/application-mysql.yml
oa-server/src/main/resources/db/migration/V1__baseline.sql
oa-server/src/main/resources/db/migration/V2__demo_data.sql
oa-server/src/test/java/com/smartoa/AuthFlowTest.java
oa-web/Dockerfile
oa-web/index.html
oa-web/nginx.conf
oa-web/package.json
oa-web/tsconfig.json
oa-web/tsconfig.app.json
oa-web/vite.config.ts
oa-web/src/env.d.ts
oa-web/src/main.ts
oa-web/src/App.vue
oa-web/src/api/http.ts
oa-web/src/layout/AppLayout.vue
oa-web/src/router/index.ts
oa-web/src/stores/user.ts
oa-web/src/styles.css
oa-web/src/utils/status.ts
oa-web/src/utils/status.test.ts
oa-web/src/views/Dashboard.vue
oa-web/src/views/Forbidden.vue
oa-web/src/views/Login.vue
oa-web/src/views/NotFound.vue
oa-web/src/views/Placeholder.vue
```

仓库原有占位文件 `.gitkeep` 已删除。
