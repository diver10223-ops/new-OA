import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { leaveApi } from '../api/leave';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
const route = useRoute(), router = useRouter(), saving = ref(false), dirty = ref(false);
const form = reactive({ leaveType: 'ANNUAL', startTime: '', endTime: '', reason: '' });
const hours = computed(() => form.startTime && form.endTime ? Math.max(0, (+new Date(form.endTime) - +new Date(form.startTime)) / 3600000) : 0);
async function save(submit = false) { if (!form.startTime || !form.endTime || hours.value <= 0 || !form.reason.trim())
    return ElMessage.warning('请完整填写且结束时间晚于开始时间'); if (submit)
    await ElMessageBox.confirm('保存后立即提交审批？', '提交确认'); saving.value = true; try {
    const body = { ...form, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString() };
    let id = Number(route.params.id);
    if (id)
        await leaveApi.update(id, body);
    else {
        id = (await leaveApi.create(body)).data.id;
    }
    if (submit)
        await leaveApi.submit(id);
    dirty.value = false;
    ElMessage.success(submit ? '已提交审批' : '草稿已保存');
    router.push('/leave');
}
finally {
    saving.value = false;
} }
onMounted(async () => { if (route.params.id) {
    const r = await leaveApi.detail(Number(route.params.id));
    Object.assign(form, r.data);
    form.startTime = form.startTime?.slice(0, 16);
    form.endTime = form.endTime?.slice(0, 16);
} });
onBeforeRouteLeave(() => dirty.value ? confirm('表单尚未保存，确认离开？') : true);
onBeforeUnmount(() => { });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.route.params.id ? '编辑' : '新建');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onChange': {} },
    labelWidth: "100px",
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onChange': {} },
    labelWidth: "100px",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onChange: (...[$event]) => {
        __VLS_ctx.dirty = true;
    }
};
__VLS_7.slots.default;
const __VLS_12 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    label: "请假类型",
    required: true,
}));
const __VLS_14 = __VLS_13({
    label: "请假类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.form.leaveType),
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.form.leaveType),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "年假",
    value: "ANNUAL",
}));
const __VLS_22 = __VLS_21({
    label: "年假",
    value: "ANNUAL",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "病假",
    value: "SICK",
}));
const __VLS_26 = __VLS_25({
    label: "病假",
    value: "SICK",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_19;
var __VLS_15;
const __VLS_28 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "开始时间",
    required: true,
}));
const __VLS_30 = __VLS_29({
    label: "开始时间",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.form.startTime),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm",
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.form.startTime),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
var __VLS_31;
const __VLS_36 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "结束时间",
    required: true,
}));
const __VLS_38 = __VLS_37({
    label: "结束时间",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.form.endTime),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.form.endTime),
    type: "datetime",
    valueFormat: "YYYY-MM-DDTHH:mm",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_39;
const __VLS_44 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "请假时长",
}));
const __VLS_46 = __VLS_45({
    label: "请假时长",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
(__VLS_ctx.hours.toFixed(2));
var __VLS_47;
const __VLS_48 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "请假原因",
    required: true,
}));
const __VLS_50 = __VLS_49({
    label: "请假原因",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.form.reason),
    type: "textarea",
    maxlength: "500",
    showWordLimit: true,
    rows: (5),
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.form.reason),
    type: "textarea",
    maxlength: "500",
    showWordLimit: true,
    rows: (5),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
const __VLS_56 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.saving),
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (...[$event]) => {
        __VLS_ctx.save(false);
    }
};
__VLS_63.slots.default;
var __VLS_63;
const __VLS_68 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}));
const __VLS_70 = __VLS_69({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onClick: (...[$event]) => {
        __VLS_ctx.save(true);
    }
};
__VLS_71.slots.default;
var __VLS_71;
var __VLS_59;
var __VLS_7;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            route: route,
            saving: saving,
            dirty: dirty,
            form: form,
            hours: hours,
            save: save,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
