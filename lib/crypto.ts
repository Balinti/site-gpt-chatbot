import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer | null {
  const key = process.env.APP_ENCRYPTION_KEY
  if (!key) return null
  return scryptSync(key, 'salt', 32)
}

export function encrypt(text: string): string | null {
  const key = getEncryptionKey()
  if (!key) return null

  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string | null {
  const key = getEncryptionKey()
  if (!key) return null

  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch {
    return null
  }
}
