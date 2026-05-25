"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Quote = { _id: string; quote?: string; author: string; contentType: string; tags: string[] };

export default function QuotesListPage() {
  const [items, setItems] = useState<Quote[]>([]);
  async function load() { setItems(await (await fetch("/api/admin/quotes")).json()); }
  useEffect(() => { load(); }, []);
  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    load();
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Quotes</h1><Button asChild><Link href="/admin/quotes/new"><Plus className="h-4 w-4" />新建</Link></Button></div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm"><thead className="bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-4 py-3 text-left">内容</th><th className="px-4 py-3 text-left">作者</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">操作</th></tr></thead><tbody>
          {items.map((item) => (<tr key={item._id} className="border-t border-zinc-200 dark:border-zinc-800"><td className="px-4 py-3 max-w-md truncate">{item.quote}</td><td className="px-4 py-3">{item.author}</td><td className="px-4 py-3"><Badge variant="secondary">{item.contentType}</Badge></td><td className="px-4 py-3"><div className="flex gap-2"><Button asChild variant="ghost" size="icon"><Link href={`/admin/quotes/${item._id}`}><Pencil className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
