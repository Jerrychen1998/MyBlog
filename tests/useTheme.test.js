import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTheme } from '../src/composables/useTheme.js'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('should initialize with light theme by default', () => {
    const { isDark, initTheme } = useTheme()
    initTheme()
    expect(isDark.value).toBe(false)
  })

  it('should toggle theme', () => {
    const { isDark, initTheme, toggleTheme } = useTheme()
    initTheme()
    toggleTheme()
    expect(isDark.value).toBe(true)
    toggleTheme()
    expect(isDark.value).toBe(false)
  })

  it('should save theme preference to localStorage', () => {
    const { isDark, initTheme, toggleTheme } = useTheme()
    initTheme()
    toggleTheme()
    expect(localStorage.getItem('blog-theme')).toBe('dark')
  })

  it('should restore theme from localStorage', () => {
    localStorage.setItem('blog-theme', 'dark')
    const { isDark, initTheme } = useTheme()
    initTheme()
    expect(isDark.value).toBe(true)
  })
})