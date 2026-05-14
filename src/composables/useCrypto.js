const SPACES_KEY = 'crypto-spaces'
const NOTES_PREFIX = 'editor-notes-'
const ARCHIVE_PREFIX = 'archive-'
const SALT_SUFFIX = '-salt'
const VERIFY_SUFFIX = '-verify'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function b64ToBuf(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

async function sha256(data) {
  const hash = await crypto.subtle.digest('SHA-256', data)
  return bufToB64(hash).replace(/[+/=]/g, '').substring(0, 16)
}

async function deriveSpaceId(password) {
  return sha256(encoder.encode(password))
}

async function generateSalt() {
  const salt = crypto.getRandomValues(new Uint8Array(32))
  return bufToB64(salt)
}

async function deriveKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBuf(salt), iterations: 600000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function deriveVerifyHash(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: b64ToBuf(salt), iterations: 600000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  return bufToB64(bits)
}

export function useCrypto() {
  let cryptoKey = null
  let currentSpaceId = null

  function getSpaces() {
    const raw = localStorage.getItem(SPACES_KEY)
    return raw ? JSON.parse(raw) : []
  }

  function saveSpaces(spaces) {
    localStorage.setItem(SPACES_KEY, JSON.stringify(spaces))
  }

  function hasAnySpace() {
    return getSpaces().length > 0
  }

  function getCurrentSpaceId() {
    return currentSpaceId
  }

  function getNotesKey(spaceId) {
    return NOTES_PREFIX + spaceId
  }

  function getArchivePath(spaceId) {
    return ARCHIVE_PREFIX + spaceId + '.json'
  }

  // Returns { spaceId, isNew } - isNew means first time with this password
  async function unlock(password) {
    const spaceId = await deriveSpaceId(password)
    const spaces = getSpaces()
    const existing = spaces.find(s => s.id === spaceId)

    if (existing) {
      // Known space, verify password
      const hash = await deriveVerifyHash(password, existing.salt)
      if (hash !== existing.verify) return { spaceId, success: false, reason: 'wrong-password' }
      cryptoKey = await deriveKey(password, existing.salt)
      currentSpaceId = spaceId
      return { spaceId, success: true, isNew: false }
    }

    // Unknown password - try to find space data on disk
    // If notes exist for this spaceId in localStorage, the salt must be there
    // Otherwise this is a genuinely new password
    return { spaceId, success: false, reason: 'not-found', isNew: true }
  }

  async function setupSpace(password) {
    const spaceId = await deriveSpaceId(password)
    const salt = await generateSalt()
    const verify = await deriveVerifyHash(password, salt)
    const spaces = getSpaces()
    // Don't add duplicate
    if (!spaces.find(s => s.id === spaceId)) {
      spaces.push({ id: spaceId, salt, verify, name: '' })
      saveSpaces(spaces)
    }
    cryptoKey = await deriveKey(password, salt)
    currentSpaceId = spaceId
    return spaceId
  }

  function switchToSpace(spaceId) {
    // This is called when re-entering a known space
    // The cryptoKey should already be set by unlock()
    currentSpaceId = spaceId
  }

  async function encrypt(plaintext) {
    if (!cryptoKey) throw new Error('未解锁')
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = encoder.encode(plaintext)
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded)
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)
    return bufToB64(combined)
  }

  async function decrypt(ciphertext) {
    if (!cryptoKey) throw new Error('未解锁')
    const combined = b64ToBuf(ciphertext)
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data)
    return decoder.decode(decrypted)
  }

  function isUnlocked() {
    return cryptoKey !== null
  }

  return {
    hasAnySpace,
    getSpaces,
    getCurrentSpaceId,
    getNotesKey,
    getArchivePath,
    unlock,
    setupSpace,
    switchToSpace,
    encrypt,
    decrypt,
    isUnlocked
  }
}