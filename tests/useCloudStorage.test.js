import { describe, it, expect, beforeEach } from 'vitest'
import { useCloudStorage } from '../src/composables/useCloudStorage.js'

describe('useCloudStorage', () => {
  let store = {}
  beforeEach(() => {
    store = {}
    localStorage.clear()
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value },
      removeItem: (key) => { delete store[key] },
      clear: () => { store = {} }
    }
  })

  it('should get notes from localStorage', async () => {
    store['editor-notes'] = JSON.stringify([{ id: '1', title: 'Test', content: '' }])
    const { getNotes } = useCloudStorage()
    const notes = await getNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0].title).toBe('Test')
  })

  it('should return empty array when no notes', async () => {
    const { getNotes } = useCloudStorage()
    const notes = await getNotes()
    expect(notes).toEqual([])
  })

  it('should save notes to localStorage', async () => {
    const { saveNotes } = useCloudStorage()
    const notes = [{ id: '1', title: 'Test', content: 'Content' }]
    await saveNotes(notes)
    expect(JSON.parse(store['editor-notes'])).toEqual(notes)
  })

  it('should load github config from localStorage', () => {
    store['github-config'] = JSON.stringify({ owner: 'test', repo: 'test-repo', token: 'abc' })
    const { loadGithubConfig } = useCloudStorage()
    const config = loadGithubConfig()
    expect(config.owner).toBe('test')
    expect(config.repo).toBe('test-repo')
  })

  it('should return default config when no config saved', () => {
    const { loadGithubConfig } = useCloudStorage()
    const config = loadGithubConfig()
    expect(config.owner).toBe('')
    expect(config.repo).toBe('')
    expect(config.token).toBe('')
  })
})