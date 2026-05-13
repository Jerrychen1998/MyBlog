<template>
  <div :class="{ dark: isDark }" class="min-h-screen transition-colors duration-300">
    <NavBar :is-dark="isDark" @toggle-theme="toggleTheme" />
    <main class="pt-16 md:pt-[60px]">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <SyncDialog
      v-model:visible="showSyncDialog"
      :changed-notes="changedNotes"
      @confirm="handleSyncConfirm"
      @cancel="handleSyncCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide } from 'vue'
import NavBar from './components/NavBar.vue'
import SyncDialog from './components/SyncDialog.vue'
import { useTheme } from './composables/useTheme'
import { useCloudStorage } from './composables/useCloudStorage'

const { isDark, toggleTheme, initTheme } = useTheme()
const { changedNotes, showSyncDialog, handleSyncConfirm, handleSyncCancel, setupSyncInterceptor } = useCloudStorage()

provide('isDark', isDark)
provide('toggleTheme', toggleTheme)

onMounted(() => {
  initTheme()
  setupSyncInterceptor()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const handleBeforeUnload = (e) => {
  if (changedNotes.value.length > 0) {
    e.preventDefault()
    e.returnValue = ''
  }
}
</script>