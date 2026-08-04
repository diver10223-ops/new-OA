import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AskAnalytics from './AskAnalytics.vue'
import IndicatorCard from '../components/IndicatorCard.vue'
import { executeAssistant, getAssistantTrace } from '../api/assistant'
import { assistantResponse } from '../test/assistantFactory'
import type { AssistantExecuteResponse } from '../types/assistant'

vi.mock('../api/assistant', () => ({ executeAssistant: vi.fn(), getAssistantTrace: vi.fn() }))

const executeApi = vi.mocked(executeAssistant)
const traceApi = vi.mocked(getAssistantTrace)
const pendingResponse = new Promise<AssistantExecuteResponse>(() => {})
const stubs = {
  ElInput: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: `<input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`,
  },
  ElButton: {
    props: ['disabled'],
    emits: ['click'],
    template: `<button :disabled="disabled" @click="$emit('click')"><slot /></button>`,
  },
  ElAlert: { props: ['title', 'description'], template: '<div>{{ title }} {{ description }}</div>' },
  ElResult: { props: ['title', 'subTitle'], template: '<div>{{ title }} {{ subTitle }}</div>' },
  ElCard: { template: '<div><slot /></div>' },
  ElEmpty: { props: ['description'], template: '<div>{{ description }}<slot /></div>' },
  ElSkeleton: true,
  TraceDrawer: { props: ['open', 'trace', 'loading', 'error'], template: '<div data-test="drawer">{{ error }}</div>' },
}

function render() {
  return mount(AskAnalytics, {
    global: { stubs: { ...stubs, IndicatorCard } },
  })
}

async function submit(wrapper: ReturnType<typeof render>, question = '问题') {
  await wrapper.find('input').setValue(question)
  await wrapper.get('[data-test="submit"]').trigger('click')
}

describe('AskAnalytics', () => {
  beforeEach(() => {
    executeApi.mockReset()
    traceApi.mockReset()
  })

  it('does not request for empty input', async () => {
    const wrapper = render()
    await wrapper.get('[data-test="submit"]').trigger('click')
    expect(executeApi).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('请输入问题')
  })

  it('disables submission and prevents rapid duplicate requests', async () => {
    executeApi.mockReturnValue(pendingResponse)
    const wrapper = render()
    await submit(wrapper, '存款余额')
    expect(wrapper.get('[data-test="submit"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[data-test="submit"]').trigger('click')
    expect(executeApi).toHaveBeenCalledTimes(1)
  })

  it('fills a suggestion without submitting it', async () => {
    const wrapper = render()
    const suggestion = wrapper.findAll('.suggestions button')[0]
    await suggestion.trigger('click')
    expect(wrapper.find('input').element.value).toBe('本分行存款余额是多少')
    expect(executeApi).not.toHaveBeenCalled()
  })

  it('renders a successful query using the real IndicatorCard', async () => {
    executeApi.mockResolvedValue(assistantResponse('success', {
      result: { type: 'read_indicator', indicator: '存款余额', org: '本分行', value: 3560, unit: '万元' },
    }))
    const wrapper = render()
    await submit(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('3560 万元'))
    expect(traceApi).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('查看执行轨迹')
  })

  it.each([
    {
      result: { type: 'compare_indicator' as const, indicator: '平均存款', org: '总部', current: 80, previous: 79, difference: 1, changeRate: 0.012658 },
      expected: ['平均存款 · 对比', '1.27%'],
    },
    {
      result: { type: 'read_trend' as const, indicator: '贷款占比', org: '本分行', trend: [{ period: '四月', value: 0.5 }, { period: '六月', value: 0.55 }] },
      expected: ['四月', '六月', '55.00%'],
    },
  ])('renders comparison and trend result variants', async ({ result, expected }) => {
    executeApi.mockResolvedValue(assistantResponse('success', { result }))
    const wrapper = render()
    await submit(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain(expected[0]))
    expected.forEach((text) => expect(wrapper.text()).toContain(text))
  })

  it('clears the previous result and trace state when a new request starts', async () => {
    executeApi.mockResolvedValueOnce(assistantResponse('success', {
      result: { indicator: '旧指标', org: '本分行', value: 123 },
    }))
    traceApi.mockRejectedValueOnce(new Error('trace unavailable'))
    const wrapper = render()
    await submit(wrapper, '旧问题')
    await vi.waitFor(() => expect(wrapper.text()).toContain('123'))
    await wrapper.get('.trace-button').trigger('click')
    await vi.waitFor(() => expect(wrapper.text()).toContain('执行轨迹加载失败'))

    executeApi.mockReturnValueOnce(pendingResponse)
    await submit(wrapper, '新问题')
    expect(wrapper.text()).not.toContain('123')
    expect(wrapper.text()).not.toContain('执行轨迹加载失败')
  })

  it('renders candidate and unsupported statuses independently', async () => {
    executeApi.mockResolvedValueOnce(assistantResponse('candidate', {
      candidates: [{ code: 'D01', name: '存款余额', unit: '万元' }],
    }))
    const candidate = render()
    await submit(candidate)
    await vi.waitFor(() => expect(candidate.text()).toContain('D01'))

    executeApi.mockResolvedValueOnce(assistantResponse('unsupported', { suggestions: ['换个问法'] }))
    const unsupported = render()
    await submit(unsupported)
    await vi.waitFor(() => expect(unsupported.text()).toContain('暂不支持'))
    expect(unsupported.text()).toContain('换个问法')
  })

  it('never exposes result fields for denied status', async () => {
    executeApi.mockResolvedValue(assistantResponse('denied', {
      result: { value: 999, current: 888, previous: 777, difference: 111, trend: [666] },
    }))
    const wrapper = render()
    await submit(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('无权限查看'))
    expect(wrapper.text()).not.toMatch(/999|888|777|111|666/)
  })

  it('renders an error response without fallback', async () => {
    executeApi.mockResolvedValue(assistantResponse('error', {
      error: { code: 'E42', message: '业务失败' },
    }))
    const wrapper = render()
    await submit(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('E42'))
    expect(wrapper.text()).toContain('业务失败')
    expect(wrapper.text()).not.toContain('本地演示数据')
  })

  it('shows fallback as a non-blocking warning', async () => {
    executeApi.mockResolvedValue(assistantResponse('success', {
      fallback: true,
      result: { type: 'read_indicator', indicator: '存款余额', org: '本分行', value: 3560 },
    }))
    const wrapper = render()
    await submit(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('当前为本地演示数据'))
    expect(wrapper.text()).toContain('3560')
  })

  it('loads the trace only after the user asks for it', async () => {
    executeApi.mockResolvedValue(assistantResponse('success'))
    traceApi.mockResolvedValue({ id: 'trace-1', created: '2026', text: '问题', stages: [] })
    const wrapper = render()
    await submit(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('查看执行轨迹'))
    expect(traceApi).not.toHaveBeenCalled()
    await wrapper.get('.trace-button').trigger('click')
    expect(traceApi).toHaveBeenCalledWith('trace-1')
  })

  it('keeps the main result if loading its trace fails', async () => {
    executeApi.mockResolvedValue(assistantResponse('success', {
      result: { type: 'read_indicator', indicator: '存款余额', org: '本分行', value: 3560 },
    }))
    traceApi.mockRejectedValue(new Error('trace unavailable'))
    const wrapper = render()
    await submit(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('3560'))
    await wrapper.get('.trace-button').trigger('click')
    await vi.waitFor(() => expect(wrapper.text()).toContain('执行轨迹加载失败'))
    expect(wrapper.text()).toContain('3560')
  })
})
