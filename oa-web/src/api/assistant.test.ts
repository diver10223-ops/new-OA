import axios, { AxiosHeaders, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { executeAssistant, getAssistantTrace } from './assistant'
import { http } from './http'
import { assistantResponse } from '../test/assistantFactory'

vi.mock('./http', () => ({ http: { post: vi.fn(), get: vi.fn() } }))

const post = vi.mocked(http.post)
const get = vi.mocked(http.get)

describe('assistant API', () => {
  beforeEach(() => {
    post.mockReset()
    get.mockReset()
  })

  it('sends only text and optional org with the demo user header', async () => {
    post.mockResolvedValue(assistantResponse('success'))

    await executeAssistant({ text: '存款余额', org: '本分行' })

    expect(post).toHaveBeenCalledWith(
      '/assistant/execute',
      { text: '存款余额', org: '本分行' },
      { headers: { 'X-User-Id': 'demo_branch_manager' } },
    )
  })

  it('uses the complete local fallback for a response-less network error', async () => {
    post.mockRejectedValue(new axios.AxiosError('offline'))

    const result = await executeAssistant({ text: '贷款占比近三个月趋势' })

    expect(result).toMatchObject({ status: 'success', intent: 'read_trend', fallback: true })
    expect(result.traceId).toMatch(/^local-/)
    expect(result).toEqual(expect.objectContaining({
      slots: expect.any(Object),
      matchedRules: expect.any(Array),
      candidates: expect.any(Array),
      suggestions: expect.any(Array),
      error: expect.any(Object),
    }))
  })

  it.each([403, 500])('does not fallback for HTTP %s', async (status) => {
    const response: AxiosResponse = {
      data: {}, status, statusText: 'failure', headers: {}, config: { headers: new AxiosHeaders() },
    }
    const error = new axios.AxiosError('HTTP failure', undefined, undefined, undefined, response)
    post.mockRejectedValue(error)

    await expect(executeAssistant({ text: '问题' })).rejects.toBe(error)
  })

  it('does not fallback for normal denied, unsupported, or error responses', async () => {
    for (const status of ['denied', 'unsupported', 'error'] as const) {
      post.mockResolvedValueOnce(assistantResponse(status))
      await expect(executeAssistant({ text: status })).resolves.toMatchObject({ status, fallback: undefined })
    }
  })

  it('loads remote traces through the typed HTTP client', async () => {
    const trace = { id: 'a/b', created: '2026', text: '问题', stages: [] }
    get.mockResolvedValue(trace)

    await expect(getAssistantTrace('a/b')).resolves.toEqual(trace)
    expect(get).toHaveBeenCalledWith('/assistant/trace/a%2Fb')
  })
})
