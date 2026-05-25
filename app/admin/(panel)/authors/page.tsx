"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Author = { _id: string; name: string; twitterUrl: string };

export default function AuthorsListPage() {
  const [items, setItems] = useState<Author[]>([]);

  async function load() {
    const res = await fetch("/api/admin/authors");
    setItems(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`确定删除作者「${name}」？`)) return;
    await fetch(`/api/admin/authors/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Authors</h1>
        <Button asChild><Link href="/admin/authors/new"><Plus className="h-4 w-4" />新建</Link></Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">Twitter</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3 text-zinc-500">{item.twitterUrl}</td>
                <td className="px-4 py-3"><div className="flex gap-2"><Button asChild variant="ghost" size="icon"><Link href={`/admin/authors/${item._id}`}><Pencil className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item._id, item.name)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
