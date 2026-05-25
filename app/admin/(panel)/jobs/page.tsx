"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Job = { _id: string; name: string; jobTitle: string; startDate?: string; endDate?: string };

export default function JobsListPage() {
  const [items, setItems] = useState<Job[]>([]);
  async function load() { setItems(await (await fetch("/api/admin/jobs")).json()); }
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Jobs</h1><Button asChild><Link href="/admin/jobs/new"><Plus className="h-4 w-4" />新建</Link></Button></div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm"><thead className="bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-4 py-3 text-left">公司</th><th className="px-4 py-3 text-left">职位</th><th className="px-4 py-3 text-left">时间</th><th className="px-4 py-3 text-left">操作</th></tr></thead><tbody>
          {items.map((item) => (<tr key={item._id} className="border-t border-zinc-200 dark:border-zinc-800"><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3">{item.jobTitle}</td><td className="px-4 py-3 text-zinc-500">{item.startDate} - {item.endDate || "至今"}</td><td className="px-4 py-3"><div className="flex gap-2"><Button asChild variant="ghost" size="icon"><Link href={`/admin/jobs/${item._id}`}><Pencil className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" onClick={async () => { if (confirm("确定删除？")) { await fetch(`/api/admin/jobs/${item._id}`, { method: "DELETE" }); load(); } }}><Trash2 className="h-4 w-4 text-red-600" /></Button></div></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
