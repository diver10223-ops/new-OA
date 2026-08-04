import { computed, ref } from 'vue';
import IndicatorCard from '../components/IndicatorCard.vue';
import TraceDrawer from '../components/TraceDrawer.vue';
import { executeAssistant, getAssistantTrace } from '../api/assistant';
const examples = ['本分行存款余额是多少', '总部平均存款比上期增加多少', '贷款占比近三个月趋势', '存款余额和平均存款是多少', '今天天气怎么样'];
const emptySuggestions = examples.slice(0, 3);
const text = ref('');
const org = ref('');
const response = ref(null);
const loading = ref(false);
const validation = ref('');
const requestError = ref('');
const trace = ref(null);
const traceOpen = ref(false);
const traceLoading = ref(false);
const traceError = ref('');
const canTrace = computed(() => Boolean(response.value?.traceId));
function fillSuggestion(value) { text.value = value; validation.value = ''; }
async function execute() {
    const question = text.value.trim();
    if (!question) {
        validation.value = '请输入问题后再查询';
        return;
    }
    if (loading.value)
        return;
    loading.value = true;
    validation.value = '';
    requestError.value = '';
    response.value = null;
    trace.value = null;
    traceOpen.value = false;
    traceError.value = '';
    try {
        response.value = await executeAssistant({ text: question, ...(org.value.trim() ? { org: org.value.trim() } : {}) });
    }
    catch {
        requestError.value = '请求失败，请稍后重试';
    }
    finally {
        loading.value = false;
    }
}
async function openTrace() {
    if (!response.value?.traceId || traceLoading.value)
        return;
    traceOpen.value = true;
    traceLoading.value = true;
    traceError.value = '';
    try {
        trace.value = await getAssistantTrace(response.value.traceId);
    }
    catch {
        traceError.value = '执行轨迹加载失败，主结果不受影响';
    }
    finally {
        traceLoading.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['result-area']} */ ;
/** @type {__VLS_StyleScopedClasses['candidate']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['org-input']} */ ;
/** @type {__VLS_StyleScopedClasses['candidate']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "ask-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "hero" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "ask-box" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "ask-box" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-row" },
});
const __VLS_4 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.text),
    size: "large",
    placeholder: "例如：本分行存款余额是多少",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.text),
    size: "large",
    placeholder: "例如：本分行存款余额是多少",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onKeyup: (__VLS_ctx.execute)
};
var __VLS_7;
const __VLS_12 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.org),
    ...{ class: "org-input" },
    placeholder: "机构（可选）",
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.org),
    ...{ class: "org-input" },
    placeholder: "机构（可选）",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    dataTest: "submit",
    size: "large",
    type: "primary",
    loading: (__VLS_ctx.loading),
    disabled: (__VLS_ctx.loading),
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    dataTest: "submit",
    size: "large",
    type: "primary",
    loading: (__VLS_ctx.loading),
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.execute)
};
__VLS_19.slots.default;
var __VLS_19;
if (__VLS_ctx.validation) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "validation" },
    });
    (__VLS_ctx.validation);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.examples))) {
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        key: (item),
        round: true,
        size: "small",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        key: (item),
        round: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            __VLS_ctx.fillSuggestion(item);
        }
    };
    __VLS_27.slots.default;
    (item);
    var __VLS_27;
}
var __VLS_3;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "state" },
    });
    const __VLS_32 = {}.ElSkeleton;
    /** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        rows: (4),
        animated: true,
    }));
    const __VLS_34 = __VLS_33({
        rows: (4),
        animated: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else if (__VLS_ctx.requestError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "state" },
    });
    const __VLS_36 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        title: (__VLS_ctx.requestError),
        type: "error",
        closable: (false),
        showIcon: true,
    }));
    const __VLS_38 = __VLS_37({
        title: (__VLS_ctx.requestError),
        type: "error",
        closable: (false),
        showIcon: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    const __VLS_40 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onClick: (__VLS_ctx.execute)
    };
    __VLS_43.slots.default;
    var __VLS_43;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suggestions" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.emptySuggestions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.requestError))
                        return;
                    __VLS_ctx.fillSuggestion(item);
                } },
            key: (item),
        });
        (item);
    }
}
else if (__VLS_ctx.response) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "result-area" },
    });
    if (__VLS_ctx.response.fallback) {
        const __VLS_48 = {}.ElAlert;
        /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            title: "当前为本地演示数据",
            description: "后端暂不可达，数据由浏览器内置同构 fallback 提供。",
            type: "warning",
            closable: (false),
            showIcon: true,
        }));
        const __VLS_50 = __VLS_49({
            title: "当前为本地演示数据",
            description: "后端暂不可达，数据由浏览器内置同构 fallback 提供。",
            type: "warning",
            closable: (false),
            showIcon: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    }
    if (__VLS_ctx.response.status === 'success') {
        /** @type {[typeof IndicatorCard, ]} */ ;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent(IndicatorCard, new IndicatorCard({
            data: (__VLS_ctx.response.result),
        }));
        const __VLS_53 = __VLS_52({
            data: (__VLS_ctx.response.result),
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    }
    else if (__VLS_ctx.response.status === 'candidate') {
        const __VLS_55 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
            ...{ class: "candidate" },
        }));
        const __VLS_57 = __VLS_56({
            ...{ class: "candidate" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_56));
        __VLS_58.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.response.candidates))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (item.code),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
            (item.code);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (item.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.unit);
        }
        var __VLS_58;
    }
    else if (__VLS_ctx.response.status === 'unsupported') {
        const __VLS_59 = {}.ElResult;
        /** @type {[typeof __VLS_components.ElResult, typeof __VLS_components.elResult, ]} */ ;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
            icon: "info",
            title: "暂不支持这个问题",
            subTitle: "可以尝试以下问法",
        }));
        const __VLS_61 = __VLS_60({
            icon: "info",
            title: "暂不支持这个问题",
            subTitle: "可以尝试以下问法",
        }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    }
    else if (__VLS_ctx.response.status === 'denied') {
        const __VLS_63 = {}.ElResult;
        /** @type {[typeof __VLS_components.ElResult, typeof __VLS_components.elResult, ]} */ ;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
            icon: "warning",
            title: "无权限查看",
            subTitle: "当前演示用户没有访问该指标的权限；页面不会展示任何受保护指标值。",
        }));
        const __VLS_65 = __VLS_64({
            icon: "warning",
            title: "无权限查看",
            subTitle: "当前演示用户没有访问该指标的权限；页面不会展示任何受保护指标值。",
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    }
    else {
        const __VLS_67 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
            ...{ class: "business-error" },
        }));
        const __VLS_69 = __VLS_68({
            ...{ class: "business-error" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_68));
        __VLS_70.slots.default;
        const __VLS_71 = {}.ElAlert;
        /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
            title: (`业务错误 ${__VLS_ctx.response.error.code ?? ''}`),
            description: (__VLS_ctx.response.error.message || '执行失败'),
            type: "error",
            closable: (false),
            showIcon: true,
        }));
        const __VLS_73 = __VLS_72({
            title: (`业务错误 ${__VLS_ctx.response.error.code ?? ''}`),
            description: (__VLS_ctx.response.error.message || '执行失败'),
            type: "error",
            closable: (false),
            showIcon: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        const __VLS_75 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
            ...{ 'onClick': {} },
        }));
        const __VLS_77 = __VLS_76({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        let __VLS_79;
        let __VLS_80;
        let __VLS_81;
        const __VLS_82 = {
            onClick: (__VLS_ctx.execute)
        };
        __VLS_78.slots.default;
        var __VLS_78;
        var __VLS_70;
    }
    if (['unsupported', 'error'].includes(__VLS_ctx.response.status) && __VLS_ctx.response.suggestions.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "suggestions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.response.suggestions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.requestError))
                            return;
                        if (!(__VLS_ctx.response))
                            return;
                        if (!(['unsupported', 'error'].includes(__VLS_ctx.response.status) && __VLS_ctx.response.suggestions.length))
                            return;
                        __VLS_ctx.fillSuggestion(item);
                    } },
                key: (item),
            });
            (item);
        }
    }
    if (__VLS_ctx.canTrace) {
        const __VLS_83 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
            ...{ 'onClick': {} },
            ...{ class: "trace-button" },
        }));
        const __VLS_85 = __VLS_84({
            ...{ 'onClick': {} },
            ...{ class: "trace-button" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        let __VLS_87;
        let __VLS_88;
        let __VLS_89;
        const __VLS_90 = {
            onClick: (__VLS_ctx.openTrace)
        };
        __VLS_86.slots.default;
        var __VLS_86;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "empty state" },
    });
    const __VLS_91 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        description: "输入一个经营问题开始查询",
    }));
    const __VLS_93 = __VLS_92({
        description: "输入一个经营问题开始查询",
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suggestions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.emptySuggestions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.requestError))
                        return;
                    if (!!(__VLS_ctx.response))
                        return;
                    __VLS_ctx.fillSuggestion(item);
                } },
            key: (item),
        });
        (item);
    }
}
/** @type {[typeof TraceDrawer, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(TraceDrawer, new TraceDrawer({
    open: (__VLS_ctx.traceOpen),
    trace: (__VLS_ctx.trace),
    loading: (__VLS_ctx.traceLoading),
    error: (__VLS_ctx.traceError),
}));
const __VLS_96 = __VLS_95({
    open: (__VLS_ctx.traceOpen),
    trace: (__VLS_ctx.trace),
    loading: (__VLS_ctx.traceLoading),
    error: (__VLS_ctx.traceError),
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
/** @type {__VLS_StyleScopedClasses['ask-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['ask-box']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['org-input']} */ ;
/** @type {__VLS_StyleScopedClasses['validation']} */ ;
/** @type {__VLS_StyleScopedClasses['quick']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['result-area']} */ ;
/** @type {__VLS_StyleScopedClasses['candidate']} */ ;
/** @type {__VLS_StyleScopedClasses['business-error']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['trace-button']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IndicatorCard: IndicatorCard,
            TraceDrawer: TraceDrawer,
            examples: examples,
            emptySuggestions: emptySuggestions,
            text: text,
            org: org,
            response: response,
            loading: loading,
            validation: validation,
            requestError: requestError,
            trace: trace,
            traceOpen: traceOpen,
            traceLoading: traceLoading,
            traceError: traceError,
            canTrace: canTrace,
            fillSuggestion: fillSuggestion,
            execute: execute,
            openTrace: openTrace,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
