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
