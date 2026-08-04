<script setup lang="ts">
import type { ExecutionTrace } from '../types/assistant'
defineProps<{ open: boolean; trace: ExecutionTrace | null; loading?: boolean; error?: string }>()
defineEmits<{ 'update:open': [value: boolean] }>()
const labels: Record<string, string> = { INPUT_RECEIVED: '接收输入', INTENT_MATCHED: '匹配意图', SLOTS_EXTRACTED: '提取槽位', SCENARIO_SELECTED: '选择场景', SKILL_EXECUTED: '执行技能', TEMPLATE_SELECTED: '选择模板', RESULT_CREATED: '生成结果' }
</script>
<template>
  <el-drawer :model-value="open" direction="rtl" size="min(520px, 90%)" @close="$emit('update:open', false)">
    <template #title>执行轨迹</template>
    <p v-if="loading">轨迹加载中…</p><el-alert v-else-if="error" :title="error" type="error" :closable="false" />
    <el-timeline v-else-if="trace"><el-timeline-item v-for="(event, index) in trace.stages" :key="`${event.stage}-${index}`" :timestamp="event.at"><strong>{{ labels[event.stage] || event.stage }}</strong><pre>{{ JSON.stringify(event.details, null, 2) }}</pre></el-timeline-item></el-timeline>
    <el-empty v-else description="暂无轨迹" />
    <details v-if="trace"><summary>原始 JSON（调试）</summary><pre>{{ JSON.stringify(trace, null, 2) }}</pre></details>
  </el-drawer>
</template>
<style scoped>pre{white-space:pre-wrap;word-break:break-word;background:#f6f8fa;padding:8px;border-radius:6px}summary{cursor:pointer;color:#2563eb}</style>
