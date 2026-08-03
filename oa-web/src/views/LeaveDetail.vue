<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { approvalApi, leaveApi } from '../api/leave'
import { statusLabel } from '../utils/status'

interface LeaveDetail {
  applicant_name: string
  department_name: string
  leave_type: string
  business_status: string
  start_time: string
  end_time: string
  duration: number
  reason: string
  approval_instance_id?: number
}

interface TimelineItem {
  id: number
  nodeName: string
  status: string
  comment?: string
  createdAt: string
  handledAt?: string
}

interface ApprovalDetail {
  status: string
  timeline: TimelineItem[]
}

interface DataResponse<T> { data: T }

const route = useRoute()
const data = ref<LeaveDetail>()
const approval = ref<ApprovalDetail>()

onMounted(async () => {
  if (route.path.startsWith('/approval/')) {
    const response = await approvalApi.detail(Number(route.params.id)) as unknown as DataResponse<ApprovalDetail>
    approval.value = response.data
    return
  }

  const leaveResponse = await leaveApi.detail(Number(route.params.id)) as unknown as DataResponse<LeaveDetail>
  data.value = leaveResponse.data
  if (data.value.approval_instance_id) {
    const approvalResponse = await approvalApi.detail(data.value.approval_instance_id) as unknown as DataResponse<ApprovalDetail>
    approval.value = approvalResponse.data
  }
})
</script>

<template>
  <div class="page-title">
    <h1>申请与审批详情</h1>
    <p>业务信息及完整审批时间线</p>
  </div>
  <el-card v-if="data">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="申请人">{{ data.applicant_name }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ data.department_name }}</el-descriptions-item>
      <el-descriptions-item label="类型">{{ data.leave_type }}</el-descriptions-item>
      <el-descriptions-item label="业务状态">{{ statusLabel(data.business_status) }}</el-descriptions-item>
      <el-descriptions-item label="请假时间">{{ data.start_time }} 至 {{ data.end_time }}</el-descriptions-item>
      <el-descriptions-item label="时长">{{ data.duration }} 小时</el-descriptions-item>
      <el-descriptions-item label="原因" :span="2">{{ data.reason }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
  <el-card v-if="approval" style="margin-top: 18px">
    <template #header>审批状态：{{ approval.status }}</template>
    <el-timeline>
      <el-timeline-item
        v-for="item in approval.timeline"
        :key="item.id"
        :timestamp="item.handledAt || item.createdAt"
      >
        <b>{{ item.nodeName }} · {{ item.status }}</b>
        <p v-if="item.comment">审批意见：{{ item.comment }}</p>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>
