import axios from 'axios';
import { http } from './http';
import { executeAssistantFallback, getAssistantTraceFallback } from './assistantFallback';
export const DEMO_USER_ID = 'demo_branch_manager';
function isNetworkFailure(error) {
    return axios.isAxiosError(error) && !error.response;
}
export async function executeAssistant(request) {
    try {
        return await http.post('/assistant/execute', request, { headers: { 'X-User-Id': DEMO_USER_ID } });
    }
    catch (error) {
        if (!isNetworkFailure(error))
            throw error;
        return executeAssistantFallback(request);
    }
}
export async function getAssistantTrace(traceId) {
    if (traceId.startsWith('local-')) {
        const trace = await getAssistantTraceFallback(traceId);
        if (!trace)
            throw new Error('本地轨迹不存在');
        return trace;
    }
    return await http.get(`/assistant/trace/${encodeURIComponent(traceId)}`);
}
