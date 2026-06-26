import { Injectable } from '@nestjs/common'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly key: Buffer

  constructor() {
    const key = process.env.DATA_ENCRYPTION_KEY

    if (!key) {
      throw new Error('DATA_ENCRYPTION_KEY is missing')
    }

    this.key = Buffer.from(key, 'base64')

    if (this.key.length !== 32) {
      throw new Error('DATA_ENCRYPTION_KEY must be 32 bytes base64 encoded')
    }
  }



  encrypt(value: string | null | undefined): string | null {
    if (!value) return null

    const iv = randomBytes(12)
    const cipher = createCipheriv(this.algorithm, this.key, iv)

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ])

    const authTag = cipher.getAuthTag()

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':')
  }

  decrypt(payload: string | null | undefined): string | null {
    if (!payload) return null

    const [ivBase64, authTagBase64, encryptedBase64] = payload.split(':')

    const iv = Buffer.from(ivBase64, 'base64')
    const authTag = Buffer.from(authTagBase64, 'base64')
    const encrypted = Buffer.from(encryptedBase64, 'base64')

    const decipher = createDecipheriv(this.algorithm, this.key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  }



  encryptRequired(value: string): string {
    const encrypted = this.encrypt(value)

    if (!encrypted) {
      throw new Error('Failed to encrypt required value')
    }

    return encrypted
  }



  safeDecrypt(value: string | null | undefined): string | null {
    if (!value) {
      return null
    }

    try {
      return this.decrypt(value)
    } catch {
      return value
    }
  }

  decryptRequired(value: string): string {
    const decrypted = this.decrypt(value)

    if (!decrypted) {
      throw new Error('Failed to decrypt required value')
    }

    return decrypted
  }
}