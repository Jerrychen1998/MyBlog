<template>
  <div class="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center py-8 md:py-12 px-4">
    <!-- Personal Display Area -->
    <div class="text-center mb-8 md:mb-12 animate-slide-up">
      <!-- Avatar -->
      <div class="mb-4 md:mb-6">
        <el-avatar
          :size="isMobile ? 80 : 120"
          :src="avatarUrl"
          class="cursor-pointer hover:scale-105 transition-transform duration-300"
          @click="showAvatarPreview = true"
        >
          <el-avatar :size="isMobile ? 80 : 120">头像</el-avatar>
        </el-avatar>
      </div>

      <!-- Name -->
      <h1 class="font-bold mb-3 md:mb-4" :class="isMobile ? 'text-xl' : 'text-2xl'" :style="{ color: isDark ? '#60a5fa' : '#1e3a5f' }">
        {{ profile.name }}
      </h1>

      <!-- Tags -->
      <div class="flex flex-wrap justify-center gap-2 mb-4 md:mb-6">
        <span
          v-for="tag in profile.tags"
          :key="tag"
          class="px-3 py-1 rounded-full text-xs md:text-sm cursor-pointer transition-all duration-200 hover:scale-105"
          :class="isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'"
          @click="handleTagClick(tag)"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Bio -->
      <p class="max-w-lg mx-auto leading-relaxed" :class="[isMobile ? 'text-sm' : 'text-base', isDark ? 'text-gray-400' : 'text-gray-600']">
        {{ profile.bio }}
      </p>
    </div>

    <!-- Quick Entry Cards -->
    <div
      class="w-full max-w-2xl flex gap-4 md:gap-5"
      :class="isMobile ? 'flex-col' : 'flex-row'"
    >
      <router-link
        to="/resume"
        class="flex-1 card-hover rounded-xl p-5 md:p-6 transition-all duration-200 hover:scale-105 active:scale-[0.98] text-center"
        :class="isDark ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-800'"
        style="box-shadow: 0 2px 12px rgba(0,0,0,0.08)"
      >
        <svg class="w-8 md:w-10 h-8 md:h-10 mx-auto mb-3" :class="isDark ? 'text-cyan-400' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <span class="font-medium" :class="isMobile ? 'text-base' : 'text-lg'">个人简历</span>
      </router-link>

      <router-link
        to="/editor"
        class="flex-1 card-hover rounded-xl p-5 md:p-6 transition-all duration-200 hover:scale-105 active:scale-[0.98] text-center"
        :class="isDark ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-800'"
        style="box-shadow: 0 2px 12px rgba(0,0,0,0.08)"
      >
        <svg class="w-8 md:w-10 h-8 md:h-10 mx-auto mb-3" :class="isDark ? 'text-cyan-400' : 'text-blue-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        <span class="font-medium" :class="isMobile ? 'text-base' : 'text-lg'">文本编辑器</span>
      </router-link>
    </div>

    <!-- Footer -->
    <footer class="mt-auto pt-8 md:pt-12 text-center">
      <p class="text-xs md:text-sm" :class="isDark ? 'text-cyan-400' : 'text-blue-400'">
        © 2026 个人博客 | 基于GitHub Pages部署
      </p>
    </footer>

    <!-- Avatar Preview Dialog -->
    <el-dialog v-model="showAvatarPreview" width="90%" title="头像预览" center>
      <div class="flex justify-center">
        <el-avatar :size="250" :src="avatarUrl">
          <el-avatar :size="250">头像</el-avatar>
        </el-avatar>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { ElMessage } from 'element-plus'

const isDark = inject('isDark')

const isMobile = ref(window.innerWidth < 768)
const showAvatarPreview = ref(false)

const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')

const profile = ref({
  name: '陈星全',
  tags: ['后端开发', 'C#工程师', '技术爱好者'],
  bio: '专注后端开发，热衷于技术研究与创新。擅长C#/.NET开发，具备扎实的编程基础和良好的代码编写习惯。追求高质量、高性能的技术解决方案。'
})

const handleTagClick = (tag) => {
  ElMessage.info(`标签 "${tag}" - 功能开发中`)
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out;
}
</style>