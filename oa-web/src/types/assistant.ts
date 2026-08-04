export type AssistantStatus = 'success' | 'candidate' | 'unsupported' | 'denied' | 'error'

export interface AssistantExecuteRequest { text: string; org?: string }
export interface AssistantCandidate { code: string; name: string; unit: string }
export interface IndicatorQueryResult { type?: 'read_indicator'; indicator: string; org: string; value: number; unit?: string }
export interface IndicatorComparisonResult { type?: 'compare_indicator'; indicator: string; org: string; current: number; previous: number; difference: number; changeRate: number; changeRateNote?: string; unit?: string }
export interface TrendPoint { period: string; value: number }
export interface IndicatorTrendResult { type?: 'read_trend'; indicator: string; org: string; trend: TrendPoint[]; unit?: string }
export type AssistantResult = IndicatorQueryResult | IndicatorComparisonResult | IndicatorTrendResult | Record<string, unknown>
export interface AssistantError { code: string | number; message: string }
export interface AssistantExecuteResponse {
  traceId: string; intent: string; scenario: string; status: AssistantStatus
  slots: Record<string, string>; matchedRules: string[]; template: string
  result: AssistantResult; candidates: AssistantCandidate[]; suggestions: string[]
  error: AssistantError | Record<string, never>
  /** Client-only marker; never sent to the server. */
  fallback?: boolean
}
export interface ExecutionTraceEvent { stage: string; at: string; details: Record<string, unknown> }
export interface ExecutionTrace {
  id: string; created: string; text: string; stages: ExecutionTraceEvent[]
  plan?: Record<string, unknown>; response?: AssistantExecuteResponse
}
