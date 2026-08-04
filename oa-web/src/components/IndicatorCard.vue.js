import { computed } from 'vue';
const props = defineProps();
const isRecord = (value) => typeof value === 'object' && value !== null;
const hasText = (value) => typeof value === 'string' && value.length > 0;
const hasNumber = (value) => typeof value === 'number' && Number.isFinite(value);
function isQuery(value) {
    return isRecord(value) && (value.type === undefined || value.type === 'read_indicator')
        && hasText(value.indicator) && hasText(value.org) && hasNumber(value.value);
}
function isComparison(value) {
    return isRecord(value) && (value.type === undefined || value.type === 'compare_indicator')
        && hasText(value.indicator) && hasText(value.org) && hasNumber(value.current) && hasNumber(value.previous)
        && hasNumber(value.difference) && (value.changeRate === null || hasNumber(value.changeRate));
}
function isTrend(value) {
    return isRecord(value) && (value.type === undefined || value.type === 'read_trend')
        && hasText(value.indicator) && hasText(value.org) && Array.isArray(value.trend)
        && value.trend.every((point) => isRecord(point) && hasText(point.period) && hasNumber(point.value));
}
const view = computed(() => {
    if (isQuery(props.data))
        return { kind: 'query', data: props.data };
    if (isComparison(props.data))
        return { kind: 'compare', data: props.data };
    if (isTrend(props.data))
        return { kind: 'trend', data: props.data };
    return { kind: 'invalid' };
});
function displayValue(indicator, value, unit) {
    if (indicator === '贷款占比')
        return `${(value * 100).toFixed(2)}%`;
    return `${value}${unit ? ` ${unit}` : ''}`;
}
function displayChangeRate(value) {
    return value === null ? '暂无' : `${(value * 100).toFixed(2)}%`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['compare-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['trend']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "indicator-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "indicator-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
if (__VLS_ctx.view.kind === 'query') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.view.data.indicator);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.view.data.org);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric" },
    });
    (__VLS_ctx.displayValue(__VLS_ctx.view.data.indicator, __VLS_ctx.view.data.value, __VLS_ctx.view.data.unit));
}
else if (__VLS_ctx.view.kind === 'compare') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.view.data.indicator);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.view.data.org);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.displayValue(__VLS_ctx.view.data.indicator, __VLS_ctx.view.data.current, __VLS_ctx.view.data.unit));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.displayValue(__VLS_ctx.view.data.indicator, __VLS_ctx.view.data.previous, __VLS_ctx.view.data.unit));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.displayValue(__VLS_ctx.view.data.indicator, __VLS_ctx.view.data.difference, __VLS_ctx.view.data.unit));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.displayChangeRate(__VLS_ctx.view.data.changeRate));
    if (__VLS_ctx.view.data.changeRateNote) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.view.data.changeRateNote);
    }
}
else if (__VLS_ctx.view.kind === 'trend') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.view.data.indicator);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.view.data.org);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ol, __VLS_intrinsicElements.ol)({
        ...{ class: "trend" },
    });
    for (const [point] of __VLS_getVForSourceType((__VLS_ctx.view.data.trend))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (point.period),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (point.period);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.displayValue(__VLS_ctx.view.data.indicator, point.value, __VLS_ctx.view.data.unit));
    }
}
else {
    const __VLS_5 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        title: "结果数据不完整",
        description: "暂时无法展示该指标，请重新查询。",
        type: "warning",
        closable: (false),
    }));
    const __VLS_7 = __VLS_6({
        title: "结果数据不完整",
        description: "暂时无法展示该指标，请重新查询。",
        type: "warning",
        closable: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['indicator-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['trend']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            view: view,
            displayValue: displayValue,
            displayChangeRate: displayChangeRate,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
