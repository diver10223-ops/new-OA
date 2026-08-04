export function assistantResponse(status, overrides = {}) {
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
    };
}
