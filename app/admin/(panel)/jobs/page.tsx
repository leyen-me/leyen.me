"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import AdminTableShell from "@/app/admin/components/AdminTableShell";

type Job = {
  _id: string;
  name: string;
  jobTitle: string;
  startDate?: string;
  endDate?: string;
};

export default function JobsListPage() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setItems(await (await fetch("/api/admin/jobs")).json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Jobs"
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" />
              新建
            </Link>
          </Button>
        }
      />

      {loading ? (
        <p className="text-zinc-500">加载中...</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {items.map((item) => (
              <div
                key={item._id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.jobTitle}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.startDate} - {item.endDate || "至今"}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/jobs/${item._id}`}>
                      <Pencil className="h-4 w-4" />
                      编辑
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <AdminTableShell className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">公司</th>
                  <th className="px-4 py-3 text-left font-medium">职位</th>
                  <th className="px-4 py-3 text-left font-medium">时间</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.jobTitle}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {item.startDate} - {item.endDate || "至今"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/jobs/${item._id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableShell>
        </>
      )}
    </div>
  );
}
