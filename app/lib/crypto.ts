import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_HEX = process.env.ENCRYPTION_KEY ?? ""

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-char hex string (32 bytes). " +
      "Generate one with: openssl rand -hex 32"
    )
  }
  return Buffer.from(KEY_HEX, "hex")
}

// Output format:  <iv_hex>:<authTag_hex>:<ciphertext_hex>
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)                          // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":")
}

export function decrypt(stored: string): string {
  const key = getKey()
  const [ivHex, authTagHex, ciphertextHex] = stored.split(":")

  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("Malformed encrypted value")
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  )
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}