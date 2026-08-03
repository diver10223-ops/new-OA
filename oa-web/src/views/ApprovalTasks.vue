<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { approvalApi } from '../api/leave'

interface ApprovalTask {
  id: number
  instanceId: number
  businessType: string
  applicantName: string
  nodeName: string
  status: string
  createdAt: string
  handledAt?: string
}

interface PageResponse<T> {
  data: { items: T[] }
}

const props = defineProps<{ completed?: boolean }>()
const rows = ref<ApprovalTask[]>([])
const loading = ref(false)
const acting = ref<number | null>(null)
const router = useRouter()

async function load() {
  loading.value = true
  try {
    const response = await approvalApi.tasks(Boolean(props.completed)) as unknown as PageResponse<ApprovalTask>
    rows.value = response.data.items
  } finally {
    loading.value = false
  }
}

async function decide(row: ApprovalTask, approve: boolean) {
  const { value } = await ElMessageBox.prompt(
    approve ? '请输入审批意见（可选）' : '请输入拒绝原因',
    '审批处理',
    { inputValidator: (input) => approve || Boolean(input) || '拒绝时必须填写意见' },
  )
  acting.value = row.id
  try {
    await approvalApi.decide(row.id, approve, value || '')
    ElMessage.success('审批已处理')
    await load()
  } finally {
    acting.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="page-title">
    <h1>{{ props.completed ? '我的已办' : '我的待办' }}</h1>
    <p>{{ props.completed ? '查看历史审批处理记录' : '处理分配给我的审批任务' }}</p>
  </div>
  <el-card>
    <el-table :data="rows" v-loading="loading" empty-text="暂无记录">
      <el-table-column prop="businessType" label="申请类型" />
      <el-table-column prop="applicantName" label="申请人" />
      <el-table-column prop="nodeName" label="当前节点" />
      <el-table-column
        :prop="props.completed ? 'handledAt' : 'createdAt'"
        :label="props.completed ? '处理时间' : '提交时间'"
      />
      <el-table-column v-if="props.completed" prop="status" label="结果" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link @click="router.push(`/approval/${scope.row.instanceId}`)">查看详情</el-button>
          <template v-if="!props.completed">
            <el-button type="success" link :loading="acting === scope.row.id" :disabled="acting !== null" @click="decide(scope.row, true)">同意</el-button>
            <el-button type="danger" link :loading="acting === scope.row.id" :disabled="acting !== null" @click="decide(scope.row, false)">拒绝</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
