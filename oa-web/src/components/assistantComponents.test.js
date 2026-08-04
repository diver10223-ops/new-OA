import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IndicatorCard from './IndicatorCard.vue';
import TraceDrawer from './TraceDrawer.vue';
const indicatorStubs = {
    ElCard: { template: '<div><slot /></div>' },
    ElAlert: { props: ['title', 'description'], template: '<div>{{ title }} {{ description }}</div>' },
};
function mountIndicator(data) {
    return mount(IndicatorCard, { props: { data }, global: { stubs: indicatorStubs } });
}
const traceStubs = {
    ElDrawer: { template: '<div><slot name="title"/><slot/></div>' },
    ElTimeline: { template: '<div><slot/></div>' },
    ElTimelineItem: { props: ['timestamp'], template: '<div>{{ timestamp }}<slot/></div>' },
    ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
    ElEmpty: { props: ['description'], template: '<div>{{ description }}</div>' },
};
function mountTrace(props) {
    return mount(TraceDrawer, {
        props: { open: true, ...props },
        global: { stubs: traceStubs },
    });
}
describe('IndicatorCard', () => {
    it('renders a query result', () => {
        const wrapper = mountIndicator({
            type: 'read_indicator', indicator: '存款余额', org: '分行', value: 10, unit: '万元',
        });
        expect(wrapper.text()).toContain('存款余额');
        expect(wrapper.text()).toContain('10 万元');
    });
    it('renders a comparison change rate exactly once', () => {
        const wrapper = mountIndicator({
            type: 'compare_indicator', indicator: '平均存款', org: '总部',
            current: 12, previous: 10, difference: 2, changeRate: 0.2,
        });
        expect(wrapper.text()).toContain('20.00%');
        expect(wrapper.text()).not.toContain('2000');
    });
    it('renders a nullable comparison change rate without hiding the result', () => {
        const wrapper = mountIndicator({
            indicator: '平均存款', org: '总部', current: 12, previous: 0,
            difference: 12, changeRate: null, changeRateNote: '上期为零，变化率未定义',
        });
        expect(wrapper.text()).toContain('本期12');
        expect(wrapper.text()).toContain('变化率暂无');
        expect(wrapper.text()).toContain('上期为零，变化率未定义');
    });
    it('preserves trend order and converts loan ratio only for display', () => {
        const data = {
            type: 'read_trend',
            indicator: '贷款占比',
            org: '分行',
            trend: [{ period: '五月', value: 0.5 }, { period: '六月', value: 0.55 }],
        };
        const wrapper = mountIndicator(data);
        expect(wrapper.text().indexOf('五月')).toBeLessThan(wrapper.text().indexOf('六月'));
        expect(wrapper.text()).toContain('55.00%');
        expect(data.trend[1].value).toBe(0.55);
    });
    it('shows a safe state for malformed data', () => {
        const wrapper = mountIndicator({ indicator: '缺失数值' });
        expect(wrapper.text()).toContain('结果数据不完整');
    });
});
describe('TraceDrawer', () => {
    it('renders all seven stages in original order with time and details', () => {
        const stages = [
            'INPUT_RECEIVED', 'INTENT_MATCHED', 'SLOTS_EXTRACTED', 'SCENARIO_SELECTED',
            'SKILL_EXECUTED', 'TEMPLATE_SELECTED', 'RESULT_CREATED',
        ].map((stage, index) => ({ stage, at: `2026-0${index + 1}`, details: { index } }));
        const wrapper = mountTrace({ trace: { id: '1', created: '', text: '', stages } });
        const content = wrapper.text();
        const labels = ['接收输入', '匹配意图', '提取槽位', '选择场景', '执行技能', '选择模板', '生成结果'];
        labels.forEach((label, index) => {
            expect(content).toContain(label);
            if (index > 0)
                expect(content.indexOf(labels[index - 1])).toBeLessThan(content.indexOf(label));
        });
        expect(content).toContain('2026-01');
        expect(content).toContain('"index": 0');
        expect(wrapper.get('details').attributes('open')).toBeUndefined();
    });
    it('uses the raw name for an unknown stage', () => {
        const trace = { id: '1', created: '', text: '', stages: [{ stage: 'FUTURE_STAGE', at: 'now', details: {} }] };
        expect(mountTrace({ trace }).text()).toContain('FUTURE_STAGE');
    });
    it('renders loading, error, and empty states', () => {
        expect(mountTrace({ trace: null, loading: true }).text()).toContain('轨迹加载中');
        expect(mountTrace({ trace: null, error: '轨迹失败' }).text()).toContain('轨迹失败');
        expect(mountTrace({ trace: null }).text()).toContain('暂无轨迹');
    });
});
