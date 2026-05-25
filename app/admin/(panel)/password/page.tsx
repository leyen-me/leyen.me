import PasswordManager from "@/app/password/PasswordManager";

export default function AdminPasswordPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Password Vault</h1>
        <p className="mt-1 text-zinc-500">加密密码库管理</p>
      </div>
      <PasswordManager />
    </div>
  );
}
