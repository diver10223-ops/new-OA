<script setup lang="ts">
import { computed, ref } from 'vue'
import IndicatorCard from '../components/IndicatorCard.vue'
import TraceDrawer from '../components/TraceDrawer.vue'
import { executeAssistant, getAssistantTrace } from '../api/assistant'
import type { AssistantExecuteResponse, ExecutionTrace } from '../types/assistant'

const examples = ['本分行存款余额是多少', '总部平均存款比上期增加多少', '贷款占比近三个月趋势', '存款余额和平均存款是多少', '今天天气怎么样']
const emptySuggestions = examples.slice(0, 3)
const text = ref('')
const org = ref('')
const response = ref<AssistantExecuteResponse | null>(null)
const loading = ref(false)
const validation = ref('')
const requestError = ref('')
const trace = ref<ExecutionTrace | null>(null)
const traceOpen = ref(false)
const traceLoading = ref(false)
const traceError = ref('')
const canTrace = computed(() => Boolean(response.value?.traceId))

function fillSuggestion(value: string) { text.value = value; validation.value = '' }
async function execute() {
  const question = text.value.trim()
  if (!question) { validation.value = '请输入问题后再查询'; return }
  if (loading.value) return
  loading.value = true; validation.value = ''; requestError.value = ''; response.value = null; trace.value = null; traceOpen.value = false; traceError.value = ''
  try { response.value = await executeAssistant({ text: question, ...(org.value.trim() ? { org: org.value.trim() } : {}) }) }
  catch { requestError.value = '请求失败，请稍后重试'; }
  finally { loading.value = false }
}
async function openTrace() {
  if (!response.value?.traceId || traceLoading.value) return
  traceOpen.value = true; traceLoading.value = true; traceError.value = ''
  try { trace.value = await getAssistantTrace(response.value.traceId) }
  catch { traceError.value = '执行轨迹加载失败，主结果不受影响' }
  finally { traceLoading.value = false }
}
</script>

<template>
  <main class="ask-page">
    <section class="hero"><span class="eyebrow">SMART OA · ASK</span><h1>智能问数</h1><p>用自然语言查询经营指标，结果与执行过程清晰可追溯。</p></section>
    <el-card class="ask-box">
      <div class="form-row"><el-input v-model="text" size="large" placeholder="例如：本分行存款余额是多少" @keyup.enter="execute" /><el-input v-model="org" class="org-input" placeholder="机构（可选）" /><el-button data-test="submit" size="large" type="primary" :loading="loading" :disabled="loading" @click="execute">查询</el-button></div>
      <p v-if="validation" class="validation">{{ validation }}</p>
      <div class="quick"><span>快捷问题</span><el-button v-for="item in examples" :key="item" round size="small" @click="fillSuggestion(item)">{{ item }}</el-button></div>
    </el-card>

    <section v-if="loading" class="state"><el-skeleton :rows="4" animated /><p>正在理解问题并执行查询…</p></section>
    <section v-else-if="requestError" class="state"><el-alert :title="requestError" type="error" :closable="false" show-icon /><el-button @click="execute">重试</el-button><div class="suggestions"><button v-for="item in emptySuggestions" :key="item" @click="fillSuggestion(item)">{{ item }}</button></div></section>
    <section v-else-if="response" class="result-area">
      <el-alert v-if="response.fallback" title="当前为本地演示数据" description="后端暂不可达，数据由浏览器内置同构 fallback 提供。" type="warning" :closable="false" show-icon />
      <IndicatorCard v-if="response.status === 'success'" :data="response.result" />
      <el-card v-else-if="response.status === 'candidate'" class="candidate"><h3>找到多个候选指标</h3><p>请选择更明确的指标重新提问（本演示不支持上下文续问）。</p><ul><li v-for="item in response.candidates" :key="item.code"><code>{{ item.code }}</code><strong>{{ item.name }}</strong><span>{{ item.unit }}</span></li></ul></el-card>
      <el-result v-else-if="response.status === 'unsupported'" icon="info" title="暂不支持这个问题" sub-title="可以尝试以下问法" />
      <el-result v-else-if="response.status === 'denied'" icon="warning" title="无权限查看" sub-title="当前演示用户没有访问该指标的权限；页面不会展示任何受保护指标值。" />
      <el-card v-else class="business-error"><el-alert :title="`业务错误 ${response.error.code ?? ''}`" :description="response.error.message || '执行失败'" type="error" :closable="false" show-icon /><el-button @click="execute">重试</el-button></el-card>
      <div v-if="['unsupported', 'error'].includes(response.status) && response.suggestions.length" class="suggestions"><span>建议问题（点击仅填入）</span><button v-for="item in response.suggestions" :key="item" @click="fillSuggestion(item)">{{ item }}</button></div>
      <el-button v-if="canTrace" class="trace-button" @click="openTrace">查看执行轨迹</el-button>
    </section>
    <section v-else class="empty state"><el-empty description="输入一个经营问题开始查询" /><div class="suggestions"><span>你可以试试</span><button v-for="item in emptySuggestions" :key="item" @click="fillSuggestion(item)">{{ item }}</button></div></section>
    <TraceDrawer v-model:open="traceOpen" :trace="trace" :loading="traceLoading" :error="traceError" />
  </main>
</template>

<style scoped>
.ask-page{max-width:1080px;margin:0 auto;padding:36px 24px 70px;color:#172033}.hero{padding:18px 0 24px}.hero h1{font-size:38px;margin:7px 0}.hero p{color:#64748b}.eyebrow{font-size:12px;color:#2563eb;font-weight:700;letter-spacing:1.5px}.ask-box,.state,.result-area{margin-top:18px}.form-row{display:flex;gap:10px}.form-row>:first-child{flex:1}.org-input{max-width:180px}.quick{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:15px;color:#64748b}.validation{color:#dc2626;margin:8px 0 0}.state{padding:26px;background:white;border-radius:10px;text-align:center}.result-area>*{margin-top:14px}.candidate ul{padding:0;list-style:none}.candidate li{display:grid;grid-template-columns:160px 1fr 100px;gap:12px;padding:12px;border-bottom:1px solid #eee}.suggestions{display:flex;gap:9px;align-items:center;flex-wrap:wrap;padding:14px}.suggestions button{border:1px solid #bfdbfe;background:#eff6ff;color:#1d4ed8;border-radius:18px;padding:7px 12px;cursor:pointer}.trace-button{margin-top:16px}.business-error button{margin-top:12px}@media(max-width:700px){.form-row{flex-direction:column}.org-input{max-width:none}.candidate li{grid-template-columns:1fr}.hero h1{font-size:30px}}
</style>
