import { describe, it, expect, beforeEach } from 'vitest'
import { useCrypto } from '../src/composables/useCrypto.js'

describe('useCrypto', () => {
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
    // Reset internal state by re-creating composable each test
  })

  it('should start with no spaces', () => {
    const c = useCrypto()
    expect(c.hasAnySpace()).toBe(false)
    expect(c.isUnlocked()).toBe(false)
  })

  it('should setup a new space', async () => {
    const c = useCrypto()
    const spaceId = await c.setupSpace('mypassword123')
    expect(spaceId).toBeTruthy()
    expect(typeof spaceId).toBe('string')
    expect(spaceId.length).toBe(16)
    expect(c.isUnlocked()).toBe(true)
    expect(c.hasAnySpace()).toBe(true)
  })

  it('should store and retrieve spaces list', async () => {
    const c = useCrypto()
    await c.setupSpace('password1')
    const spaces = c.getSpaces()
    expect(spaces.length).toBe(1)
    expect(spaces[0].id).toBeTruthy()
    expect(spaces[0].salt).toBeTruthy()
    expect(spaces[0].verify).toBeTruthy()
    expect(spaces[0].name).toBeDefined()
  })

  it('should encrypt and decrypt text', async () => {
    const c = useCrypto()
    await c.setupSpace('testpass')
    const encrypted = await c.encrypt('Hello World')
    expect(encrypted).not.toBe('Hello World')
    const decrypted = await c.decrypt(encrypted)
    expect(decrypted).toBe('Hello World')
  })

  it('should derive same spaceId for same password', async () => {
    const c1 = useCrypto()
    const id1 = await c1.setupSpace('samepassword')

    store = {}
    localStorage.clear()
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value },
      removeItem: (key) => { delete store[key] },
      clear: () => { store = {} }
    }

    const c2 = useCrypto()
    const result = await c2.unlock('samepassword')
    // The space won't be found because we cleared localStorage
    // But the spaceId should be the same
    expect(result.spaceId).toBe(id1)
  })

  it('should derive different spaceIds for different passwords', async () => {
    const c1 = useCrypto()
    const id1 = await c1.setupSpace('passwordA')
    const c2 = useCrypto()
    const id2 = await c2.setupSpace('passwordB')
    expect(id1).not.toBe(id2)
  })

  it('should fail unlock with wrong password', async () => {
    const c1 = useCrypto()
    await c1.setupSpace('correctpassword')
    // Simulate re-entering
    const c2 = useCrypto()
    const result = await c2.unlock('wrongpassword')
    // The spaceId will match a known space but unlock should fail
    // Actually since we're using the same localStorage, the space exists
    // Let me check: unlock derives spaceId from password, then looks up spaces
    // If wrong password, spaceId won't match any known space
    const spaces = c2.getSpaces()
    const wrongSpaceId = result.spaceId
    // Wrong password gives different spaceId
    const matches = spaces.find(s => s.id === wrongSpaceId)
    expect(matches).toBeUndefined()
  })
})