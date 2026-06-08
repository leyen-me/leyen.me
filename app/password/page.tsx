import PasswordManager from "./PasswordManager";
import PageHeading from "@/app/components/shared/PageHeading";

export default function PasswordPage() {
  return (
    <main className="max-w-7xl mx-auto md:px-16 px-6">
      <PageHeading
        title="密码管理器"
        description="安全存储你的账号密码，数据经主密码加密后保存。刷新页面需重新输入主密码。"
      />
      <PasswordManager embedded />
    </main>
  );
}
