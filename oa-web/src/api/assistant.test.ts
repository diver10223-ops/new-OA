import { beforeEach, describe, expect, it, vi } from 'vitest'
import { executeAssistant } from './assistant'
import { http } from './http'
vi.mock('./http', () => ({ http: { post: vi.fn(), get: vi.fn() } }))
const post = vi.mocked(http.post)
describe('assistant API', () => {
  beforeEach(() => post.mockReset())
  it('sends only frozen fields and maps success', async () => { post.mockResolvedValue({ traceId: 't', status: 'success', result: { value: 1 } }); const result = await executeAssistant({ text: '存款余额', org: '本分行' }); expect(post.mock.calls[0][1]).toEqual({ text: '存款余额', org: '本分行' }); expect(post.mock.calls[0][1]).not.toHaveProperty('mode'); expect(result.status).toBe('success') })
  it('uses contract-shaped fallback on network failure', async () => { post.mockRejectedValue({ isAxiosError: true, request: {} }); const result = await executeAssistant({ text: '贷款占比近三个月趋势' }); expect(result).toMatchObject({ status: 'success', intent: 'read_trend', fallback: true }); expect(result.traceId).toMatch(/^local-/); expect('slots' in result && 'candidates' in result && 'error' in result).toBe(true) })
  it('does not fallback for HTTP errors', async () => { const error = { isAxiosError: true, response: { status: 500 } }; post.mockRejectedValue(error); await expect(executeAssistant({ text: '问题' })).rejects.toBe(error) })
})
