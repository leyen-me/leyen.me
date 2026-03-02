/**
 * 客户端加密工具 - 使用 Web Crypto API
 * 主密码仅存在于内存，永不发送到服务器
 */

const PBKDF2_ITERATIONS = 310000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

export interface PasswordEntryData {
  name: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return btoa(String.fromCharCode.apply(null, Array.from(salt)));
}

export async function setupVault(masterPassword: string): Promise<{
  salt: string;
  verificationCipher: string;
}> {
  const salt = await generateSalt();
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const key = await deriveKey(masterPassword, saltBytes);

  // 生成随机验证令牌
  const verificationToken = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    key,
    verificationToken
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return {
    salt,
    verificationCipher: btoa(String.fromCharCode.apply(null, Array.from(combined))),
  };
}

export async function verifyMasterPassword(
  masterPassword: string,
  salt: string,
  verificationCipher: string
): Promise<boolean> {
  try {
    const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
    const key = await deriveKey(masterPassword, saltBytes);

    const combined = Uint8Array.from(atob(verificationCipher), (c) =>
      c.charCodeAt(0)
    );
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);

    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: 128,
      },
      key,
      ciphertext
    );
    return true;
  } catch {
    return false;
  }
}

export async function encryptEntry(
  data: PasswordEntryData,
  masterPassword: string,
  salt: string
): Promise<string> {
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const key = await deriveKey(masterPassword, saltBytes);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    key,
    plaintext
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

export async function decryptEntry(
  encryptedData: string,
  masterPassword: string,
  salt: string
): Promise<PasswordEntryData> {
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const key = await deriveKey(masterPassword, saltBytes);

  const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted)) as PasswordEntryData;
}
