<template>
  <div class="rounded-lg overflow-hidden transition-shadow duration-200" :class="isDark ? 'bg-[#16213e]' : 'bg-white'" style="box-shadow: 0 2px 12px rgba(0,0,0,0.08)">
    <div
      class="flex items-center gap-2 p-4 cursor-pointer transition-colors"
      :class="isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'"
      @click="toggle"
    >
      <el-icon :size="18" :style="{ color: isDark ? '#60a5fa' : '#1e3a5f' }">
        <component :is="icon" />
      </el-icon>
      <span class="font- bold" :class="isDark ? 'text-white' : 'text-gray-800'">{{ title }}</span>
      <el-icon class="ml-auto transition-transform duration-200" :class="{ 'rotate-180': isExpanded }">
        <ArrowDown />
      </el-icon>
    </div>
    <transition name="slide-zoom">
      <div v-if="isExpanded" class="p-4 pt-0" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  title: String,
  icon: Object,
  isDark: Boolean,
  defaultExpanded: {
    type: Boolean,
    default: true
  }
})

const isExpanded = ref(props.defaultExpanded)

const toggle = () => {
  isExpanded.value = !isExpanded.value
}
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