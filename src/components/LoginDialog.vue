<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isSetup ? '设置主密码' : '解锁编辑器'"
    width="90%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    center
  >
    <p class="text-sm mb-4" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
      {{ isSetup ? '请设置一个主密码，用于加密保护你的文本数据。此密码不会上传，遗忘无法恢复。' : '请输入你的主密码以解锁数据。' }}
    </p>

    <el-form @submit.prevent="handleSubmit">
      <el-form-item>
        <el-input
          v-model="password"
          type="password"
          :placeholder="isSetup ? '设置主密码' : '输入主密码'"
          show-password
          size="large"
        />
      </el-form-item>
      <el-form-item v-if="isSetup">
        <el-input
          v-model="confirmPassword"
          type="password"
          placeholder="再次输入确认"
          show-password
          size="large"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="handleSubmit" :loading="loading" size="large" class="w-full md:w-auto">
        {{ isSetup ? '设置并进入' : '解锁进入' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, inject } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  isSetup: Boolean
})

const emit = defineEmits(['update:visible', 'unlock', 'setup'])

const isDark = inject('isDark')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const dialogVisible = ref(props.visible)

const handleSubmit = async () => {
  if (!password.value) {
    ElMessage.warning('请输入密码')
    return
  }
  if (props.isSetup) {
    if (password.value.length < 6) {
      ElMessage.warning('密码至少6位')
      return
    }
    if (password.value !== confirmPassword.value) {
      ElMessage.warning('两次密码不一致')
      return
    }
  }
  loading.value = true
  if (props.isSetup) {
    emit('setup', password.value)
  } else {
    emit('unlock', password.value)
  }
}
</script>