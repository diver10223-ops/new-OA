<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <p>业务模块入口已预留，将在后续迭代中实现。</p>
  </div>

  <el-card>
    <el-empty description="功能建设中">
      <el-button type="primary" disabled>新建申请</el-button>
    </el-empty>
  </el-card>
</template>