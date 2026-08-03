import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { projectApi } from '../api/project';
import { statusLabel, statusType } from '../utils/status';
import { useRouter } from 'vue-router';
const loading = ref(false);
const saving = ref(false);
const rows = ref([]);
const total = ref(0);
const dialog = ref(false);
const formRef = ref();
const editingId = ref();
const q = reactive({
    status: '',
    keyword: '',
    page: 0,
    size: 10,
});
const form = reactive({
    projectName: '',
    projectOwner: '',
    plannedStartDate: '',
    plannedEndDate: '',
    budget: 0,
    summary: '',
});
const router = useRouter();
const rules = {
    projectName: [{ required: true, message: '请输入项目名称' }],
    projectOwner: [{ required: true, message: '请输入项目负责人' }],
    plannedStartDate: [{ required: true, message: '请选择开始日期' }],
    plannedEndDate: [{ required: true, message: '请选择结束日期' }],
    summary: [{ required: true, message: '请输入项目摘要' }],
    budget: [{ type: 'number', min: 0, message: '预算不能小于零' }],
};
async function load() {
    loading.value = true;
    try {
        const r = await projectApi.list(q);
        rows.value = r.data.items;
        total.value = r.data.total;
    }
    finally {
        loading.value = false;
    }
}
function create() {
    editingId.value = undefined;
    Object.assign(form, {
        projectName: '',
        projectOwner: '',
        plannedStartDate: '',
        plannedEndDate: '',
        budget: 0,
        summary: '',
    });
    dialog.value = true;
}
async function edit(row) {
    const r = await projectApi.detail(row.id);
    editingId.value = row.id;
    Object.assign(form, r.data);
    dialog.value = true;
}
async function save(submit = false) {
    await formRef.value?.validate();
    if (form.plannedStartDate >= form.plannedEndDate) {
        return ElMessage.error('开始日期必须早于结束日期');
    }
    saving.value = true;
    try {
        let id = editingId.value;
        if (id) {
            await projectApi.update(id, form);
        }
        else {
            const r = await projectApi.create(form);
            id = r.data.id;
        }
        if (submit && id) {
            await projectApi.submit(id);
        }
        dialog.value = false;
        ElMessage.success(submit ? '已提交审批' : '草稿已保存');
        load();
    }
    finally {
        saving.value = false;
    }
}
async function action(row, type) {
    await ElMessageBox.confirm('确认执行此操作？', '操作确认');
    await projectApi[type](row.id);
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
for (const [s] of __VLS_getVForSourceType((['DRAFT', 'SUBMITTED', 'ESTABLISHED', 'REJECTED', 'CANCELLED', 'CLOSED']))) {
    const __VLS_16 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        key: (s),
        label: (__VLS_ctx.statusLabel(s)),
        value: (s),
    }));
    const __VLS_18 = __VLS_17({
        key: (s),
        label: (__VLS_ctx.statusLabel(s)),
        value: (s),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
var __VLS_15;
var __VLS_11;
const __VLS_20 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "关键字",
}));
const __VLS_22 = __VLS_21({
    label: "关键字",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.q.keyword),
    clearable: true,
    placeholder: "项目名称或编码",
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.q.keyword),
    clearable: true,
    placeholder: "项目名称或编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_23;
const __VLS_28 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (...[$event]) => {
        __VLS_ctx.q.page = 0;
        __VLS_ctx.load();
    }
};
__VLS_35.slots.default;
var __VLS_35;
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    type: "success",
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (__VLS_ctx.create)
};
__VLS_43.slots.default;
var __VLS_43;
var __VLS_31;
var __VLS_7;
var __VLS_3;
const __VLS_48 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    data: (__VLS_ctx.rows),
    emptyText: "暂无立项申请",
}));
const __VLS_54 = __VLS_53({
    data: (__VLS_ctx.rows),
    emptyText: "暂无立项申请",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_55.slots.default;
const __VLS_56 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    prop: "applicationNo",
    label: "申请单号",
}));
const __VLS_58 = __VLS_57({
    prop: "applicationNo",
    label: "申请单号",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
const __VLS_60 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    prop: "projectName",
    label: "项目名称",
}));
const __VLS_62 = __VLS_61({
    prop: "projectName",
    label: "项目名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const __VLS_64 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    prop: "projectOwner",
    label: "项目负责人",
}));
const __VLS_66 = __VLS_65({
    prop: "projectOwner",
    label: "项目负责人",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const __VLS_68 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    prop: "budget",
    label: "预算",
}));
const __VLS_70 = __VLS_69({
    prop: "budget",
    label: "预算",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const __VLS_72 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    label: "状态",
}));
const __VLS_74 = __VLS_73({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_75.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_76 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        type: (__VLS_ctx.statusType(scope.row.businessStatus)),
    }));
    const __VLS_78 = __VLS_77({
        type: (__VLS_ctx.statusType(scope.row.businessStatus)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    (__VLS_ctx.statusLabel(scope.row.businessStatus));
    var __VLS_79;
}
var __VLS_75;
const __VLS_80 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "操作",
    width: "310",
}));
const __VLS_82 = __VLS_81({
    label: "操作",
    width: "310",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_83.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_84 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        ...{ 'onClick': {} },
        link: true,
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onClick': {} },
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_88;
    let __VLS_89;
    let __VLS_90;
    const __VLS_91 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push('/project/' + scope.row.id);
        }
    };
    __VLS_87.slots.default;
    var __VLS_87;
    if (scope.row.businessStatus === 'DRAFT') {
        const __VLS_92 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_96;
        let __VLS_97;
        let __VLS_98;
        const __VLS_99 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'DRAFT'))
                    return;
                __VLS_ctx.edit(scope.row);
            }
        };
        __VLS_95.slots.default;
        var __VLS_95;
    }
    if (scope.row.businessStatus === 'DRAFT') {
        const __VLS_100 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }));
        const __VLS_102 = __VLS_101({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_104;
        let __VLS_105;
        let __VLS_106;
        const __VLS_107 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'DRAFT'))
                    return;
                __VLS_ctx.action(scope.row, 'submit');
            }
        };
        __VLS_103.slots.default;
        var __VLS_103;
    }
    if (scope.row.businessStatus === 'DRAFT') {
        const __VLS_108 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }));
        const __VLS_110 = __VLS_109({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        let __VLS_112;
        let __VLS_113;
        let __VLS_114;
        const __VLS_115 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'DRAFT'))
                    return;
                __VLS_ctx.action(scope.row, 'remove');
            }
        };
        __VLS_111.slots.default;
        var __VLS_111;
    }
    if (scope.row.businessStatus === 'SUBMITTED') {
        const __VLS_116 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
        }));
        const __VLS_118 = __VLS_117({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        let __VLS_120;
        let __VLS_121;
        let __VLS_122;
        const __VLS_123 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'SUBMITTED'))
                    return;
                __VLS_ctx.action(scope.row, 'withdraw');
            }
        };
        __VLS_119.slots.default;
        var __VLS_119;
    }
    if (scope.row.businessStatus === 'ESTABLISHED') {
        const __VLS_124 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_126 = __VLS_125({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        let __VLS_128;
        let __VLS_129;
        let __VLS_130;
        const __VLS_131 = {
            onClick: (...[$event]) => {
                if (!(scope.row.businessStatus === 'ESTABLISHED'))
                    return;
                __VLS_ctx.action(scope.row, 'close');
            }
        };
        __VLS_127.slots.default;
        var __VLS_127;
    }
}
var __VLS_83;
var __VLS_55;
const __VLS_132 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.q.page),
    pageSize: (__VLS_ctx.q.size),
    total: (__VLS_ctx.total),
}));
const __VLS_134 = __VLS_133({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.q.page),
    pageSize: (__VLS_ctx.q.size),
    total: (__VLS_ctx.total),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
let __VLS_136;
let __VLS_137;
let __VLS_138;
const __VLS_139 = {
    onCurrentChange: (__VLS_ctx.handlePageChange)
};
var __VLS_135;
var __VLS_51;
const __VLS_140 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.dialog),
    title: (__VLS_ctx.editingId ? '编辑立项草稿' : '新建立项申请'),
    width: "620px",
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.dialog),
    title: (__VLS_ctx.editingId ? '编辑立项草稿' : '新建立项申请'),
    width: "620px",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
}));
const __VLS_146 = __VLS_145({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_148 = {};
__VLS_147.slots.default;
const __VLS_150 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    label: "项目名称",
    prop: "projectName",
}));
const __VLS_152 = __VLS_151({
    label: "项目名称",
    prop: "projectName",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
const __VLS_154 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    modelValue: (__VLS_ctx.form.projectName),
    maxlength: "200",
}));
const __VLS_156 = __VLS_155({
    modelValue: (__VLS_ctx.form.projectName),
    maxlength: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
var __VLS_153;
const __VLS_158 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    label: "项目负责人",
    prop: "projectOwner",
}));
const __VLS_160 = __VLS_159({
    label: "项目负责人",
    prop: "projectOwner",
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
const __VLS_162 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    modelValue: (__VLS_ctx.form.projectOwner),
}));
const __VLS_164 = __VLS_163({
    modelValue: (__VLS_ctx.form.projectOwner),
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
var __VLS_161;
const __VLS_166 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
    gutter: (16),
}));
const __VLS_168 = __VLS_167({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_167));
__VLS_169.slots.default;
const __VLS_170 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
    span: (12),
}));
const __VLS_172 = __VLS_171({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
__VLS_173.slots.default;
const __VLS_174 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    label: "开始日期",
    prop: "plannedStartDate",
}));
const __VLS_176 = __VLS_175({
    label: "开始日期",
    prop: "plannedStartDate",
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
__VLS_177.slots.default;
const __VLS_178 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
    modelValue: (__VLS_ctx.form.plannedStartDate),
    valueFormat: "YYYY-MM-DD",
}));
const __VLS_180 = __VLS_179({
    modelValue: (__VLS_ctx.form.plannedStartDate),
    valueFormat: "YYYY-MM-DD",
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
var __VLS_177;
var __VLS_173;
const __VLS_182 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
    span: (12),
}));
const __VLS_184 = __VLS_183({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
__VLS_185.slots.default;
const __VLS_186 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
    label: "结束日期",
    prop: "plannedEndDate",
}));
const __VLS_188 = __VLS_187({
    label: "结束日期",
    prop: "plannedEndDate",
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
__VLS_189.slots.default;
const __VLS_190 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
    modelValue: (__VLS_ctx.form.plannedEndDate),
    valueFormat: "YYYY-MM-DD",
}));
const __VLS_192 = __VLS_191({
    modelValue: (__VLS_ctx.form.plannedEndDate),
    valueFormat: "YYYY-MM-DD",
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
var __VLS_189;
var __VLS_185;
var __VLS_169;
const __VLS_194 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
    label: "预算金额",
    prop: "budget",
}));
const __VLS_196 = __VLS_195({
    label: "预算金额",
    prop: "budget",
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
__VLS_197.slots.default;
const __VLS_198 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
    modelValue: (__VLS_ctx.form.budget),
    min: (0),
    precision: (2),
}));
const __VLS_200 = __VLS_199({
    modelValue: (__VLS_ctx.form.budget),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
var __VLS_197;
const __VLS_202 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
    label: "项目摘要",
    prop: "summary",
}));
const __VLS_204 = __VLS_203({
    label: "项目摘要",
    prop: "summary",
}, ...__VLS_functionalComponentArgsRest(__VLS_203));
__VLS_205.slots.default;
const __VLS_206 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
    modelValue: (__VLS_ctx.form.summary),
    type: "textarea",
    rows: (4),
    maxlength: "1000",
    showWordLimit: true,
}));
const __VLS_208 = __VLS_207({
    modelValue: (__VLS_ctx.form.summary),
    type: "textarea",
    rows: (4),
    maxlength: "1000",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_207));
var __VLS_205;
var __VLS_147;
{
    const { footer: __VLS_thisSlot } = __VLS_143.slots;
    const __VLS_210 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
        ...{ 'onClick': {} },
    }));
    const __VLS_212 = __VLS_211({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_211));
    let __VLS_214;
    let __VLS_215;
    let __VLS_216;
    const __VLS_217 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialog = false;
        }
    };
    __VLS_213.slots.default;
    var __VLS_213;
    const __VLS_218 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_220 = __VLS_219({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    let __VLS_222;
    let __VLS_223;
    let __VLS_224;
    const __VLS_225 = {
        onClick: (...[$event]) => {
            __VLS_ctx.save(false);
        }
    };
    __VLS_221.slots.default;
    var __VLS_221;
    const __VLS_226 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_228 = __VLS_227({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    let __VLS_230;
    let __VLS_231;
    let __VLS_232;
    const __VLS_233 = {
        onClick: (...[$event]) => {
            __VLS_ctx.save(true);
        }
    };
    __VLS_229.slots.default;
    var __VLS_229;
}
var __VLS_143;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['query']} */ ;
// @ts-ignore
var __VLS_149 = __VLS_148;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            statusLabel: statusLabel,
            statusType: statusType,
            loading: loading,
            saving: saving,
            rows: rows,
            total: total,
            dialog: dialog,
            formRef: formRef,
            editingId: editingId,
            q: q,
            form: form,
            router: router,
            rules: rules,
            load: load,
            create: create,
            edit: edit,
            save: save,
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
