import PasswordManager from "@/app/password/PasswordManager";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";

export default function AdminPasswordPage() {
  return (
    <div className="w-full max-w-6xl">
      <AdminPageHeader
        title="Password Vault"
        description="加密密码库管理"
        className="mb-6"
      />
      <div className="min-w-0 overflow-x-hidden">
        <PasswordManager embedded />
      </div>
    </div>
  );
}
