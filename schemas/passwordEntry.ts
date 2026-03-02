import { defineField, defineType } from "sanity";
import { BiKey } from "react-icons/bi";

/**
 * 密码条目 - 所有敏感数据均加密存储
 * encryptedData 包含: name, username, password, url, notes
 */
export default defineType({
  name: "passwordEntry",
  title: "Password Entry",
  type: "document",
  icon: BiKey,
  fields: [
    defineField({
      name: "encryptedData",
      title: "Encrypted Data",
      type: "text",
      description: "加密后的密码数据 (name, username, password, url, notes)",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "拖拽排序用，无需手动填写",
      hidden: true,
      initialValue: 0,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Password Entry",
        subtitle: "Encrypted",
      };
    },
  },
});
