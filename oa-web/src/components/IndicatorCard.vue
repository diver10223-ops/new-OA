<script setup lang="ts">
import { computed } from 'vue'
import type { AssistantResult, IndicatorComparisonResult, IndicatorQueryResult, IndicatorTrendResult } from '../types/assistant'

const props = defineProps<{ data: AssistantResult }>()
const kind = computed(() => {
  if ('trend' in props.data) return 'trend'
  if ('current' in props.data) return 'compare'
  return 'query'
})
const isRatio = computed(() => 'indicator' in props.data && props.data.indicator === '贷款占比')
function display(value: number, unit?: string) { return isRatio.value ? `${(value * 100).toFixed(2)}%` : `${value}${unit ? ` ${unit}` : ''}` }
</script>

<template>
  <el-card class="indicator-card">
    <template v-if="kind === 'query'">
      <h3>{{ (data as IndicatorQueryResult).indicator }}</h3><p>机构：{{ (data as IndicatorQueryResult).org }}</p>
      <div class="metric">{{ display((data as IndicatorQueryResult).value, (data as IndicatorQueryResult).unit) }}</div>
    </template>
    <template v-else-if="kind === 'compare'">
      <h3>{{ (data as IndicatorComparisonResult).indicator }} · 对比</h3><p>机构：{{ (data as IndicatorComparisonResult).org }}</p>
      <div class="compare-grid"><span>本期<strong>{{ display((data as IndicatorComparisonResult).current, (data as IndicatorComparisonResult).unit) }}</strong></span><span>上期<strong>{{ display((data as IndicatorComparisonResult).previous, (data as IndicatorComparisonResult).unit) }}</strong></span><span>差额<strong>{{ display((data as IndicatorComparisonResult).difference, (data as IndicatorComparisonResult).unit) }}</strong></span><span>变化率<strong>{{ ((data as IndicatorComparisonResult).changeRate * 100).toFixed(2) }}%</strong></span></div>
      <p v-if="(data as IndicatorComparisonResult).changeRateNote">{{ (data as IndicatorComparisonResult).changeRateNote }}</p>
    </template>
    <template v-else>
      <h3>{{ (data as IndicatorTrendResult).indicator }} · 趋势</h3><p>机构：{{ (data as IndicatorTrendResult).org }}</p>
      <ol class="trend"><li v-for="point in (data as IndicatorTrendResult).trend" :key="point.period"><span>{{ point.period }}</span><strong>{{ display(point.value, (data as IndicatorTrendResult).unit) }}</strong></li></ol>
    </template>
  </el-card>
</template>
<style scoped>.metric{font-size:32px;color:#2563eb;font-weight:700}.compare-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.compare-grid span{display:flex;flex-direction:column;color:#64748b}.compare-grid strong{color:#172033;font-size:20px}.trend{padding:0;list-style:none}.trend li{display:flex;justify-content:space-between;padding:9px;border-bottom:1px solid #eee}</style>
