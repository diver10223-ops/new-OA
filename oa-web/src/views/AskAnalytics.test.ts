import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AskAnalytics from './AskAnalytics.vue'
import { executeAssistant } from '../api/assistant'
vi.mock('../api/assistant', () => ({ executeAssistant: vi.fn(), getAssistantTrace: vi.fn() }))
const execute = vi.mocked(executeAssistant)
const base = { traceId: 't', intent: 'x', scenario: 'x', slots: {}, matchedRules: [], template: '', result: {}, candidates: [], suggestions: [], error: {} }
const stubs = { ElInput: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' }, ElButton: { template: '<button @click="$emit(\'click\')"><slot/></button>' }, IndicatorCard: { props: ['data'], template: '<div>RESULT {{ data }}</div>' }, TraceDrawer: true }
const render = () => mount(AskAnalytics, { global: { stubs } })
describe('AskAnalytics', () => {
  beforeEach(() => execute.mockReset())
  it('validates empty input', async () => { const wrapper = render(); await wrapper.get('[data-test="submit"]').trigger('click'); expect(execute).not.toHaveBeenCalled(); expect(wrapper.text()).toContain('请输入问题') })
  it('prevents duplicate submission', async () => { execute.mockReturnValue(new Promise(() => {}) as never); const wrapper = render(); await wrapper.find('input').setValue('存款余额'); await wrapper.get('[data-test="submit"]').trigger('click'); await wrapper.get('[data-test="submit"]').trigger('click'); expect(execute).toHaveBeenCalledTimes(1) })
  it.each([['candidate', { candidates: [{ code: 'D01', name: '存款余额', unit: '万元' }] }, ['D01','存款余额','万元']], ['unsupported', { suggestions: ['换个问法'] }, ['暂不支持','换个问法']], ['denied', { result: { value: 999 } }, ['无权限查看']], ['error', { error: { code: 'E42', message: '业务失败' } }, ['E42','业务失败']]])('renders %s safely', async (status, extra, expected) => { execute.mockResolvedValue({ ...base, status, ...extra } as never); const wrapper = render(); await wrapper.find('input').setValue('问题'); await wrapper.get('[data-test="submit"]').trigger('click'); await vi.waitFor(() => expect(wrapper.text()).toContain(expected[0])); expected.forEach(x => expect(wrapper.text()).toContain(x)); if (status === 'denied') expect(wrapper.text()).not.toContain('999') })
})
