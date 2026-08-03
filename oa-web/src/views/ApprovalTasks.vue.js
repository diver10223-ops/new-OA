import { onMounted, ref } from 'vue';
import { approvalApi } from '../api/leave';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
const p = defineProps();
const rows = ref([]);
const loading = ref(false);
const acting = ref(null);
const router = useRouter();
async function load() {
    loading.value = true;
    try {
        rows.value = (await approvalApi.tasks(!!p.completed)).data.items;
    }
    finally {
        loading.value = false;
    }
}
async function decide(row, approve) {
    const { value } = await ElMessageBox.prompt(approve ? '请输入审批意见（可选）' : '请输入拒绝原因', '审批处理', {
        inputValidator: (v) => approve || !!v || '拒绝时必须填写意见',
    });
    acting.value = row.id;
    try {
        await approvalApi.decide(row.id, approve, value || '');
        ElMessage.success('审批已处理');
        await load();
    }
    finally {
        acting.value = null;
    }
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.completed ? '我的已办' : '我的待办');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.completed ? '查看历史审批处理记录' : '处理分配给我的审批任务');
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    data: (__VLS_ctx.rows),
    emptyText: "暂无记录",
}));
const __VLS_6 = __VLS_5({
    data: (__VLS_ctx.rows),
    emptyText: "暂无记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_7.slots.default;
const __VLS_8 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    prop: "businessType",
    label: "申请类型",
}));
const __VLS_10 = __VLS_9({
    prop: "businessType",
    label: "申请类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    prop: "applicantName",
    label: "申请人",
}));
const __VLS_14 = __VLS_13({
    prop: "applicantName",
    label: "申请人",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    prop: "nodeName",
    label: "当前节点",
}));
const __VLS_18 = __VLS_17({
    prop: "nodeName",
    label: "当前节点",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    prop: (__VLS_ctx.completed ? 'handledAt' : 'createdAt'),
    label: (__VLS_ctx.completed ? '处理时间' : '提交时间'),
}));
const __VLS_22 = __VLS_21({
    prop: (__VLS_ctx.completed ? 'handledAt' : 'createdAt'),
    label: (__VLS_ctx.completed ? '处理时间' : '提交时间'),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
if (__VLS_ctx.completed) {
    const __VLS_24 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        prop: "status",
        label: "结果",
    }));
    const __VLS_26 = __VLS_25({
        prop: "status",
        label: "结果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "操作",
}));
const __VLS_30 = __VLS_29({
    label: "操作",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_31.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        link: true,
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push('/approval/' + scope.row.instanceId);
        }
    };
    __VLS_35.slots.default;
    var __VLS_35;
    if (!__VLS_ctx.completed) {
        const __VLS_40 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
            type: "success",
            link: true,
            loading: (__VLS_ctx.acting === scope.row.id),
            disabled: (__VLS_ctx.acting !== null),
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
            type: "success",
            link: true,
            loading: (__VLS_ctx.acting === scope.row.id),
            disabled: (__VLS_ctx.acting !== null),
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.completed))
                    return;
                __VLS_ctx.decide(scope.row, true);
            }
        };
        __VLS_43.slots.default;
        var __VLS_43;
        const __VLS_48 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onClick': {} },
            type: "danger",
            link: true,
            loading: (__VLS_ctx.acting === scope.row.id),
            disabled: (__VLS_ctx.acting !== null),
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
            type: "danger",
            link: true,
            loading: (__VLS_ctx.acting === scope.row.id),
            disabled: (__VLS_ctx.acting !== null),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.completed))
                    return;
                __VLS_ctx.decide(scope.row, false);
            }
        };
        __VLS_51.slots.default;
        var __VLS_51;
    }
}
var __VLS_31;
var __VLS_7;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            rows: rows,
            loading: loading,
            acting: acting,
            router: router,
            decide: decide,
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
