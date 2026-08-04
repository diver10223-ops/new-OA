import axios from 'axios'
import { http } from './http'
import { executeAssistantFallback, getAssistantTraceFallback } from './assistantFallback'
import type { AssistantExecuteRequest, AssistantExecuteResponse, ExecutionTrace } from '../types/assistant'

export const DEMO_USER_ID = 'demo_branch_manager'

function isNetworkFailure(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response
}

export async function executeAssistant(request: AssistantExecuteRequest): Promise<AssistantExecuteResponse> {
  try {
    return await http.post<AssistantExecuteResponse, AssistantExecuteResponse, AssistantExecuteRequest>(
      '/assistant/execute',
      request,
      { headers: { 'X-User-Id': DEMO_USER_ID } },
    )
  } catch (error) {
    if (!isNetworkFailure(error)) throw error
    return executeAssistantFallback(request)
  }
}

export async function getAssistantTrace(traceId: string): Promise<ExecutionTrace> {
  if (traceId.startsWith('local-')) {
    const trace = await getAssistantTraceFallback(traceId)
    if (!trace) throw new Error('本地轨迹不存在')
    return trace
  }
  return await http.get<ExecutionTrace, ExecutionTrace>(
    `/assistant/trace/${encodeURIComponent(traceId)}`,
  )
}
