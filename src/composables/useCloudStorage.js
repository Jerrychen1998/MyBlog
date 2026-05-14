import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'editor-notes'
const CLOUD_CONFIG_KEY = 'github-config'

export function useCloudStorage() {
  const changedNotes = ref([])
  const showSyncDialog = ref(false)
  let encryptFn = null
  let decryptFn = null

  const GITHUB_CONFIG = {
    owner: '',
    repo: '',
    token: '',
    filePath: 'archive.json'
  }

  function setCrypto(encrypt, decrypt) {
    encryptFn = encrypt
    decryptFn = decrypt
  }

  const loadGithubConfig = () => {
    const saved = localStorage.getItem(CLOUD_CONFIG_KEY)
    if (saved) {
      Object.assign(GITHUB_CONFIG, JSON.parse(saved))
    }
    return GITHUB_CONFIG
  }

  const saveGithubConfig = (config) => {
    Object.assign(GITHUB_CONFIG, config)
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(GITHUB_CONFIG))
  }

  const getNotes = async () => {
    const notes = localStorage.getItem(STORAGE_KEY)
    const raw = notes ? JSON.parse(notes) : []
    if (!decryptFn) return raw
    const decrypted = []
    for (const n of raw) {
      try {
        n.content = n.content ? await decryptFn(n.content) : ''
      } catch {
        n.content = ''
      }
      decrypted.push(n)
    }
    return decrypted
  }

  const saveNotes = async (notes) => {
    const toSave = []
    for (const n of notes) {
      const note = { ...n }
      if (encryptFn && note.content) {
        try {
          note.content = await encryptFn(note.content)
        } catch { /* keep plaintext on encrypt failure */ }
      }
      toSave.push(note)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }

  const markNoteChanged = (note) => {
    const exists = changedNotes.value.find(n => n.id === note.id)
    if (!exists) {
      changedNotes.value.push({ ...note })
    }
  }

  const clearChangedNotes = () => {
    changedNotes.value = []
  }

  const fetchCloudData = async () => {
    const config = loadGithubConfig()
    if (!config.owner || !config.repo || !config.token) {
      ElMessage.warning('请先配置GitHub仓库信息')
      return null
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`,
        {
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const content = atob(data.content)
      const cloudNotes = JSON.parse(content)
      if (decryptFn) {
        for (const n of cloudNotes) {
          try {
            n.content = n.content ? await decryptFn(n.content) : ''
          } catch {
            n.content = ''
          }
        }
      }
      return cloudNotes
    } catch (error) {
      console.error('Failed to fetch cloud data:', error)
      ElMessage.error('拉取云端数据失败，请检查网络或配置')
      return null
    }
  }

  const uploadCloudData = async (notes) => {
    const config = loadGithubConfig()
    if (!config.owner || !config.repo || !config.token) {
      ElMessage.warning('请先配置GitHub仓库信息')
      return false
    }

    const toUpload = []
    for (const n of notes) {
      const note = { ...n }
      if (encryptFn && note.content) {
        try {
          note.content = await encryptFn(note.content)
        } catch { /* keep plaintext on encrypt failure */ }
      }
      toUpload.push(note)
    }

    const content = JSON.stringify(toUpload, null, 2)
    const encoded = btoa(unescape(encodeURIComponent(content)))

    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`,
        {
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      const sha = getResponse.ok ? (await getResponse.json()).sha : undefined

      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Update notes - ${new Date().toISOString()}`,
            content: encoded,
            sha
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.message && errorData.message.includes('permission')) {
          throw new Error('PERMISSION_DENIED')
        }
        throw new Error(`HTTP ${response.status}`)
      }

      return true
    } catch (error) {
      if (error.message === 'PERMISSION_DENIED') {
        ElMessage.error('GitHub仓库权限不足，请检查仓库设置')
      } else {
        console.error('Failed to upload cloud data:', error)
        ElMessage.error('同步失败，请检查网络后重试')
      }
      return false
    }
  }

  const syncNoteToCloud = async (note) => {
    const cloudData = await fetchCloudData()
    if (cloudData === null) return false

    const existingIndex = cloudData.findIndex(n => n.id === note.id)
    if (existingIndex >= 0) {
      cloudData[existingIndex] = { ...note, updateTime: Date.now() }
    } else {
      cloudData.push({ ...note, createTime: Date.now(), updateTime: Date.now() })
    }

    const success = await uploadCloudData(cloudData)
    if (success) {
      const localNotes = await getNotes()
      const localIndex = localNotes.findIndex(n => n.id === note.id)
      if (localIndex >= 0) {
        localNotes[localIndex].isArchive = true
        await saveNotes(localNotes)
      }
    }
    return success
  }

  const refreshCloudData = async () => {
    const cloudData = await fetchCloudData()
    if (cloudData === null) return { success: false, data: null }

    const localNotes = await getNotes()
    const conflicts = []

    cloudData.forEach(cloudNote => {
      const localNote = localNotes.find(n => n.id === cloudNote.id)
      if (localNote && localNote.isArchive && localNote.content !== cloudNote.content) {
        conflicts.push(cloudNote)
      }
    })

    if (conflicts.length > 0) {
      return { success: false, data: null, conflicts }
    }

    const archivedNotes = localNotes.filter(n => n.isArchive)
    const nonLocalCloudNotes = cloudData.filter(cn => !archivedNotes.find(an => an.id === cn.id))

    const mergedNotes = [...localNotes, ...nonLocalCloudNotes.map(n => ({ ...n, isArchive: true }))]
    await saveNotes(mergedNotes)

    return { success: true, data: mergedNotes }
  }

  const setupSyncInterceptor = () => {
    window.addEventListener('beforeunload', (e) => {
      if (changedNotes.value.length > 0) {
        showSyncDialog.value = true
        e.preventDefault()
        e.returnValue = ''
      }
    })
  }

  const handleSyncConfirm = async (selectedNotes) => {
    const config = loadGithubConfig()
    if (!config.owner || !config.repo || !config.token) {
      ElMessage.warning('请先配置GitHub仓库信息')
      return false
    }

    const cloudData = await fetchCloudData() || []
    const updatedNotes = [...cloudData]

    selectedNotes.forEach(note => {
      const existingIndex = updatedNotes.findIndex(n => n.id === note.id)
      if (existingIndex >= 0) {
        updatedNotes[existingIndex] = { ...note, updateTime: Date.now() }
      } else {
        updatedNotes.push({ ...note, createTime: Date.now(), updateTime: Date.now() })
      }
    })

    const success = await uploadCloudData(updatedNotes)
    if (success) {
      const localNotes = await getNotes()
      selectedNotes.forEach(selected => {
        const localIndex = localNotes.findIndex(n => n.id === selected.id)
        if (localIndex >= 0) {
          localNotes[localIndex].isArchive = true
        }
      })
      await saveNotes(localNotes)
      ElMessage.success('同步成功')
    }

    clearChangedNotes()
    showSyncDialog.value = false
    return success
  }

  const handleSyncCancel = () => {
    clearChangedNotes()
    showSyncDialog.value = false
  }

  return {
    changedNotes,
    showSyncDialog,
    setCrypto,
    getNotes,
    saveNotes,
    markNoteChanged,
    fetchCloudData,
    uploadCloudData,
    syncNoteToCloud,
    refreshCloudData,
    loadGithubConfig,
    saveGithubConfig,
    setupSyncInterceptor,
    handleSyncConfirm,
    handleSyncCancel
  }
}