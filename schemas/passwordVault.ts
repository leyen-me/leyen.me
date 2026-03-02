import { defineField, defineType } from "sanity";
import { BiLockAlt } from "react-icons/bi";

/**
 * 密码保险库配置 - 单例文档
 * 存储主密码验证所需的 salt 和 verificationCipher
 * 主密码本身永不存储
 */
export default defineType({
  name: "passwordVault",
  title: "Password Vault",
  type: "document",
  icon: BiLockAlt,
  fields: [
    defineField({
      name: "salt",
      title: "Salt",
      type: "string",
      description: "用于密钥派生的盐值 (Base64)",
      hidden: true,
    }),
    defineField({
      name: "verificationCipher",
      title: "Verification Cipher",
      type: "string",
      description: "用于验证主密码的加密令牌",
      hidden: true,
    }),
  ],
});
