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
