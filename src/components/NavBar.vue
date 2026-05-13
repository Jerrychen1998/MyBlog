<template>
  <nav class="fixed top-0 left-0 right-0 z-50 h-14 md:h-[60px] transition-all duration-300"
       :class="[
         isScrolled ? 'shadow-lg' : '',
         isDark ? 'bg-[#16213e]' : 'bg-white'
       ]">
    <div class="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        @click="showMobileMenu = !showMobileMenu"
      >
        <el-icon :size="24"><Menu /></el-icon>
      </button>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-6">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="text-sm font-medium transition-colors hover:text-[#3b82f6]"
          :class="isDark ? 'text-gray-300' : 'text-gray-700'"
          active-class="!text-[#3b82f6]"
        >
          {{ item.name }}
        </router-link>
      </div>

      <!-- Logo / Title for Mobile -->
      <div class="md:hidden font-bold text-lg" :class="isDark ? 'text-white' : 'text-[#1e3a5f]'">
        个人博客
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-3">
        <!-- Theme Toggle -->
        <button
          @click="$emit('toggle-theme')"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
        >
          <el-icon :size="20" class="transition-transform duration-300">
            <Sunny v-if="isDark" />
            <Moon v-else />
          </el-icon>
        </button>

        <!-- GitHub Link -->
        <a
          href="https://github.com/your-username/your-repo"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:rotate-180"
          title="GitHub仓库"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-zoom">
      <div
        v-if="showMobileMenu"
        class="md:hidden absolute top-full left-0 right-0 shadow-lg"
        :class="isDark ? 'bg-[#16213e]' : 'bg-white'"
      >
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="block px-4 py-3 border-b dark:border-gray-700"
          :class="isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'"
          @click="showMobileMenu = false"
        >
          {{ item.name }}
        </router-link>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { Sunny, Moon, Menu } from '@element-plus/icons-vue'

const props = defineProps({
  isDark: Boolean
})

defineEmits(['toggle-theme'])

const isDark = inject('isDark')
const showMobileMenu = ref(false)
const isScrolled = ref(false)

const navItems = [
  { name: '首页', path: '/' },
  { name: '个人简历', path: '/resume' },
  { name: '文本编辑器', path: '/editor' }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.slide-zoom-enter-active,
.slide-zoom-leave-active {
  transition: all 0.2s ease;
}
.slide-zoom-enter-from,
.slide-zoom-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>