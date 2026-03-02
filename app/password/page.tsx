import { Metadata } from "next";
import PasswordManager from "./PasswordManager";

export const metadata: Metadata = {
  title: "Password | Leyen",
  description: "Password manager - secure storage for your credentials",
  robots: "noindex, nofollow",
};

export default function PasswordPage() {
  return (
    <div className="max-w-7xl mx-auto md:px-16 px-6">
      <PasswordManager />
    </div>
  );
}
