<script setup lang="ts">
import { computed } from 'vue'
import type {
  AssistantResult,
  IndicatorComparisonResult,
  IndicatorQueryResult,
  IndicatorTrendResult,
} from '../types/assistant'

const props = defineProps<{ data: AssistantResult }>()

type IndicatorView =
  | { kind: 'query'; data: IndicatorQueryResult }
  | { kind: 'compare'; data: IndicatorComparisonResult }
  | { kind: 'trend'; data: IndicatorTrendResult }
  | { kind: 'invalid' }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
const hasText = (value: unknown): value is string => typeof value === 'string' && value.length > 0
const hasNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

function isQuery(value: unknown): value is IndicatorQueryResult {
  return isRecord(value) && (value.type === undefined || value.type === 'read_indicator')
    && hasText(value.indicator) && hasText(value.org) && hasNumber(value.value)
}

function isComparison(value: unknown): value is IndicatorComparisonResult {
  return isRecord(value) && (value.type === undefined || value.type === 'compare_indicator')
    && hasText(value.indicator) && hasText(value.org) && hasNumber(value.current) && hasNumber(value.previous)
    && hasNumber(value.difference) && (value.changeRate === null || hasNumber(value.changeRate))
}

function isTrend(value: unknown): value is IndicatorTrendResult {
  return isRecord(value) && (value.type === undefined || value.type === 'read_trend')
    && hasText(value.indicator) && hasText(value.org) && Array.isArray(value.trend)
    && value.trend.every((point) => isRecord(point) && hasText(point.period) && hasNumber(point.value))
}

const view = computed<IndicatorView>(() => {
  if (isQuery(props.data)) return { kind: 'query', data: props.data }
  if (isComparison(props.data)) return { kind: 'compare', data: props.data }
  if (isTrend(props.data)) return { kind: 'trend', data: props.data }
  return { kind: 'invalid' }
})

function displayValue(indicator: string, value: number, unit?: string): string {
  if (indicator === '贷款占比') return `${(value * 100).toFixed(2)}%`
  return `${value}${unit ? ` ${unit}` : ''}`
}

function displayChangeRate(value: number | null): string {
  return value === null ? '暂无' : `${(value * 100).toFixed(2)}%`
}
</script>

<template>
  <el-card class="indicator-card">
    <template v-if="view.kind === 'query'">
      <h3>{{ view.data.indicator }}</h3>
      <p>机构：{{ view.data.org }}</p>
      <div class="metric">{{ displayValue(view.data.indicator, view.data.value, view.data.unit) }}</div>
    </template>
    <template v-else-if="view.kind === 'compare'">
      <h3>{{ view.data.indicator }} · 对比</h3>
      <p>机构：{{ view.data.org }}</p>
      <div class="compare-grid">
        <span>本期<strong>{{ displayValue(view.data.indicator, view.data.current, view.data.unit) }}</strong></span>
        <span>上期<strong>{{ displayValue(view.data.indicator, view.data.previous, view.data.unit) }}</strong></span>
        <span>差额<strong>{{ displayValue(view.data.indicator, view.data.difference, view.data.unit) }}</strong></span>
        <span>变化率<strong>{{ displayChangeRate(view.data.changeRate) }}</strong></span>
      </div>
      <p v-if="view.data.changeRateNote">{{ view.data.changeRateNote }}</p>
    </template>
    <template v-else-if="view.kind === 'trend'">
      <h3>{{ view.data.indicator }} · 趋势</h3>
      <p>机构：{{ view.data.org }}</p>
      <ol class="trend">
        <li v-for="point in view.data.trend" :key="point.period">
          <span>{{ point.period }}</span>
          <strong>{{ displayValue(view.data.indicator, point.value, view.data.unit) }}</strong>
        </li>
      </ol>
    </template>
    <el-alert v-else title="结果数据不完整" description="暂时无法展示该指标，请重新查询。" type="warning" :closable="false" />
  </el-card>
</template>

<style scoped>
.metric{font-size:32px;color:#2563eb;font-weight:700}.compare-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.compare-grid span{display:flex;flex-direction:column;color:#64748b}.compare-grid strong{color:#172033;font-size:20px}.trend{padding:0;list-style:none}.trend li{display:flex;justify-content:space-between;padding:9px;border-bottom:1px solid #eee}
</style>
