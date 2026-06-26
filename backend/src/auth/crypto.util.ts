import crypto from "crypto";

const ALGO = "aes-256-gcm";

// Must be 32 bytes (base64 -> 32 bytes). Generate once:
// node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
function getKey(): Buffer {
  const b64 = process.env.TOTP_ENC_KEY_BASE64;
  if (!b64) throw new Error("Missing TOTP_ENC_KEY_BASE64");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) throw new Error("TOTP_ENC_KEY_BASE64 must decode to 32 bytes");
  return key;
}

export function encryptString(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);

  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // store as iv.tag.ciphertext (base64)
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}

export function decryptString(payload: string): string {
  const [ivB64, tagB64, ctB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !ctB64) throw new Error("Invalid encrypted payload format");

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");

  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plain.toString("utf8");
}

export function GenerateRecoveryCodes(count: number): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(9).toString("base64url").toUpperCase();
    const formatted = raw.match(/.{1,4}/g)?.join("-");
    codes.push(formatted ?? raw);
  }

  return codes;
}

