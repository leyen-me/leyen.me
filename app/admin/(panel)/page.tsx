import Link from "next/link";
import {
  ChevronRight,
  FileText,
  HelpCircle,
  User,
  Quote,
  Film,
  Briefcase,
  FolderKanban,
  UserCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const sections = [
  { href: "/admin/posts", title: "Posts", desc: "博客文章", icon: FileText },
  { href: "/admin/interviews", title: "Interviews", desc: "面试题库", icon: HelpCircle },
  { href: "/admin/authors", title: "Authors", desc: "作者信息", icon: User },
  { href: "/admin/quotes", title: "Quotes", desc: "语录与随笔", icon: Quote },
  { href: "/admin/movies", title: "Movies", desc: "影视记录", icon: Film },
  { href: "/admin/jobs", title: "Jobs", desc: "工作经历", icon: Briefcase },
  { href: "/admin/projects", title: "Projects", desc: "项目展示", icon: FolderKanban },
  { href: "/admin/profile", title: "Profile", desc: "个人资料", icon: UserCircle },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">管理全部内容</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {sections.map(({ href, title, desc, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-zinc-700">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-none">{title}</p>
                <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
