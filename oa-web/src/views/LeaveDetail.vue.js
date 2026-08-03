import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { leaveApi, approvalApi } from '../api/leave';
import { statusLabel } from '../utils/status';
const route = useRoute();
const data = ref();
const approval = ref();
onMounted(async () => {
    if (route.path.startsWith('/approval/')) {
        approval.value = (await approvalApi.detail(Number(route.params.id))).data;
    }
    else {
        data.value = (await leaveApi.detail(Number(route.params.id))).data;
        if (data.value?.approvalInstanceId) {
            approval.value = (await approvalApi.detail(data.value.approvalInstanceId)).data;
        }
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
if (__VLS_ctx.data) {
    const __VLS_0 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        column: (2),
        border: true,
    }));
    const __VLS_6 = __VLS_5({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        label: "申请人",
    }));
    const __VLS_10 = __VLS_9({
        label: "申请人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    (__VLS_ctx.data.applicantName);
    var __VLS_11;
    const __VLS_12 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        label: "部门",
    }));
    const __VLS_14 = __VLS_13({
        label: "部门",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.data.departmentName);
    var __VLS_15;
    const __VLS_16 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        label: "类型",
    }));
    const __VLS_18 = __VLS_17({
        label: "类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    (__VLS_ctx.data.leaveType);
    var __VLS_19;
    const __VLS_20 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        label: "业务状态",
    }));
    const __VLS_22 = __VLS_21({
        label: "业务状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    (__VLS_ctx.statusLabel(__VLS_ctx.data.businessStatus));
    var __VLS_23;
    const __VLS_24 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        label: "请假时间",
    }));
    const __VLS_26 = __VLS_25({
        label: "请假时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    (__VLS_ctx.data.startTime);
    (__VLS_ctx.data.endTime);
    var __VLS_27;
    const __VLS_28 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        label: "时长",
    }));
    const __VLS_30 = __VLS_29({
        label: "时长",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    (__VLS_ctx.data.duration);
    var __VLS_31;
    const __VLS_32 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        label: "原因",
        span: (2),
    }));
    const __VLS_34 = __VLS_33({
        label: "原因",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    (__VLS_ctx.data.reason);
    var __VLS_35;
    var __VLS_7;
    var __VLS_3;
}
if (__VLS_ctx.approval) {
    const __VLS_36 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ style: {} },
    }));
    const __VLS_38 = __VLS_37({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_39.slots;
        (__VLS_ctx.statusLabel(__VLS_ctx.approval.status));
    }
    const __VLS_40 = {}.ElTimeline;
    /** @type {[typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.approval.timeline))) {
        const __VLS_44 = {}.ElTimelineItem;
        /** @type {[typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            key: (item.id),
            timestamp: (item.handledAt || item.createdAt),
        }));
        const __VLS_46 = __VLS_45({
            key: (item.id),
            timestamp: (item.handledAt || item.createdAt),
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        (item.nodeName);
        (__VLS_ctx.statusLabel(item.status));
        if (item.comment) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (item.comment);
        }
        var __VLS_47;
    }
    var __VLS_43;
    var __VLS_39;
}
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            statusLabel: statusLabel,
            data: data,
            approval: approval,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
