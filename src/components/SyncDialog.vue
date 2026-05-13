<template>
  <el-dialog
    v-model="visible"
    title="确认同步云端内容"
    width="90%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    center
  >
    <div class="mb-4 text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
      本次新增/修改的文本如下，请勾选需要同步到云端的内容：
    </div>
    <el-checkbox-group v-model="selectedIds" class="max-h-60 overflow-y-auto">
      <el-checkbox
        v-for="note in changedNotes"
        :key="note.id"
        :value="note.id"
        :label="note.id"
        class="block mb-2"
      >
        {{ note.title || '未命名文本' }}
      </el-checkbox>
    </el-checkbox-group>
    <div class="flex justify-between mt-4">
      <div class="flex gap-2">
        <el-button size="small" @click="selectAll">全选</el-button>
        <el-button size="small" @click="deselectAll">取消全选</el-button>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('cancel')">取消同步</el-button>
      <el-button type="primary" @click="confirm" :disabled="selectedIds.length === 0">
        确认同步 ({{ selectedIds.length }})
      </el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, watch, inject } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  changedNotes: Array
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const isDark = inject('isDark')
const selectedIds = ref([])

watch(() => props.changedNotes, (newNotes) => {
  selectedIds.value = newNotes.map(n => n.id)
}, { immediate: true })

const visible = ref(props.visible)
watch(() => props.visible, (val) => { visible.value = val })

const selectAll = () => {
  selectedIds.value = props.changedNotes.map(n => n.id)
}

const deselectAll = () => {
  selectedIds.value = []
}

const confirm = () => {
  const selected = props.changedNotes.filter(n => selectedIds.value.includes(n.id))
  emit('confirm', selected)
}
</script>