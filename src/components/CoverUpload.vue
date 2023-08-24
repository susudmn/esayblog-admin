<template>
    <div>
        <el-upload class="avatar-uploader" 
                   name="file" 
                   :show-file-list="false"
                   accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
                   multiple="false"
                   :http-request="uploadImage" >
            <div class="cover-upload-btn">
                <template v-if="modelValue">
                    <img :src="proxy.globalInfo.imageUrl + modelValue">
                </template>
                <span v-else class="cover-upload-btn"></span>
            </div>
      </el-upload>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance()

    const props = defineProps({
        modelValue: {
            type:String,
            default:null
        }
    })

    const api = {
    uploadUrl: 'file/uploadImage'
    }

    const emit = defineEmits()
    const uploadImage = async (file)=> {
        let result = await proxy.Request({
            url:api.uploadUrl,
            dataType:'file',
            params:{
                file: file.file,
                type: 0
            }
        })
        const fileName = result.data.fileName
        emit('update:modelValue', fileName)
        emit('callback', fileName)
    }
</script>

<style lang="scss">
    .cover-upload-btn {
        background: url(../assets/cover_bg.png);
        position: relative;
        left: -4px;
        overflow: hidden;
        margin-left: 2px;
        width: 130px;
        height: 130px;
        border: 1px dashed #ddd;
        img {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
    }
    }
</style>