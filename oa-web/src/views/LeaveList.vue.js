import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { leaveApi } from '../api/leave';
import { useRouter } from 'vue-router';
import { statusLabel, statusType } from '../utils/status';
const router = useRouter();
const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const q = reactive({
    status: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    page: 0,
    size: 10,
});
async function load() {
    loading.value = true;
    try {
        const r = await leaveApi.list(q);
        rows.value = r.data.items;
        total.value = r.data.total;
    }
    finally {
        loading.value = false;
    }
}
async function action(id, type) {
    await ElMessageBox.confirm(type === 'remove' ? '确认删除草稿？' : type === 'submit' ? '确认提交审批？' : '确认撤回申请？', '操作确认');
    await leaveApi[type](id);
    ElMessage.success('操作成功');
    load();
}
function handlePageChange(p) {
    q.page = p - 1;
    load();
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "query" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "query" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    inline: true,
}));
const __VLS_6 = __VLS_5({
    inline: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    label: "状态",
}));
const __VLS_10 = __VLS_9({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.q.status),
    clearable: true,
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.q.status),
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "草稿",
    value: "DRAFT",
}));
const __VLS_18 = __VLS_17({
    label: "草稿",
    value: "DRAFT",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "审批中",
    value: "SUBMITTED",
}));
const __VLS_22 = __VLS_21({
    label: "审批中",
    value: "SUBMITTED",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "已生效",
    value: "EFFECTIVE",
}));
const __VLS_26 = __VLS_25({
    label: "已生效",
    value: "EFFECTIVE",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "已拒绝",
    value: "REJECTED",
}));
const __VLS_30 = __VLS_29({
    label: "已拒绝",
    value: "REJECTED",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "已撤回",
    value: "CANCELLED",
}));
const __VLS_34 = __VLS_33({
    label: "已撤回",
    value: "CANCELLED",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
var __VLS_15;
var __VLS_11;
const __VLS_36 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "类型",
}));
const __VLS_38 = __VLS_37({
    label: "类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.q.leaveType),
    clearable: true,
    ...{ style: {} },
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.q.leaveType),
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "年假",
    value: "ANNUAL",
}));
const __VLS_46 = __VLS_45({
    label: "年假",
    value: "ANNUAL",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "病假",
    value: "SICK",
}));
const __VLS_50 = __VLS_49({
    label: "病假",
    value: "SICK",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_43;
var __VLS_39;
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onClick: (...[$event]) => {
        __VLS_ctx.q.page = 0;
        __VLS_ctx.load();
    }
};
__VLS_59.slots.default;
var __VLS_59;
const __VLS_64 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onClick': {} },
}));
const __VLS_66 = __VLS_65({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/leave/new');
    }
};
__VLS_67.slots.default;
var __VLS_67;
var __VLS_55;
var __VLS_7;
var __VLS_3;
const __VLS_72 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    data: (__VLS_ctx.rows),
    emptyText: "暂无请假申请",
}));
const __VLS_78 = __VLS_77({
    data: (__VLS_ctx.rows),
    emptyText: "暂无请假申请",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_79.slots.default;
const __VLS_80 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    prop: "applicationNo",
    label: "申请单号",
}));
const __VLS_82 = __VLS_81({
    prop: "applicationNo",
    label: "申请单号",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const __VLS_84 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    prop: "leaveType",
    label: "类型",
}));
const __VLS_86 = __VLS_85({
    prop: "leaveType",
    label: "类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const __VLS_88 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    prop: "startTime",
    label: "开始时间",
}));
const __VLS_90 = __VLS_89({
    prop: "startTime",
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const __VLS_92 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    prop: "duration",
    label: "时长(小时)",
}));
const __VLS_94 = __VLS_93({
    prop: "duration",
    label: "时长(小时)",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
const __VLS_96 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "状态",
}));
const __VLS_98 = __VLS_97({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_99.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_100 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        type: (__VLS_ctx.statusType(scope.row.businessStatus)),
    }));
    const __VLS_102 = __VLS_101({
        type: (__VLS_ctx.statusType(scope.row.businessStatus)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    (__VLS_ctx.statusLabel(scope.row.businessStatus));
    var __VLS_103;
}
var __VLS_99;
const __VLS_104 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "操作",
    width: "260",
}));
const __VLS_106 = __VLS_105({
    label: "操作",
    width: "260",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_107.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_108 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        ...{ 'onClick': {} },
        link: true,
    }));
    const __VLS_110 = __VLS_109({
        ...{ 'onClick': {} },
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    let __VLS_112;
    let __VLS_113;
    let __VLS_114;
    const __VLS_115 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push('/leave/' + scope.row.id);
        }
    };
    __VLS_111.slots.default;
    var __VLS_111;
    if (scope.row.businessStatus === 'DRAFT') {
        const __VLS_116 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_118 = __VLS_117({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        let __VLS_120;
        let __VLS_121;
        let __VLS_122;
        const __VLS_123 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'DRAFT'))
                    return;
                __VLS_ctx.router.push('/leave/' + scope.row.id + '/edit');
            }
        };
        __VLS_119.slots.default;
        var __VLS_119;
    }
    if (scope.row.businessStatus === 'DRAFT') {
        const __VLS_124 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }));
        const __VLS_126 = __VLS_125({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        let __VLS_128;
        let __VLS_129;
        let __VLS_130;
        const __VLS_131 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'DRAFT'))
                    return;
                __VLS_ctx.action(scope.row.id, 'submit');
            }
        };
        __VLS_127.slots.default;
        var __VLS_127;
    }
    if (scope.row.businessStatus === 'DRAFT') {
        const __VLS_132 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }));
        const __VLS_134 = __VLS_133({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        let __VLS_136;
        let __VLS_137;
        let __VLS_138;
        const __VLS_139 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'DRAFT'))
                    return;
                __VLS_ctx.action(scope.row.id, 'remove');
            }
        };
        __VLS_135.slots.default;
        var __VLS_135;
    }
    if (scope.row.businessStatus === 'SUBMITTED') {
        const __VLS_140 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
        }));
        const __VLS_142 = __VLS_141({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        let __VLS_144;
        let __VLS_145;
        let __VLS_146;
        const __VLS_147 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'SUBMITTED'))
                    return;
                __VLS_ctx.action(scope.row.id, 'withdraw');
            }
        };
        __VLS_143.slots.default;
        var __VLS_143;
    }
}
var __VLS_107;
var __VLS_79;
const __VLS_148 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.q.page),
    pageSize: (__VLS_ctx.q.size),
    total: (__VLS_ctx.total),
}));
const __VLS_150 = __VLS_149({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.q.page),
    pageSize: (__VLS_ctx.q.size),
    total: (__VLS_ctx.total),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
let __VLS_152;
let __VLS_153;
let __VLS_154;
const __VLS_155 = {
    onCurrentChange: (__VLS_ctx.handlePageChange)
};
var __VLS_151;
var __VLS_75;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['query']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            statusLabel: statusLabel,
            statusType: statusType,
            router: router,
            loading: loading,
            rows: rows,
            total: total,
            q: q,
            load: load,
            action: action,
            handlePageChange: handlePageChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
