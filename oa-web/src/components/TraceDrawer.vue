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
