const traces = new Map();
const suggestions = ['本分行存款余额是多少', '总部平均存款比上期增加多少', '贷款占比近三个月趋势'];
function makeResponse(request) {
    const traceId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const common = { traceId, slots: { org: request.org || '本分行' }, matchedRules: ['local-demo-rule'], template: 'indicator-card', candidates: [], suggestions: [], error: {}, fallback: true };
    let response;
    if (request.text.includes('存款余额和平均存款')) {
        response = { ...common, intent: 'read_indicator', scenario: 'indicator_candidate', status: 'candidate', result: {}, candidates: [
                { code: 'deposit_balance', name: '存款余额', unit: '万元' }, { code: 'average_deposit', name: '平均存款', unit: '万元' },
            ] };
    }
    else if (request.text.includes('平均存款') && (request.text.includes('上期') || request.text.includes('增加'))) {
        response = { ...common, intent: 'compare_indicator', scenario: 'compare_indicator', status: 'success', result: { type: 'compare_indicator', indicator: '平均存款', org: request.org || '总部', current: 1280, previous: 1200, difference: 80, changeRate: 0.0667, changeRateNote: '较上期增长' } };
    }
    else if (request.text.includes('贷款占比') && request.text.includes('趋势')) {
        response = { ...common, intent: 'read_trend', scenario: 'indicator_trend', status: 'success', result: { type: 'read_trend', indicator: '贷款占比', org: request.org || '本分行', unit: '%', trend: [{ period: '2026-05', value: 0.51 }, { period: '2026-06', value: 0.53 }, { period: '2026-07', value: 0.55 }] } };
    }
    else if (request.text.includes('存款余额')) {
        response = { ...common, intent: 'read_indicator', scenario: 'indicator_query', status: 'success', result: { type: 'read_indicator', indicator: '存款余额', org: request.org || '本分行', value: 3560, unit: '万元' } };
    }
    else {
        response = { ...common, intent: 'unsupported', scenario: 'unsupported', status: 'unsupported', template: 'unsupported', result: {}, suggestions };
    }
    createTrace(request.text, response);
    return response;
}
function createTrace(text, response) {
    const events = [
        ['INPUT_RECEIVED', { text }],
        ['INTENT_MATCHED', { intent: response.intent, matchedRules: response.matchedRules }],
        ['SLOTS_EXTRACTED', { slots: response.slots }],
        ['SCENARIO_SELECTED', { scenario: response.scenario }],
        ['SKILL_EXECUTED', { skills: ['local-demo-dataset'] }],
        ['TEMPLATE_SELECTED', { template: response.template }],
        ['RESULT_CREATED', { status: response.status }],
    ];
    const stages = events.map(([stage, details], index) => ({
        stage,
        at: new Date(Date.now() + index).toISOString(),
        details,
    }));
    traces.set(response.traceId, { id: response.traceId, created: new Date().toISOString(), text, stages, response });
}
export function executeAssistantFallback(request) { return Promise.resolve(makeResponse(request)); }
export function getAssistantTraceFallback(traceId) { return Promise.resolve(traces.get(traceId) ?? null); }
