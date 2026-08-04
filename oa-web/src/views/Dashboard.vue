<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'

const stats = ref({
  pending: 6,
  completed: 14,
  applications: 3,
  messages: 2,
})
const user = useUserStore()
const cards = [
  ['pending', '待办事项', '待您处理的审批', '#3b82f6'],
  ['completed', '已办事项', '本月已处理', '#16a34a'],
  ['applications', '我的申请', '进行中的申请', '#8b5cf6'],
  ['messages', '未读消息', '需要关注的通知', '#f59e0b'],
] as const
</script>

<template>
  <div>
    <div class="welcome">
      <div>
        <h1>{{ user.user?.displayName || '您好' }}，欢迎回来</h1>
        <p>今天也要高效工作，以下是您的工作概览。</p>
      </div>
      <span>{{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}</span>
    </div>

    <div class="metrics">
      <el-card v-for="c in cards" :key="c[0]" shadow="hover">
        <div class="metric-line" :style="{ background: c[3] }"></div>
        <p>{{ c[1] }}</p>
        <strong>{{ stats[c[0]] }}</strong>
        <small>{{ c[2] }}</small>
      </el-card>
    </div>

    <div class="dashboard-grid">
      <el-card>
        <template #header><b>快捷入口</b></template>
        <div class="quick">
          <router-link to="/leave">请假申请</router-link>
          <router-link to="/project">立项申请</router-link>
          <router-link to="/approval/pending">审批待办</router-link>
          <router-link to="/applications">我的申请</router-link>
        </div>
      </el-card>

      <el-card>
        <template #header><b>系统公告</b></template>
        <el-empty description="暂无最新公告" :image-size="80" />
      </el-card>
    </div>
  </div>
</template>
