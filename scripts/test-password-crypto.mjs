/**
 * 密码加密逻辑测试 - 验证 setup -> verify 流程
 * 运行: node scripts/test-password-crypto.mjs
 */

const PBKDF2_ITERATIONS = 310000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

async function deriveKey(password, salt) {
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
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

async function generateSalt() {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return btoa(String.fromCharCode.apply(null, Array.from(salt)));
}

async function setupVault(masterPassword) {
  const salt = await generateSalt();
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const key = await deriveKey(masterPassword, saltBytes);

  const verificationToken = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
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

async function verifyMasterPassword(masterPassword, salt, verificationCipher) {
  try {
    const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
    const key = await deriveKey(masterPassword, saltBytes);

    const combined = Uint8Array.from(atob(verificationCipher), (c) =>
      c.charCodeAt(0)
    );
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);

    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      key,
      ciphertext
    );
    return true;
  } catch (e) {
    console.error("verifyMasterPassword error:", e.message);
    return false;
  }
}

async function runTests() {
  const password = "123456";

  console.log("=== 测试 1: 内存中 setup -> verify (不经过任何序列化) ===\n");

  const { salt, verificationCipher } = await setupVault(password);
  console.log("salt 长度:", salt.length, "| 前20字符:", salt.substring(0, 20) + "...");
  console.log("verificationCipher 长度:", verificationCipher.length);

  const verify1 = await verifyMasterPassword(password, salt, verificationCipher);
  console.log("验证结果 (同一内存对象):", verify1 ? "✓ 通过" : "✗ 失败");
  console.log("");

  console.log("=== 测试 2: JSON 序列化模拟 (模拟 API 存储/读取) ===\n");

  const stored = JSON.stringify({ salt, verificationCipher });
  const parsed = JSON.parse(stored);

  console.log("序列化后 salt 是否一致:", salt === parsed.salt);
  console.log("序列化后 verificationCipher 是否一致:", verificationCipher === parsed.verificationCipher);

  const verify2 = await verifyMasterPassword(password, parsed.salt, parsed.verificationCipher);
  console.log("验证结果 (经过 JSON 序列化):", verify2 ? "✓ 通过" : "✗ 失败");
  console.log("");

  console.log("=== 测试 3: 模拟 fetch API 响应格式 ===\n");

  const apiResponse = {
    vault: {
      _id: "password-vault",
      salt: parsed.salt,
      verificationCipher: parsed.verificationCipher,
    },
  };

  const vaultFromApi = apiResponse.vault;
  const verify3 = await verifyMasterPassword(
    password,
    vaultFromApi.salt,
    vaultFromApi.verificationCipher
  );
  console.log("验证结果 (模拟 API 响应):", verify3 ? "✓ 通过" : "✗ 失败");
  console.log("");

  console.log("=== 测试 4: 错误密码 ===\n");
  const verify4 = await verifyMasterPassword("wrong", salt, verificationCipher);
  console.log("错误密码应失败:", !verify4 ? "✓ 正确" : "✗ 异常");
  console.log("");

  console.log("=== 测试 5: 多次 setup 验证 (模拟刷新后重新获取) ===\n");

  const { salt: salt2, verificationCipher: vc2 } = await setupVault(password);
  const stored2 = JSON.stringify({ salt: salt2, verificationCipher: vc2 });
  const parsed2 = JSON.parse(stored2);

  const verify5 = await verifyMasterPassword(password, parsed2.salt, parsed2.verificationCipher);
  console.log("第二次 setup 后验证:", verify5 ? "✓ 通过" : "✗ 失败");
  console.log("");

  // 关键测试：模拟真实场景 - 第一次 setup 后，第二次用"从 API 获取"的数据验证
  console.log("=== 测试 6: 完整流程模拟 (setup -> 存储 -> 获取 -> verify) ===\n");

  const { salt: realSalt, verificationCipher: realVc } = await setupVault(password);
  console.log("Step 1: setupVault 完成");

  const mockSanityStore = { salt: realSalt, verificationCipher: realVc };
  console.log("Step 2: 模拟存储到 Sanity");

  const mockFetchResult = JSON.parse(JSON.stringify(mockSanityStore));
  console.log("Step 3: 模拟从 API fetch 并 JSON.parse");

  const verify6 = await verifyMasterPassword(
    password,
    mockFetchResult.salt,
    mockFetchResult.verificationCipher
  );
  console.log("Step 4: 验证结果:", verify6 ? "✓ 通过" : "✗ 失败");

  if (!verify6) {
    console.log("\n!!! 调试信息 !!!");
    console.log("原始 salt === 获取后 salt:", realSalt === mockFetchResult.salt);
    console.log("原始 vc === 获取后 vc:", realVc === mockFetchResult.verificationCipher);
    console.log("原始 salt 长度:", realSalt.length, "获取后:", mockFetchResult.salt?.length);
    console.log("原始 vc 长度:", realVc.length, "获取后:", mockFetchResult.verificationCipher?.length);
  }
}

runTests().catch(console.error);
