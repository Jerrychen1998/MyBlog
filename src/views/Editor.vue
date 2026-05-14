<template>
  <!-- Login Screen -->
  <div v-if="!unlocked" class="min-h-[calc(100vh-60px)] flex items-center justify-center p-4">
    <div class="text-center w-full max-w-md">
      <svg class="w-12 h-12 mx-auto mb-4" :class="isDark ? 'text-cyan-400' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
      <h1 class="font-bold text-xl md:text-2xl mb-2" :class="isDark ? 'text-white' : 'text-gray-800'">多标签云端文本编辑器</h1>
      <p class="text-sm mb-6" :class="isDark ? 'text-gray-400' : 'text-gray-500'">端到端加密，同一密码 = 同一空间，跨设备同步</p>

      <!-- Existing Spaces List -->
      <div v-if="spaces.length > 0 && !showNewSpace" class="mb-6 text-left">
        <p class="text-xs mb-2" :class="isDark ? 'text-gray-400' : 'text-gray-500'">已有空间</p>
        <div
          v-for="(space, idx) in spaces"
          :key="space.id"
          class="flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-colors"
          :class="isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'"
          @click="selectedSpaceIdx = idx"
        >
          <div class="flex items-center gap-2">
            <el-icon :size="18" :class="selectedSpaceIdx === idx ? 'text-blue-500' : ''">
              <component :is="selectedSpaceIdx === idx ? 'CircleCheckFilled' : 'FolderOpened'" />
            </el-icon>
            <span class="text-sm" :class="isDark ? 'text-gray-200' : 'text-gray-700'">
              空间 {{ idx + 1 }}
              <span class="text-xs opacity-50 ml-1">({{ space.id.substring(0, 6) }}...)</span>
            </span>
          </div>
          <el-button size="small" type="danger" link @click.stop="deleteSpace(idx)">删除</el-button>
        </div>
      </div>

      <!-- Password Input -->
      <el-form @submit.prevent="handleUnlock" class="mb-2">
        <el-input
          v-model="loginPassword"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="spaces.length > 0 && !showNewSpace ? '输入密码解锁所选空间' : '输入密码创建/进入空间'"
          size="large"
          class="mb-3"
        >
          <template #suffix>
            <el-icon class="cursor-pointer" @click="showPassword = !showPassword">
              <View v-if="!showPassword" /><Hide v-else />
            </el-icon>
          </template>
        </el-input>
        <el-input
          v-if="showNewSpace"
          v-model="loginConfirm"
          type="password"
          placeholder="再次输入确认"
          size="large"
          class="mb-3"
        />
        <el-button type="primary" size="large" class="w-full" :loading="loginLoading" @click="handleUnlock">
          {{ spaces.length > 0 && !showNewSpace ? '解锁进入' : '创建并进入' }}
        </el-button>
      </el-form>

      <el-button v-if="spaces.length > 0 && !showNewSpace" size="small" class="mt-1" link @click="showNewSpace = true; selectedSpaceIdx = -1; loginPassword = ''; loginConfirm = ''">
        或创建新空间
      </el-button>
      <el-button v-if="showNewSpace && spaces.length > 0" size="small" class="mt-1" link @click="showNewSpace = false; selectedSpaceIdx = 0; loginPassword = ''; loginConfirm = ''">
        返回选择已有空间
      </el-button>

      <p v-if="errorMsg" class="text-red-400 text-xs mt-3">{{ errorMsg }}</p>
    </div>
  </div>

  <!-- Editor (unlocked) -->
  <div v-else class="h-[calc(100vh-60px)] flex flex-col" :class="isDark ? 'bg-primary-dark' : 'bg-primary-light'">
    <div class="flex items-center justify-between px-4 py-2">
      <div class="text-center flex-1">
        <h1 class="font-bold" :class="[isMobile ? 'text-lg' : 'text-xl', isDark ? 'text-cyan-400' : 'text-cyan-700']">多标签云端文本编辑器</h1>
        <p class="text-xs opacity-50">空间 {{ currentSpaceId.substring(0, 8) }}...</p>
      </div>
      <el-button size="small" link @click="lockEditor" title="锁定并切换空间">
        <el-icon><Lock /></el-icon>
      </el-button>
    </div>

    <div class="flex items-center gap-2 px-3 py-1 overflow-x-auto" :class="isDark ? 'bg-[#16213e]' : 'bg-white'" style="min-height: 44px">
      <template v-if="!isMobile">
        <div v-for="note in notes" :key="note.id"
          class="flex items-center gap-1 px-3 py-1 rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap"
          :class="[activeNoteId === note.id ? 'ring-2 ring-blue-500' : '',
            note.isArchive ? (isDark ? 'bg-cyan-900 text-cyan-300' : 'bg-cyan-100 text-cyan-700')
              : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')]"
          @click="switchNote(note.id)">
          <span class="max-w-28 truncate" @dblclick="startRename(note)">{{ note.title || '未命名' }}</span>
          <el-icon v-if="note.isArchive" :size="12" class="text-cyan-500"><Check /></el-icon>
          <el-icon :size="14" class="hover:text-red-500 ml-1" @click.stop="closeNote(note)"><Close /></el-icon>
        </div>
      </template>
      <template v-else>
        <el-select v-model="activeNoteId" placeholder="选择笔记" class="w-36" @change="switchNote" size="small">
          <el-option v-for="note in notes" :key="note.id" :label="note.title || '未命名'" :value="note.id" />
        </el-select>
        <el-button size="small" @click="closeNote(getCurrentNote())"><el-icon><Close /></el-icon></el-button>
      </template>
      <el-button type="primary" size="small" circle @click="createNote"><el-icon><Plus /></el-icon></el-button>
    </div>

    <div class="flex-1 mx-3 mb-2 rounded-lg overflow-hidden border transition-colors duration-200"
      :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      :style="{ minHeight: isMobile ? '50vh' : '60vh' }">
      <div class="flex items-center gap-1 px-3 py-1.5 border-b" :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'">
        <template v-if="!isMobile">
          <el-button size="small" @click="formatText('bold')" :disabled="!selectedText">B</el-button>
          <el-button size="small" @click="formatText('italic')" :disabled="!selectedText"><em>I</em></el-button>
          <el-button size="small" @click="formatText('underline')" :disabled="!selectedText"><u>U</u></el-button>
        </template>
        <el-button size="small" @click="undo" :disabled="!canUndo"><el-icon><RefreshLeft /></el-icon></el-button>
        <el-button size="small" @click="redo" :disabled="!canRedo"><el-icon><RefreshRight /></el-icon></el-button>
        <el-button size="small" @click="clearText"><el-icon><Delete /></el-icon></el-button>
        <el-button size="small" @click="startRename(getCurrentNote())"><el-icon><EditPen /></el-icon></el-button>
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
      <textarea ref="textareaRef" v-model="currentContent"
        class="w-full h-full p-4 resize-none focus:outline-none"
        :class="[isDark ? 'bg-gray-900 text-gray-200 placeholder-gray-600' : 'bg-white text-gray-800 placeholder-gray-400']"
        :style="{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.5', minHeight: isMobile ? '40vh' : '50vh' }"
        placeholder="在这里输入文本..." @input="handleInput" @select="handleSelect"></textarea>
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

    <!-- Dialogs (same as before) -->
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
import { Plus, Close, Check, EditPen, RefreshLeft, RefreshRight, Delete, Upload, Download, Refresh, View, Hide, FolderOpened, CircleCheckFilled, Lock } from '@element-plus/icons-vue'

const isDark = inject('isDark')
const cloud = useCloudStorage()
const crypto = useCrypto()

const isMobile = ref(window.innerWidth < 768)
const notes = ref([])
const activeNoteId = ref('')
const currentContent = ref('')
const originalContent = ref('')
const selectedText = ref('')
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
const spaces = ref([])
const selectedSpaceIdx = ref(-1)
const showNewSpace = ref(false)
const loginPassword = ref('')
const loginConfirm = ref('')
const showPassword = ref(false)
const loginLoading = ref(false)
const errorMsg = ref('')
const currentSpaceId = ref('')

const currentNote = computed(() => notes.value.find(n => n.id === activeNoteId.value))
const hasChanges = computed(() => currentContent.value !== originalContent.value)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)
const getCurrentNote = () => currentNote.value

const lockEditor = () => {
  unlocked.value = false
  loginPassword.value = ''
  loginConfirm.value = ''
  errorMsg.value = ''
  showNewSpace.value = false
}

const handleUnlock = async () => {
  errorMsg.value = ''
  if (!loginPassword.value) { errorMsg.value = '请输入密码'; return }

  const isCreating = showNewSpace.value || spaces.value.length === 0
  if (isCreating) {
    if (loginPassword.value.length < 6) { errorMsg.value = '密码至少6位'; return }
    if (loginPassword.value !== loginConfirm.value) { errorMsg.value = '两次密码不一致'; return }
  }

  loginLoading.value = true

  if (isCreating) {
    const spaceId = await crypto.setupSpace(loginPassword.value)
    currentSpaceId.value = spaceId
  } else {
    if (selectedSpaceIdx.value < 0) { errorMsg.value = '请先选择一个空间'; loginLoading.value = false; return }
    const space = spaces.value[selectedSpaceIdx.value]
    const result = await crypto.unlock(loginPassword.value)
    if (!result.success || result.spaceId !== space.id) {
      errorMsg.value = '密码错误'
      loginLoading.value = false
      return
    }
    currentSpaceId.value = result.spaceId
  }

  cloud.setCrypto(
    (text) => crypto.encrypt(text),
    (text) => crypto.decrypt(text),
    (sid) => crypto.getNotesKey(sid),
    (sid) => crypto.getArchivePath(sid),
    () => crypto.getCurrentSpaceId()
  )

  await initNotes()
  unlocked.value = true
  loginLoading.value = false
}

const deleteSpace = (idx) => {
  const space = spaces.value[idx]
  localStorage.removeItem(crypto.getNotesKey(space.id))
  spaces.value.splice(idx, 1)
  crypto.getSpaces() // refresh
  const all = JSON.parse(localStorage.getItem('crypto-spaces') || '[]')
  all.splice(idx, 1)
  localStorage.setItem('crypto-spaces', JSON.stringify(all))
  if (spaces.value.length === 0) showNewSpace.value = true
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
  const note = { id: uuidv4(), title: `未命名文本${notes.value.length + 1}`, content: '', createTime: Date.now(), updateTime: Date.now(), isArchive: false }
  notes.value.push(note)
  cloud.saveNotes(notes.value)
  switchNote(note.id)
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
    try { await ElMessageBox.confirm('该文本未保存到云端，确定关闭吗？', '提示', { type: 'warning' }) } catch { return }
  }
  const idx = notes.value.findIndex(n => n.id === note.id)
  if (idx > -1) {
    notes.value.splice(idx, 1)
    await cloud.saveNotes(notes.value)
    if (notes.value.length === 0) createNote()
    else if (activeNoteId.value === note.id) switchNote(notes.value[Math.max(0, idx - 1)].id)
  }
}

const startRename = (note) => { if (!note) return; renamingNote.value = note; newTitle.value = note.title; showRenameDialog.value = true }

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

const handleSelect = () => { selectedText.value = window.getSelection().toString() }

const formatText = (cmd) => {
  if (!selectedText.value) { ElMessage.warning('请先选中文本'); return }
  const f = { bold: '**', italic: '*', underline: '__' }[cmd]
  if (!f) return
  const ta = textareaRef.value
  const s = ta.selectionStart, e = ta.selectionEnd
  currentContent.value = currentContent.value.substring(0, s) + f + currentContent.value.substring(s, e) + f + currentContent.value.substring(e)
  handleInput()
}

const saveToHistory = (c) => {
  if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(c)
  if (history.value.length > maxHistory) history.value.shift()
  else historyIndex.value++
}

const undo = () => { if (canUndo.value) { historyIndex.value--; currentContent.value = history.value[historyIndex.value]; handleInput() } }
const redo = () => { if (canRedo.value) { historyIndex.value++; currentContent.value = history.value[historyIndex.value]; handleInput() } }

const clearText = async () => {
  try { await ElMessageBox.confirm('确定清空当前文本吗？', '提示', { type: 'warning' }) } catch { return }
  currentContent.value = ''; handleInput(); ElMessage.success('已清空')
}

const saveToCloud = async () => {
  if (!currentContent.value.trim()) { ElMessage.warning('文本内容为空，无需同步'); return }
  saving.value = true
  if (await cloud.syncNoteToCloud(currentNote.value)) {
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
  const r = await cloud.refreshCloudData()
  if (r.conflicts?.length) { conflicts.value = r.conflicts; showConflictDialog.value = true }
  else if (r.success) { notes.value = r.data || []; ElMessage.success('云端数据已同步') }
  refreshing.value = false
}

const handleConflict = async (overwrite) => {
  if (overwrite) notes.value = notes.value.map(n => conflicts.value.find(c => c.id === n.id) || n)
  await cloud.saveNotes(notes.value)
  showConflictDialog.value = false
  ElMessage.success('冲突已处理')
}

const saveConfig = () => { cloud.saveGithubConfig(githubConfig.value); showConfigDialog.value = false; ElMessage.success('配置已保存') }

const handleResize = () => { isMobile.value = window.innerWidth < 768 }

onMounted(() => {
  spaces.value = crypto.getSpaces()
  showNewSpace.value = spaces.value.length === 0
  if (spaces.value.length > 0) selectedSpaceIdx.value = 0

  const config = cloud.loadGithubConfig()
  githubConfig.value = { ...config }
  if (!config.owner || !config.repo) {
    setTimeout(() => { if (unlocked.value) showConfigDialog.value = true }, 1000)
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => { window.removeEventListener('resize', handleResize) })
</script>