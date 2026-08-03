# Assistant MVP Demo - 启动与演示步骤

1. 创建并切换分支（本地执行）:
git fetch origin
git checkout backup/main-before-merge
git pull
git checkout -b feature/assistant-mvp


2. 确保 `assistant-config/` 已存在（仓库根），并包含 YAML/JSON 配置（已经包含示例文件）。

3. 启动后端（demo profile 使用默认 H2）:
mvn -pl oa-server spring-boot:run -Dspring-boot.run.profiles=demo

4. 启动前端:
npm install --prefix oa-web
npm run dev --prefix oa-web


5. 演示用例:
- 查询本月本分行存款余额: 在前端输入 `本月本分行存款余额`，模式选择 `A`，点击查询 → 查看卡片与轨迹。
- 歧义候选: 输入 `存款情况` → 应返回候选列表（candidate scenario）。
- A/B 切换: 输入 `本月存贷比`，切换 A/B 查看不同值。
- 无权限场景: 用非 demo 用户触发跨机构查询 → 返回 denied。

6. Mock 恢复:
curl -X POST http://localhost:8080/api/assistant/mock/reset

7. 查看配置:

GET /api/assistant/config/intents.yml
GET /api/assistant/config/scenarios.yml

