#!/usr/bin/env bash
set -euo pipefail

BRANCH=feature/assistant-mvp
REMOTE=origin

git fetch $REMOTE
git checkout -B $BRANCH

# assistant-config files
mkdir -p assistant-config/mocks

cat > assistant-config/intents.yml <<'YML'
intents:
  - id: query_deposit_balance
    name: 查询存款余额
    examples:
      - "本月本分行存款余额"
      - "本分行存款余额是多少"
      - "今天我们分行的存款余额"
    synonyms: ["存款余额", "存款总额", "存款盘子"]

  - id: query_avg_deposit
    name: 查询日均存款
    examples:
      - "本月日均存款余额"
      - "日均存款"
    synonyms: ["日均存款", "平均存款"]

  - id: query_loan_deposit_ratio
    name: 查询存贷比
    examples:
      - "本月存贷比"
      - "存贷比是多少"
    synonyms: ["存贷比", "贷款存款比"]
YML

cat > assistant-config/scenarios.yml <<'YML'
scenarios:
  - id: deposit_balance_standard
    name: 存款余额-标准卡片
    intent: query_deposit_balance
    slots: ["time","org"]
    domainType: "analytics"
    mode: "A" # A 为标准卡片直达
    skills:
      - read_indicator
    template: indicator_card
    policies: ["org_view_policy"]

  - id: deposit_balance_candidates
    name: 存款情况-候选
    intent: query_deposit_balance
    slots: ["time","org"]
    mode: "candidate"
    skills:
      - list_candidates
    template: candidate_list
    policies: ["org_view_policy"]

  - id: loan_deposit_ratio_ab
    name: 存贷比-A/B示例
    intent: query_loan_deposit_ratio
    slots: ["time","org"]
    mode: "AB"
    skills:
      - read_indicator
      - derived_calc
    template: indicator_card
    policies: ["org_view_policy"]
YML

cat > assistant-config/skills.yml <<'YML'
skills:
  - id: read_indicator
    name: 读取指标
    type: read
    description: 从 Mock Dataset 返回指标值

  - id: list_candidates
    name: 列出候选指标
    type: read
    description: 针对歧义问题返回候选项

  - id: derived_calc
    name: 衍生计算
    type: read
    description: 在后端使用受控公式计算衍生指标（例：存贷比）

  - id: confirm_write
    name: 写操作确认（占位）
    type: write
    requiresConfirmation: true
    description: 写类 Skill 必须产生确认卡并通过 token 执行
YML

cat > assistant-config/templates.yml <<'YML'
templates:
  - id: indicator_card
    title: 指标卡
    view: |
      title: "{{indicatorName}}"
      value: "{{value}}"
      meta:
        - "口径: {{calculation}}"
        - "机构: {{org}}"
        - "时间: {{time}}"
      footer_buttons:
        - label: "查看轨迹"
          action: "showTrace"

  - id: candidate_list
    title: 候选指标
    view: |
      items: "{{candidates}}"
      note: "请选择一个候选项继续"
YML

cat > assistant-config/policies.yml <<'YML'
policies:
  - id: org_view_policy
    name: 机构视图策略
    description: 演示级简单策略，根据示例用户的 org 列表判断是否可以查看指标
    rules:
      - type: allow_if_org_in_list
        param: allowed_orgs # 从 mock user 读取
YML

cat > assistant-config/mocks/deposit.json <<'JSON'
{
  "users": [
    {"id":"demo_leader","name":"行长","roles":["leader"], "org":"HEADQUARTERS"},
    {"id":"demo_branch_manager","name":"分行经理","roles":["manager"], "org":"BRANCH_001"}
  ],
  "indicators": {
    "deposit_balance": {
      "A": {"HEADQUARTERS": 1200000000, "BRANCH_001": 15000000},
      "B": {"HEADQUARTERS": 1180000000, "BRANCH_001": 14500000}
    },
    "avg_deposit": {
      "A": {"HEADQUARTERS": 40000000, "BRANCH_001": 500000},
      "B": {"HEADQUARTERS": 39500000, "BRANCH_001": 480000}
    },
    "loan_deposit_ratio": {
      "A": {"HEADQUARTERS": 0.55, "BRANCH_001": 0.62},
      "B": {"HEADQUARTERS": 0.53, "BRANCH_001": 0.60}
    }
  },
  "candidates": {
    "deposit_case": ["deposit_balance","avg_deposit","deposit_new"]
  }
}
JSON

# Create Java package dirs
mkdir -p oa-server/src/main/java/com/smartoa/assistant

cat > oa-server/src/main/java/com/smartoa/assistant/RegistryLoader.java <<'JAVA'
package com.smartoa.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.File;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

@Component
public class RegistryLoader {
    private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
    private final ObjectMapper json = new ObjectMapper();

    private final Map<String,Object> registries = new HashMap<>();

    @PostConstruct
    public void load() throws Exception {
        File cfg = new File("assistant-config");
        if (!cfg.exists()) return;
        Files.list(cfg.toPath()).forEach(path -> {
            try {
                String name = path.getFileName().toString();
                if (name.endsWith(".yml") || name.endsWith(".yaml")) {
                    Object obj = yaml.readValue(path.toFile(), Object.class);
                    registries.put(name, obj);
                } else if (name.endsWith(".json")) {
                    Object obj = json.readValue(path.toFile(), Object.class);
                    registries.put(name, obj);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to load config: " + path + " : " + e.getMessage(), e);
            }
        });
    }

    public Object getRegistry(String name) {
        return registries.get(name);
    }

    public Map<String,Object> getAll() {
        return registries;
    }
}
JAVA

cat > oa-server/src/main/java/com/smartoa/assistant/MockDatasetService.java <<'JAVA'
package com.smartoa.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.File;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MockDatasetService {
    private final ObjectMapper json = new ObjectMapper();
    private final Map<String,Object> datasets = new ConcurrentHashMap<>();
    private final Map<String,Object> snapshot = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() throws Exception {
        File dir = new File("assistant-config/mocks");
        if (!dir.exists()) return;
        for (File f : dir.listFiles()) {
            if (f.isFile()) {
                Map m = json.readValue(f, Map.class);
                datasets.put(f.getName(), m);
            }
        }
        snapshot.putAll(datasets);
    }

    public Object getMock(String key) {
        return datasets.get(key);
    }

    public Map<String,Object> getAll() {
        return datasets;
    }

    public void resetAll() {
        datasets.clear();
        datasets.putAll(snapshot);
    }

    // convenience: get indicator value
    public Object getIndicatorValue(String indicatorId, String mode, String org) {
        try {
            Map<String,Object> indicators = (Map) datasets.get("deposit.json");
            Map m = (Map) indicators.get("indicators");
            Map in = (Map) m.get(indicatorId);
            Map modeMap = (Map) in.get(mode);
            Object v = modeMap.get(org);
            return v;
        } catch (Exception e) {
            return null;
        }
    }
}
JAVA

cat > oa-server/src/main/java/com/smartoa/assistant/ExecutionTraceService.java <<'JAVA'
package com.smartoa.assistant;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ExecutionTraceService {
    public static class Trace {
        public String id;
        public Instant created = Instant.now();
        public String text;
        public Map<String,Object> plan;
        public Map<String,Object> result;
        public String confirmToken; // for write ops
    }

    private final ConcurrentHashMap<String, Trace> traces = new ConcurrentHashMap<>();

    public Trace create(String text, Map<String,Object> plan) {
        Trace t = new Trace();
        t.id = UUID.randomUUID().toString();
        t.text = text;
        t.plan = plan;
        traces.put(t.id, t);
        return t;
    }

    public Trace get(String id) {
        return traces.get(id);
    }

    public void saveResult(String id, Map<String,Object> result) {
        Trace t = traces.get(id);
        if (t!=null) t.result = result;
    }

    public void setConfirmToken(String id, String token) {
        Trace t = traces.get(id);
        if (t!=null) t.confirmToken = token;
    }

    public boolean validateToken(String id, String token) {
        Trace t = traces.get(id);
        return t!=null && token!=null && token.equals(t.confirmToken);
    }
}
JAVA

cat > oa-server/src/main/java/com/smartoa/assistant/ExecutionPlanner.java <<'JAVA'
package com.smartoa.assistant;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ExecutionPlanner {
    private final RegistryLoader loader;
    private final MockDatasetService mockService;
    private final ExecutionTraceService traceService;

    public ExecutionPlanner(RegistryLoader loader, MockDatasetService mockService, ExecutionTraceService traceService) {
        this.loader = loader;
        this.mockService = mockService;
        this.traceService = traceService;
    }

    // very simple rule-based NL mapping
    public Map<String,Object> plan(String text, String userId, String mode) {
        Map<String,Object> plan = new LinkedHashMap<>();
        plan.put("text", text);
        plan.put("userId", userId);
        // naive keyword detection
        if (text.contains("存贷比") || text.contains("存贷")) {
            plan.put("scenario", "loan_deposit_ratio_ab");
            plan.put("indicator", "loan_deposit_ratio");
        } else if (text.contains("日均") || text.contains("日均存款")) {
            plan.put("scenario", "deposit_balance_standard");
            plan.put("indicator", "avg_deposit");
        } else {
            // default deposit balance
            plan.put("scenario", "deposit_balance_standard");
            plan.put("indicator", "deposit_balance");
        }
        plan.put("mode", mode==null?"A":mode);
        // determine org from simple tokens
        if (text.contains("分行") || text.contains("本分行")) {
            plan.put("org", "BRANCH_001");
        } else {
            plan.put("org", "HEADQUARTERS");
        }
        return plan;
    }

    public Map<String,Object> executePlan(Map<String,Object> plan) {
        String indicator = (String)plan.get("indicator");
        String mode = (String)plan.get("mode");
        String org = (String)plan.get("org");
        Object value = mockService.getIndicatorValue(indicator, mode, org);
        Map<String,Object> res = new HashMap<>();
        res.put("indicator", indicator);
        res.put("mode", mode);
        res.put("org", org);
        res.put("value", value);
        res.put("rawMockKey", "deposit.json");
        return res;
    }

    public String generateConfirmToken() {
        return UUID.randomUUID().toString();
    }
}
JAVA

cat > oa-server/src/main/java/com/smartoa/assistant/AssistantController.java <<'JAVA'
package com.smartoa.assistant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final RegistryLoader loader;
    private final ExecutionPlanner planner;
    private final ExecutionTraceService traceService;
    private final MockDatasetService mockService;

    public AssistantController(RegistryLoader loader, ExecutionPlanner planner, ExecutionTraceService traceService, MockDatasetService mockService) {
        this.loader = loader;
        this.planner = planner;
        this.traceService = traceService;
        this.mockService = mockService;
    }

    @PostMapping("/execute")
    public ResponseEntity<?> execute(@RequestBody Map<String,Object> req, @RequestHeader(value="X-User-Id", required=false) String userId) {
        String text = (String) req.getOrDefault("text","");
        String mode = (String) req.getOrDefault("mode","A");
        Map<String,Object> plan = planner.plan(text, userId==null?"demo_branch_manager":userId, mode);
        ExecutionTraceService.Trace trace = traceService.create(text, plan);
        // simulate permission guard: if user org != target org and not HEADQUARTERS then deny value
        String org = (String)plan.get("org");
        boolean allowed = true;
        if ("BRANCH_001".equals(org) && "demo_branch_manager".equals(userId)==false && userId!=null && !userId.contains("demo")) {
            allowed = false;
        }
        Map<String,Object> result = planner.executePlan(plan);
        if (!allowed) {
            result.put("value", null);
            result.put("denied", true);
            result.put("reason", "no_permission");
        } else {
            result.put("denied", false);
        }
        traceService.saveResult(trace.id, result);
        Map<String,Object> resp = Map.of("traceId", trace.id, "result", result);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/continue")
    public ResponseEntity<?> cont(@RequestBody Map<String,Object> req) {
        String traceId = (String) req.get("traceId");
        String token = (String) req.get("token");
        if (!traceService.validateToken(traceId, token)) {
            return ResponseEntity.status(400).body(Map.of("error","invalid_token"));
        }
        // in demo, write ops update in-memory mock (not implemented here, placeholder)
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/config/{name}")
    public ResponseEntity<?> config(@PathVariable String name) {
        Object c = loader.getRegistry(name);
        if (c==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(c);
    }

    @PostMapping("/mock/reset")
    public ResponseEntity<?> mockReset() {
        mockService.resetAll();
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/trace/{id}")
    public ResponseEntity<?> trace(@PathVariable String id) {
        ExecutionTraceService.Trace t = traceService.get(id);
        if (t==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(t);
    }
}
JAVA

# Frontend files
mkdir -p oa-web/src/views oa-web/src/components

cat > oa-web/src/views/AskAnalytics.vue <<'VUE'
<script setup lang="ts">
import { ref } from 'vue'
import IndicatorCard from '../components/IndicatorCard.vue'
import TraceDrawer from '../components/TraceDrawer.vue'

const text = ref('')
const mode = ref('A')
const result = ref<any>(null)
const trace = ref<any>(null)
const traceOpen = ref(false)

async function execute() {
  const r = await fetch('/api/assistant/execute', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-User-Id': 'demo_branch_manager'},
    body: JSON.stringify({text: text.value, mode: mode.value})
  })
  const j = await r.json()
  result.value = j.result
  const traceId = j.traceId
  const t = await fetch(`/api/assistant/trace/${traceId}`)
  trace.value = await t.json()
  traceOpen.value = true
}
</script>

<template>
  <div>
    <h2>智能问数（演示）</h2>
    <el-input v-model="text" placeholder="输入你的问题，例如：本月本分行存款余额" />
    <el-select v-model="mode" placeholder="模式">
      <el-option label="A 模式（标准卡片）" value="A" />
      <el-option label="B 模式（敏捷衍生）" value="B" />
    </el-select>
    <el-button type="primary" @click="execute">查询</el-button>
    <div v-if="result">
      <IndicatorCard :data="result" />
      <el-button @click="traceOpen = true">查看执行轨迹</el-button>
    </div>
    <TraceDrawer v-model:open="traceOpen" :trace="trace" />
  </div>
</template>
VUE

cat > oa-web/src/components/IndicatorCard.vue <<'VUE'
<script setup lang="ts">
defineProps<{ data: any }>()
const props = defineProps()
</script>

<template>
  <el-card>
    <h3>{{ props.data.indicator }}</h3>
    <p>值：{{ props.data.value }} <span v-if="props.data.denied">(无权限)</span></p>
    <p>机构：{{ props.data.org }} 模式：{{ props.data.mode }}</p>
  </el-card>
</template>
VUE

cat > oa-web/src/components/TraceDrawer.vue <<'VUE'
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ open: boolean, trace: any }>()
const emits = defineEmits(['update:open'])
</script>

<template>
  <el-drawer :model-value="props.open" direction="rtl" size="40%">
    <template #title>Execution Trace</template>
    <pre>{{ props.trace ? JSON.stringify(props.trace, null, 2) : '无轨迹' }}</pre>
    <div style="text-align:right">
      <el-button @click="$emit('update:open', false)">关闭</el-button>
    </div>
  </el-drawer>
</template>
VUE

# docs
mkdir -p docs
cat > docs/demo-setup.md <<'MD'
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

MD

# git add / commit / push
git add assistant-config oa-server/src/main/java/com/smartoa/assistant oa-web/src/views oa-web/src/components docs
git commit -m "assistant(mvp): add assistant-config, backend registries, mock service, planner and frontend demo pages"
git push -u $REMOTE $BRANCH

echo "Created branch $BRANCH and pushed changes. Next: run backend and frontend per docs/demo-setup.md"
