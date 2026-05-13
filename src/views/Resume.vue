<template>
  <div class="min-h-[calc(100vh-60px)] py-6 md:py-10 px-3 md:px-4">
    <div :class="isMobile ? 'w-[90%]' : 'w-4/5'" class="mx-auto">
      <!-- Title -->
      <div class="text-center mb-6 md:mb-8">
        <h1 class="font--bold mb-2 md:mb-3" :class="isMobile ? 'text-2xl' : 'text-3xl'" :style="{ color: isDark ? '#60a5fa' : '#1e3a5f' }">
          个人简历
        </h1>
        <div class="w-20 h-0.5 mx-auto" :style="{ backgroundColor: isDark ? '#3b82f6' : '#1e3a5f' }"></div>
      </div>

      <!-- Resume Modules -->
      <div class="space-y-4 md:space-5">
        <!-- Basic Info Module -->
        <ResumeCard title="基础信息" :icon="User" :is-dark="isDark" :default-expanded="true">
          <div class="space-y-3">
            <div v-for="(item, index) in basicInfo" :key="index" class="flex items-start">
              <span class="font-bold w-20 shrink-0" :class="isDark ? 'text-cyan-300' : 'text-cyan-700'">{{ item.label }}:</span>
              <span class="flex-1 break-all" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                {{ item.value }}
                <template v-if="item.copyable">
                  <el-icon class="ml-2 cursor-pointer text-sm" @click="copyText(item.value)">
                    <DocumentCopy />
                  </el-icon>
                </template>
                <template v-if="item.expandable">
                  <el-icon class="ml-2 cursor-pointer text-sm" @click="showBasicDetail = !showBasicDetail">
                    <ArrowDown v-if="!showBasicDetail" />
                    <ArrowUp v-else />
                  </el-icon>
                </template>
              </span>
            </div>
            <div v-if="showBasicDetail" class="mt-3 p-3 rounded-lg" :class="isDark ? 'bg-gray-800' : 'bg-gray-50'">
              <p :class="isDark ? 'text-gray-300' : 'text-gray-600'">后端开发工程师，专注C#/.NET方向，3年+开发经验。熟悉微服务架构，掌握.NET Core、ASP.NET Core等主流框架。具备良好的编码习惯和代码优化能力，注重代码质量和性能。</p>
            </div>
          </div>
        </ResumeCard>

        <!-- Work Experience Module -->
        <ResumeCard title="职业经历" :icon="Briefcase" :is-dark="isDark" :default-expanded="true">
          <div class="space-y-4">
            <div
              v-for="(exp, index) in workExperience"
              :key="index"
              class="relative pl-6 md:pl-8 card-hover rounded-lg p-4 transition-all duration-200"
              :class="isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'"
            >
              <!-- Timeline -->
              <div class="absolute left-0 top-4 w-3 h-3 rounded-full" :style="{ backgroundColor: isDark ? '#3b82f6' : '#1e3a5f' }"></div>
              <div v-if="index < workExperience.length - 1" class="absolute left-[5px] top-7 w-0.5 h-full" :style="{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }"></div>

              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <div>
                  <h3 class="font-bold text-lg" :style="{ color: isDark ? '#60a5fa' : '#1e3a5f' }">{{ exp.company }}</h3>
                  <p class="text-sm" :class="isDark ? 'text-cyan-400' : 'text-blue-500'">{{ exp.position }}</p>
                </div>
                <span class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ exp.period }}</span>
              </div>
              <div class="mb-2">
                <p class="font-semibold text-sm mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">核心职责:</p>
                <ul class="list-disc list-inside text-sm space-y-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  <li v-for="(duty, dIndex) in exp.duties" :key="dIndex">{{ duty }}</li>
                </ul>
              </div>
              <div v-if="exp.achievements">
                <p class="font-semibold text-sm mb-1" :class="isDark ? 'text-cyan-300' : 'text-cyan-700'">工作成果:</p>
                <ul class="list-disc list-inside text-sm space-y-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  <li v-for="(ach, aIndex) in exp.achievements" :key="aIndex">
                    <strong :class="isDark ? 'text-cyan-300' : 'text-cyan-700'">{{ ach }}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ResumeCard>

        <!-- Projects Module -->
        <ResumeCard title="项目经验" :icon="Collection" :is-dark="isDark" :default-expanded="false">
          <div class="space-y-4">
            <div
              v-for="(project, index) in projects"
              :key="index"
              class="card-hover rounded-lg p-4 transition-all duration-200 hover:scale-[1.02]"
              :class="isDark ? 'bg-gray-800' : 'bg-gray-50'"
            >
              <div class="flex items-center justify-between cursor-pointer" @click="toggleProject(index)">
                <div>
                  <h3 class="font-bold text-base" :style="{ color: isDark ? '#60a5fa' : '#1e3a5f' }">{{ project.name }}</h3>
                  <p class="text-xs text-gray-500">{{ project.period }} | {{ project.techStack }}</p>
                </div>
                <el-icon class="transition-transform duration-200" :class="{ 'rotate-180': expandedProjects.includes(index) }">
                  <ArrowDown />
                </el-icon>
              </div>
              <transition name="slide-zoom">
                <div v-if="expandedProjects.includes(index)" class="mt-3 pt-3 border-t" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                  <p class="text-sm mb-2" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                    <strong>项目背景：</strong>{{ project.background }}
                  </p>
                  <p class="text-sm mb-2" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                    <strong>个人职责：</strong>
                  </p>
                  <ul class="list-disc list-inside text-sm mb-2 space-y-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                    <li v-for="(resp, rIndex) in project.responsibilities" :key="rIndex">{{ resp }}</li>
                  </ul>
                  <p class="text-sm" :class="isDark ? 'text-cyan-300' : 'text-cyan-700'">
                    <strong>项目亮点：</strong>{{ project.highlights }}
                  </p>
                </div>
              </transition>
              <div class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="tech in project.techStack.split(' / ')"
                  :key="tech"
                  class="px-2 py-0.5 text-xs rounded cursor-pointer transition-colors hover:opacity-80"
                  :class="isDark ? 'bg-gray-700 text-cyan-300' : 'bg-cyan-100 text-cyan-700'"
                  @click.stop="copyText(tech)"
                >{{ tech }}</span>
              </div>
            </div>
          </div>
        </ResumeCard>

        <!-- Skills Module -->
        <ResumeCard title="技能图谱" :icon="Tools" :is-dark="isDark" :default-expanded="true">
          <div class="space-y-3">
            <div v-for="level in skillLevels" :key="level.name">
              <div class="flex items-center gap-2 mb-2 cursor-pointer" @click="toggleSkillLevel(level.name)">
                <span
                  class="px-2 py-0.5 text-xs rounded"
                  :style="{ backgroundColor: level.color, color: 'white' }"
                >{{ level.name }}</span>
                <el-icon class="text-xs" :class="{ 'rotate-180': expandedSkills.includes(level.name) }">
                  <ArrowDown />
                </el-icon>
              </div>
              <div class="flex flex-wrap gap-2" v-if="expandedSkills.includes(level.name) || !isPC">
                <span
                  v-for="skill in getSkillsByLevel(level.name)"
                  :key="skill"
                  class="px-3 py-1 text-sm rounded cursor-pointer transition-colors hover:opacity-80"
                  :class="isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                  :style="{ borderLeft: `3px solid ${level.color}` }"
                  @click="copyText(skill)"
                >{{ skill }}</span>
              </div>
            </div>
          </div>
        </ResumeCard>

        <!-- Additional Info Module -->
        <ResumeCard title="附加信息" :icon="InfoFilled" :is-dark="isDark" :default-expanded="true">
          <div class="space-y-4">
            <!-- Education -->
            <div>
              <h3 class="font-bold text-sm mb-2" :class="isDark ? 'text-cyan-300' : 'text-cyan-700'">教育经历</h3>
              <div class="space-y-2">
                <div v-for="(edu, index) in education" :key="index" class="relative pl-5">
                  <div class="absolute left-0 top-1.5 w-2 h-2 rounded-full" :style="{ backgroundColor: isDark ? '#3b82f6' : '#1e3a5f' }"></div>
                  <p class="font-medium text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ edu.school }}</p>
                  <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ edu.degree }} | {{ edu.major }} | {{ edu.period }}</p>
                </div>
              </div>
            </div>
            <!-- Certificates -->
            <div>
              <h3 class="font-bold text-sm mb-2" :class="isDark ? 'text-cyan-300' : 'text-cyan-700'">证书</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cert in certificates"
                  :key="cert"
                  class="px-3 py-1 text-sm rounded cursor-pointer transition-colors hover:opacity-80"
                  :class="isDark ? 'bg-cyan-900 text-cyan-300' : 'bg-cyan-50 text-cyan-700'"
                  @click="copyText(cert)"
                >{{ cert }}</span>
              </div>
            </div>
            <!-- Hobbies -->
            <div>
              <h3 class="font-bold text-sm mb-2" :class="isDark ? 'text-cyan-300' : 'text-cyan-700'">个人爱好</h3>
              <ul class="list-disc list-inside text-sm space-y-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                <li v-for="hobby in hobbies" :key="hobby">{{ hobby }}</li>
              </ul>
            </div>
          </div>
        </ResumeCard>
      </div>

      <!-- Action Buttons -->
      <div class="fixed bottom-4 md:bottom-8 right-4 md:right-8 flex gap-3 z-40" :class="isMobile ? 'left-4' : ''">
        <el-button type="primary" @click="copyResume" :loading="copyLoading" class="min-w-[80px] md:min-w-[100px]">
          <el-icon class="mr-1"><DocumentCopy /></el-icon>
          复制简历
        </el-button>
        <el-button @click="exportPDF" :loading="pdfLoading" class="min-w-[80px] md:min-w-[100px]">
          <el-icon class="mr-1"><Download /></el-icon>
          导出PDF
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import ResumeCard from '../components/ResumeCard.vue'
import html2pdf from 'html2pdf.js'
import { User, Briefcase, Collection, Tools, InfoFilled, DocumentCopy, Download, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const isDark = inject('isDark')
const isMobile = ref(window.innerWidth < 768)
const isPC = ref(window.innerWidth >= 1200)
const copyLoading = ref(false)
const pdfLoading = ref(false)

const showBasicDetail = ref(false)
const expandedProjects = ref([0])
const expandedSkills = ref(['精通', '熟练', '了解'])

const basicInfo = [
  { label: '姓名', value: '陈星全', copyable: true },
  { label: '性别', value: '男', expandable: true },
  { label: '电话', value: '138-xxxx-xxxx', copyable: true },
  { label: '邮箱', value: 'example@email.com', copyable: true },
  { label: '求职意向', value: '后端开发工程师', expandable: true }
]

const workExperience = [
  {
    company: '某某科技有限公司',
    position: '后端开发工程师',
    period: '2023.03 - 至今',
    duties: ['负责公司核心业务后端开发', '参与系统架构设计与优化', '指导初级开发人员'],
    achievements: ['优化接口性能，响应速度提升30%', '重构遗留代码，降低维护成本40%']
  },
  {
    company: '某某网络公司',
    position: '初级后端开发工程师',
    period: '2021.06 - 2023.02',
    duties: ['参与电商平台后端开发', '负责API接口设计与实现', '协助测试团队进行功能测试'],
    achievements: ['独立完成会员系统开发，用户量增长50%']
  }
]

const projects = [
  {
    name: '企业内部管理系统',
    period: '2024.01 - 2024.06',
    techStack: 'C# / .NET 7 / Vue3 / SQL Server',
    background: '为解决企业内部管理效率低下问题，开发的一套集OA、CRM、ERP功能的管理系统',
    responsibilities: ['负责后端架构设计与核心业务开发', '实现RBAC权限控制', '优化数据库查询性能'],
    highlights: '系统上线后，员工工作效率提升50%，获得公司年度创新奖'
  },
  {
    name: '在线教育平台',
    period: '2023.07 - 2023.12',
    techStack: 'ASP.NET Core / React / MySQL / Redis',
    background: '面向成人的在线职业技能培训平台，支持视频课程、直播、题库等功能',
    responsibilities: ['负责课程订单模块开发', '实现高并发直播接口', '集成第三方支付'],
    highlights: '支持万人同时在线直播，系统可用性达到99.9%'
  }
]

const skillLevels = [
  { name: '精通', color: '#1e3a5f' },
  { name: '熟练', color: '#3b82f6' },
  { name: '了解', color: '#6b7280' }
]

const skills = {
  '精通': ['C#', '.NET Core', 'ASP.NET Core', 'SQL Server'],
  '熟练': ['Vue3', 'JavaScript', 'Redis', 'Docker'],
  '了解': ['Python', 'MongoDB', 'Linux', 'Git']
}

const education = [
  { school: '某某大学', degree: '本科', major: '计算机科学与技术', period: '2017 - 2021' }
]

const certificates = ['计算机二级', '软考中级工程师']

const hobbies = ['技术调研', '开源项目', '健身', '阅读']

const getSkillsByLevel = (level) => skills[level]

const toggleProject = (index) => {
  const idx = expandedProjects.value.indexOf(index)
  if (idx >= 0) {
    expandedProjects.value.splice(idx, 1)
  } else {
    expandedProjects.value.push(index)
  }
}

const toggleSkillLevel = (level) => {
  const idx = expandedSkills.value.indexOf(level)
  if (idx >= 0) {
    expandedSkills.value.splice(idx, 1)
  } else {
    expandedSkills.value.push(level)
  }
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch {
    ElMessage.error('复制失败，请检查内容')
  }
}

const copyResume = async () => {
  copyLoading.value = true
  try {
    const resumeText = `个人简历\n\n姓名：陈星全\n电话：138-xxxx-xxxx\n邮箱：example@email.com\n\n职业经历：\n${workExperience.map(e => `${e.company} - ${e.position} (${e.period})`).join('\n')}`
    await navigator.clipboard.writeText(resumeText)
    ElMessage.success('简历复制成功')
  } catch {
    ElMessage.error('复制失败，请重试')
  }
  copyLoading.value = false
}

const exportPDF = () => {
  pdfLoading.value = true
  const element = document.querySelector('.min-h-\\[calc\\(100vh-60px\\)\\]')
  const opt = {
    margin: 10,
    filename: '个人简历.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  html2pdf().set(opt).from(element).save().then(() => {
    ElMessage.success('PDF导出成功')
    pdfLoading.value = false
  }).catch(() => {
    ElMessage.error('导出失败，请重试')
    pdfLoading.value = false
  })
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  isPC.value = window.innerWidth >= 1200
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.slide-zoom-enter-active, .slide-zoom-leave-active {
  transition: all 0.2s ease;
}
.slide-zoom-enter-from, .slide-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>