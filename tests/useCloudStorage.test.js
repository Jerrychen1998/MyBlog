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
    store['editor-notes-default'] = JSON.stringify([{ id: '1', title: 'Test', content: '' }])
    const c = useCloudStorage()
    c.setCrypto(null, null, (id) => `editor-notes-${id}`, (id) => `archive-${id}.json`, () => 'default')
    const notes = await c.getNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0].title).toBe('Test')
  })

  it('should return empty array when no notes', async () => {
    const c = useCloudStorage()
    const notes = await c.getNotes()
    expect(notes).toEqual([])
  })

  it('should save notes to localStorage', async () => {
    const c = useCloudStorage()
    c.setCrypto(null, null, (id) => `editor-notes-${id}`, (id) => `archive-${id}.json`, () => 'space1')
    await c.saveNotes([{ id: '1', title: 'Test', content: 'Content' }])
    expect(JSON.parse(store['editor-notes-space1'])).toEqual([{ id: '1', title: 'Test', content: 'Content' }])
  })

  it('should load github config', () => {
    store['github-config'] = JSON.stringify({ owner: 'test', repo: 'repo', token: 'abc' })
    const c = useCloudStorage()
    const config = c.loadGithubConfig()
    expect(config.owner).toBe('test')
  })

  it('should return default config', () => {
    const c = useCloudStorage()
    const config = c.loadGithubConfig()
    expect(config.owner).toBe('')
  })
})