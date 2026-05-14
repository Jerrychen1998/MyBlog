const SALT_KEY = 'crypto-salt'
const VERIFY_KEY = 'crypto-verify'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

async function generateSalt() {
  const salt = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...salt))
}

async function deriveKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: Uint8Array.from(atob(salt), c => c.charCodeAt(0)),
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function generateVerifyHash(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: Uint8Array.from(atob(salt), c => c.charCodeAt(0)),
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  )
  return btoa(String.fromCharCode(...new Uint8Array(bits)))
}

export function useCrypto() {
  let cryptoKey = null

  function hasSetup() {
    return !!localStorage.getItem(SALT_KEY)
  }

  async function setupPassword(password) {
    const salt = await generateSalt()
    const hash = await generateVerifyHash(password, salt)
    localStorage.setItem(SALT_KEY, salt)
    localStorage.setItem(VERIFY_KEY, hash)
    cryptoKey = await deriveKey(password, salt)
  }

  async function unlock(password) {
    const salt = localStorage.getItem(SALT_KEY)
    if (!salt) throw new Error('未初始化')
    const expectedHash = localStorage.getItem(VERIFY_KEY)
    const hash = await generateVerifyHash(password, salt)
    if (hash !== expectedHash) return false
    cryptoKey = await deriveKey(password, salt)
    return true
  }

  async function encrypt(plaintext) {
    if (!cryptoKey) throw new Error('未解锁')
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = encoder.encode(plaintext)
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoded
    )
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)
    return btoa(String.fromCharCode(...combined))
  }

  async function decrypt(ciphertext) {
    if (!cryptoKey) throw new Error('未解锁')
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    )
    return decoder.decode(decrypted)
  }

  function isUnlocked() {
    return cryptoKey !== null
  }

  return { hasSetup, setupPassword, unlock, encrypt, decrypt, isUnlocked }
}