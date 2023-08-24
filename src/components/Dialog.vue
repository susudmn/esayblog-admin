<template>
    <div>
        <el-dialog  :modelValue="show" :title="title" :show-close="showClose" :showCancel="showCancel" :draggable="true"
            :close-on-click-modal="false" class="cust-dialog" @close="close" :width="width">
            <div class="dialog-body">
                <slot></slot>
            </div>
            <template v-if="buttons && buttons.length > 0 || showCancel">
                <div class="dialog-footer">
                    <el-button link @click="close">
                        取消
                    </el-button>
                    <el-button v-for="btn in buttons" :type="btn.type" @click="btn.click" size="small">
                        {{ btn.text }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>

const props = defineProps({
    title: {
        type: String
    },
    showClose: {
        type: Boolean,
        default: true
    },
    showCancel: {
        type: Boolean,
        default: true
    },
    show: {
        type: Boolean,
        default: false
    },
    buttons: {
        type: Array
    },
    width: {
        type:Number,
        default:200
    }

})


const emit = defineEmits()
const close = () => {
    emit('close')
}
</script>

<style lang="scss">
.el-dialog__body {
    padding: 0px;
}

.dialog-body {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    padding: 20px;
    min-height: 50px;
}

.el-form-item__label {
    padding: 0 11px 0 0;
}
.dialog-footer {
    text-align: right;
    padding: 5px 20px;
}
</style>