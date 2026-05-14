<template>
  <!-- Login Overlay -->
  <div v-if="!unlocked" class="min-h-[calc(100vh-60px)] flex items-center justify-center p-4">
    <div class="text-center w-full max-w-md">
      <svg class="w-12 h-12 mx-auto mb-4" :class="isDark ? 'text-cyan-400' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
      <h1 class="font-bold text-xl md:text-2xl mb-2" :class="isDark ? 'text-white' : 'text-gray-800'">多标签云端文本编辑器</h1>
      <p class="text-sm mb-6" :class="isDark ? 'text-gray-400' : 'text-gray-500'">加密保护你的文本数据，跨设备同步</p>

      <el-form @submit.prevent="handleUnlock">
        <el-input
          v-model="loginPassword"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="isSetup ? '设置主密码（至少6位）' : '输入主密码解锁'"
          size="large"
          class="mb-3"
        >
          <template #suffix>
            <el-icon class="cursor-pointer" @click="showPassword = !showPassword">
              <View v-if="!showPassword" />
              <Hide v-else />
            </el-icon>
          </template>
        </el-input>

        <el-input
          v-if="isSetup"
          v-model="loginConfirm"
          type="password"
          placeholder="再次输入确认"
          size="large"
          class="mb-3"
        />

        <el-button
          type="primary"
          size="large"
          class="w-full"
          :loading="loginLoading"
          @click="handleUnlock"
        >
          {{ isSetup ? '设置并进入编辑器' : '解锁进入编辑器' }}
        </el-button>

        <el-button
          v-if="!isSetup"
          size="large"
          class="w-full mt-3"
          @click="switchSpace"
        >
          创建新空间
        </el-button>
      </el-form>
    </div>
  </div>

  <!-- Editor (unlocked) -->
  <div v-else class="h-[calc(100vh-60px)] flex flex-col" :class="isDark ? 'bg-primary-dark' : 'bg-primary-light'">
    <div class="text-center py-3 md:py-4" :class="isDark ? 'text-cyan-400' : 'text-cyan-700'">
      <h1 class="font-bold" :class="isMobile ? 'text-xl' : 'text-2xl'">多标签云端文本编辑器</h1>
    </div>

    <div class="flex items-center gap-2 px-3 py-2 overflow-x-auto" :class="isDark ? 'bg-[#16213e]' : 'bg-white'" style="min-height: 48px">
      <template v-if="!isMobile">
        <div
          v-for="note in notes"
          :key="note.id"
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap"
          :class="[
            activeNoteId === note.id ? 'ring-2 ring-blue-500' : '',
            note.isArchive
              ? isDark ? 'bg-cyan-900 text-cyan-300' : 'bg-cyan-100 text-cyan-700'
              : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          ]"
          @click="switchNote(note.id)"
        >
          <span class="max-w-24 truncate" @dblclick="startRename(note)">{{ note.title || '未命名文本' }}</span>
          <el-icon v-if="note.isArchive" :size="12" class="text-cyan-500"><Check /></el-icon>
          <el-icon :size="14" class="hover:text-red-500 ml-1" @click.stop="closeNote(note)"><Close /></el-icon>
        </div>
      </template>
      <template v-else>
        <el-select v-model="activeNoteId" placeholder="选择笔记" class="w-40" @change="switchNote">
          <el-option v-for="note in notes" :key="note.id" :label="note.title || '未命名文本'" :value="note.id" />
        </el-select>
        <el-button size="small" @click="closeNote(getCurrentNote())"><el-icon><Close /></el-icon></el-button>
      </template>
      <el-button type="primary" size="small" circle @click="createNote"><el-icon><Plus /></el-icon></el-button>
      <el-button v-if="!isMobile && notes.length > 1" size="small" @click="showSortable = !showSortable"><el-icon><Rank /></el-icon></el-button>
    </div>

    <div class="flex-1 mx-3 mb-3 rounded-lg overflow-hidden border transition-colors duration-200" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'" :style="{ minHeight: isMobile ? '50vh' : '60vh' }">
      <div class="flex items-center gap-1 px-3 py-2 border-b" :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'">
        <template v-if="!isMobile">
          <el-button size="small" @click="formatText('bold')" :disabled="!selectedText">B</el-button>
          <el-button size="small" @click="formatText('italic')" :disabled="!selectedText"><em>I</em></el-button>
          <el-button size="small" @click="formatText('underline')" :disabled="!selectedText"><u>U</u></el-button>
        </template>
        <el-tooltip content="撤销" placement="top">
          <el-button size="small" @click="undo" :disabled="!canUndo"><el-icon><RefreshLeft /></el-icon></el-button>
        </el-tooltip>
        <el-tooltip content="重做" placement="top">
          <el-button size="small" @click="redo" :disabled="!canRedo"><el-icon><RefreshRight /></el-icon></el-button>
        </el-tooltip>
        <el-tooltip content="清空文本" placement="top">
          <el-button size="small" @click="clearText"><el-icon><Delete /></el-icon></el-button>
        </el-tooltip>
        <el-tooltip content="重命名" placement="top">
          <el-button size="small" @click="startRename(getCurrentNote())"><el-icon><EditPen /></el-icon></el-button>
        </el-tooltip>
        <el-dropdown v-if="isMobile" @command="formatText" class="ml-auto">
          <el-button size="small">更多</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="bold">加粗</el-dropdown-item>
              <el-dropdown-item command="italic">斜体</el-dropdown-item>
              <el-dropdown-item command="underline">下划线</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <textarea
        ref="textareaRef"
        v-model="currentContent"
        class="w-full h-full p-4 resize-none focus:outline-none"
        :class="[isDark ? 'bg-gray-900 text-gray-200 placeholder-gray-600' : 'bg-white text-gray-800 placeholder-gray-400']"
        :style="{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.5', minHeight: isMobile ? '40vh' : '50vh' }"
        placeholder="在这里输入文本..."
        @input="handleInput"
        @select="handleSelect"
      ></textarea>
    </div>

    <div class="flex gap-3 px-3 pb-4" :class="isMobile ? 'flex-col' : 'flex-row justify-center'">
      <el-button type="primary" :disabled="!currentNote || !hasChanges" @click="saveToCloud" :loading="saving" class="min-w-[120px]">
        <el-icon class="mr-1"><Upload /></el-icon>保存到云端
      </el-button>
      <el-button v-if="currentNote?.isArchive" @click="unarchiveNote" :loading="unarchiving" class="min-w-[120px]">
        <el-icon class="mr-1"><Download /></el-icon>取消归档
      </el-button>
      <el-button @click="refreshCloud" :loading="refreshing" class="min-w-[120px]">
        <el-icon class="mr-1"><Refresh /></el-icon>刷新云端数据
      </el-button>
    </div>

    <el-dialog v-model="showRenameDialog" title="重命名" width="300px" center>
      <el-input v-model="newTitle" placeholder="输入新标题" @keyup.enter="confirmRename" />
      <template #footer>
        <el-button @click="showRenameDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showConfigDialog" title="GitHub配置" width="400px" center>
      <el-form label-width="80px">
        <el-form-item label="Owner"><el-input v-model="githubConfig.owner" placeholder="GitHub用户名" /></el-form-item>
        <el-form-item label="仓库名"><el-input v-model="githubConfig.repo" placeholder="仓库名称" /></el-form-item>
        <el-form-item label="Token"><el-input v-model="githubConfig.token" type="password" placeholder="GitHub Personal Access Token" show-password /></el-form-item>
      </el-form>
      <p class="text-xs text-gray-500 mt-2">需要repo权限的Token</p>
      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showConflictDialog" title="数据冲突" width="400px" center>
      <p class="mb-4">发现冲突文本，是否用云端内容覆盖本地？</p>
      <div class="max-h-40 overflow-y-auto">
        <div v-for="c in conflicts" :key="c.id" class="p-2 mb-2 rounded" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">{{ c.title }}</div>
      </div>
      <template #footer>
        <el-button @click="handleConflict(false)">保留本地</el-button>
        <el-button type="primary" @click="handleConflict(true)">覆盖本地</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Sortable from 'sortablejs'
import { v4 as uuidv4 } from 'uuid'
import { useCloudStorage } from '../composables/useCloudStorage'
import { useCrypto } from '../composables/useCrypto'
import { Plus, Close, Check, Rank, EditPen, RefreshLeft, RefreshRight, Delete, Upload, Download, Refresh, View, Hide } from '@element-plus/icons-vue'

const isDark = inject('isDark')
const cloud = useCloudStorage()
const crypto = useCrypto()

const isMobile = ref(window.innerWidth < 768)
const notes = ref([])
const activeNoteId = ref('')
const currentContent = ref('')
const originalContent = ref('')
const selectedText = ref('')
const showSortable = ref(false)
const showRenameDialog = ref(false)
const showConfigDialog = ref(false)
const showConflictDialog = ref(false)
const newTitle = ref('')
const renamingNote = ref(null)
const conflicts = ref([])
const saving = ref(false)
const unarchiving = ref(false)
const refreshing = ref(false)
const textareaRef = ref(null)
const githubConfig = ref({ owner: '', repo: '', token: '' })
const history = ref([])
const historyIndex = ref(-1)
const maxHistory = 50

// Login state
const unlocked = ref(false)
const isSetup = ref(false)
const loginPassword = ref('')
const loginConfirm = ref('')
const showPassword = ref(false)
const loginLoading = ref(false)

const currentNote = computed(() => notes.value.find(n => n.id === activeNoteId.value))
const hasChanges = computed(() => currentContent.value !== originalContent.value)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)
const getCurrentNote = () => currentNote.value

const handleUnlock = async () => {
  if (!loginPassword.value) {
    ElMessage.warning('请输入密码')
    return
  }
  if (isSetup.value) {
    if (loginPassword.value.length < 6) {
      ElMessage.warning('密码至少6位')
      return
    }
    if (loginPassword.value !== loginConfirm.value) {
      ElMessage.warning('两次密码不一致')
      return
    }
  }
  loginLoading.value = true
  try {
    if (isSetup.value) {
      await crypto.setupPassword(loginPassword.value)
    } else {
      const ok = await crypto.unlock(loginPassword.value)
      if (!ok) {
        ElMessage.error('密码错误')
        loginLoading.value = false
        return
      }
    }
    cloud.setCrypto(
      (text) => crypto.encrypt(text),
      (text) => crypto.decrypt(text)
    )
    await initNotes()
    unlocked.value = true
  } catch (e) {
    ElMessage.error('解锁失败，请重试')
    console.error(e)
  }
  loginLoading.value = false
}

const switchSpace = () => {
  localStorage.removeItem('crypto-salt')
  localStorage.removeItem('crypto-verify')
  localStorage.removeItem('editor-notes')
  isSetup.value = true
  loginPassword.value = ''
  loginConfirm.value = ''
  ElMessage.success('已切换到新空间模式，请输入新密码')
}

const initNotes = async () => {
  const saved = await cloud.getNotes()
  if (saved.length === 0) {
    createNote()
  } else {
    notes.value = saved
    activeNoteId.value = saved[0].id
    currentContent.value = saved[0].content || ''
    originalContent.value = saved[0].content || ''
    saveToHistory(saved[0].content || '')
  }
}

const createNote = () => {
  const newNote = {
    id: uuidv4(),
    title: `未命名文本${notes.value.length + 1}`,
    content: '',
    createTime: Date.now(),
    updateTime: Date.now(),
    isArchive: false
  }
  notes.value.push(newNote)
  cloud.saveNotes(notes.value)
  switchNote(newNote.id)
  ElMessage.success('已创建新文本')
}

const switchNote = async (noteId) => {
  if (currentNote.value && hasChanges.value) {
    currentNote.value.content = currentContent.value
    currentNote.value.updateTime = Date.now()
    cloud.markNoteChanged(currentNote.value)
    await cloud.saveNotes(notes.value)
  }
  const note = notes.value.find(n => n.id === noteId)
  if (note) {
    activeNoteId.value = noteId
    currentContent.value = note.content || ''
    originalContent.value = note.content || ''
    history.value = [note.content || '']
    historyIndex.value = 0
  }
}

const closeNote = async (note) => {
  if (!note) return
  if (!note.isArchive && note.content && hasChanges.value) {
    try {
      await ElMessageBox.confirm('该文本未保存到云端，确定关闭吗？', '提示', { type: 'warning' })
    } catch { return }
  }
  const index = notes.value.findIndex(n => n.id === note.id)
  if (index > -1) {
    notes.value.splice(index, 1)
    await cloud.saveNotes(notes.value)
    if (notes.value.length === 0) {
      createNote()
    } else if (activeNoteId.value === note.id) {
      switchNote(notes.value[Math.max(0, index - 1)].id)
    }
  }
}

const startRename = (note) => {
  if (!note) return
  renamingNote.value = note
  newTitle.value = note.title
  showRenameDialog.value = true
}

const confirmRename = async () => {
  if (renamingNote.value && newTitle.value.trim()) {
    renamingNote.value.title = newTitle.value.trim()
    renamingNote.value.updateTime = Date.now()
    cloud.markNoteChanged(renamingNote.value)
    await cloud.saveNotes(notes.value)
    ElMessage.success('重命名成功')
  }
  showRenameDialog.value = false
}

const handleInput = async () => {
  if (!hasChanges.value) cloud.markNoteChanged(currentNote.value)
  saveToHistory(currentContent.value)
  currentNote.value.content = currentContent.value
  currentNote.value.updateTime = Date.now()
  await cloud.saveNotes(notes.value)
}

const handleSelect = () => {
  selectedText.value = window.getSelection().toString()
}

const formatText = (command) => {
  if (!selectedText.value) { ElMessage.warning('请先选中要格式化的文本'); return }
  const fmt = { bold: '**', italic: '*', underline: '__' }
  const f = fmt[command]
  if (!f) return
  const ta = textareaRef.value
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const sel = currentContent.value.substring(start, end)
  currentContent.value = currentContent.value.substring(0, start) + f + sel + f + currentContent.value.substring(end)
  handleInput()
}

const saveToHistory = (content) => {
  if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(content)
  if (history.value.length > maxHistory) history.value.shift()
  else historyIndex.value++
}

const undo = () => {
  if (canUndo.value) { historyIndex.value--; currentContent.value = history.value[historyIndex.value]; handleInput() }
}

const redo = () => {
  if (canRedo.value) { historyIndex.value++; currentContent.value = history.value[historyIndex.value]; handleInput() }
}

const clearText = async () => {
  try { await ElMessageBox.confirm('确定清空当前文本吗？', '提示', { type: 'warning' }) } catch { return }
  currentContent.value = ''; handleInput(); ElMessage.success('已清空')
}

const saveToCloud = async () => {
  if (!currentContent.value.trim()) { ElMessage.warning('文本内容为空，无需同步'); return }
  saving.value = true
  const ok = await cloud.syncNoteToCloud(currentNote.value)
  if (ok) {
    currentNote.value.isArchive = true
    originalContent.value = currentContent.value
    await cloud.saveNotes(notes.value)
    ElMessage.success('同步成功')
  }
  saving.value = false
}

const unarchiveNote = async () => {
  unarchiving.value = true
  currentNote.value.isArchive = false
  currentNote.value.updateTime = Date.now()
  await cloud.saveNotes(notes.value)
  cloud.markNoteChanged(currentNote.value)
  ElMessage.success('已取消归档')
  unarchiving.value = false
}

const refreshCloud = async () => {
  refreshing.value = true
  const result = await cloud.refreshCloudData()
  if (result.conflicts?.length) {
    conflicts.value = result.conflicts
    showConflictDialog.value = true
  } else if (result.success) {
    notes.value = result.data || []
    ElMessage.success('云端数据已同步')
  }
  refreshing.value = false
}

const handleConflict = async (覆盖) => {
  if (覆盖) {
    notes.value = notes.value.map(n => {
      const c = conflicts.value.find(c => c.id === n.id)
      return c ? { ...c, isArchive: true } : n
    })
  }
  await cloud.saveNotes(notes.value)
  showConflictDialog.value = false
  ElMessage.success('冲突已处理')
}

const saveConfig = () => {
  cloud.saveGithubConfig(githubConfig.value)
  showConfigDialog.value = false
  ElMessage.success('配置已保存')
}

const initSortable = () => {
  if (isMobile.value || !showSortable.value) return
  const el = document.querySelector('.flex.items-center.gap-2')
  if (el) {
    Sortable.create(el, { animation: 150, onEnd: (evt) => {
      const item = notes.value.splice(evt.oldIndex - 1, 1)[0]
      notes.value.splice(evt.newIndex - 1, 0, item)
      cloud.saveNotes(notes.value)
    }})
  }
}

const handleResize = () => { isMobile.value = window.innerWidth < 768 }

watch(showSortable, initSortable)

onMounted(() => {
  isSetup.value = !crypto.hasSetup()
  const config = cloud.loadGithubConfig()
  githubConfig.value = { ...config }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>