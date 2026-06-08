import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  { href: "/admin/posts", title: "Posts", desc: "博客文章" },
  { href: "/admin/interviews", title: "Interviews", desc: "面试题库" },
  { href: "/admin/authors", title: "Authors", desc: "作者信息" },
  { href: "/admin/quotes", title: "Quotes", desc: "语录与随笔" },
  { href: "/admin/movies", title: "Movies", desc: "影视记录" },
  { href: "/admin/jobs", title: "Jobs", desc: "工作经历" },
  { href: "/admin/projects", title: "Projects", desc: "项目展示" },
  { href: "/admin/profile", title: "Profile", desc: "个人资料" },
  { href: "/admin/password", title: "Password", desc: "密码库" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">管理全部内容</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-zinc-500">进入管理 →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
