<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { leaveApi, approvalApi } from '../api/leave';
import { statusLabel } from '../utils/status';

const route = useRoute();
const data = ref<any>();
const approval = ref<any>();

onMounted(async () => {
  if (route.path.startsWith('/approval/')) {
    approval.value = ((await approvalApi.detail(Number(route.params.id))) as any).data;
  } else {
    data.value = ((await leaveApi.detail(Number(route.params.id))) as any).data;
    if (data.value?.approvalInstanceId) {
      approval.value = ((await approvalApi.detail(data.value.approvalInstanceId)) as any).data;
    }
  }
});
</script>

<template>
  <div class="page-title">
    <h1>申请与审批详情</h1>
    <p>业务信息及完整审批时间线</p>
  </div>

  <el-card v-if="data">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="申请人">{{ data.applicantName }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ data.departmentName }}</el-descriptions-item>
      <el-descriptions-item label="类型">{{ data.leaveType }}</el-descriptions-item>
      <el-descriptions-item label="业务状态">{{ statusLabel(data.businessStatus) }}</el-descriptions-item>
      <el-descriptions-item label="请假时间">{{ data.startTime }} 至 {{ data.endTime }}</el-descriptions-item>
      <el-descriptions-item label="时长">{{ data.duration }} 小时</el-descriptions-item>
      <el-descriptions-item label="原因" :span="2">{{ data.reason }}</el-descriptions-item>
    </el-descriptions>
  </el-card>

  <el-card v-if="approval" style="margin-top: 18px">
    <template #header>审批状态：{{ statusLabel(approval.status) }}</template>
    <el-timeline>
      <el-timeline-item
        v-for="item in approval.timeline"
        :key="item.id"
        :timestamp="item.handledAt || item.createdAt"
      >
        <b>{{ item.nodeName }} · {{ statusLabel(item.status) }}</b>
        <p v-if="item.comment">审批意见：{{ item.comment }}</p>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>