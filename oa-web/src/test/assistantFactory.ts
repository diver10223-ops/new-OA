import type { AssistantExecuteResponse, AssistantStatus } from '../types/assistant'

export function assistantResponse(
  status: AssistantStatus,
  overrides: Partial<AssistantExecuteResponse> = {},
): AssistantExecuteResponse {
  return {
    traceId: 'trace-1',
    intent: 'read_indicator',
    scenario: 'indicator_query',
    status,
    slots: {},
    matchedRules: [],
    template: 'indicator-card',
    result: {},
    candidates: [],
    suggestions: [],
    error: {},
    ...overrides,
  }
}
