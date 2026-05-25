"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type PostListItem = {
  _id: string;
  title: string;
  slug: string;
  isPublished?: boolean;
  featured?: boolean;
  _createdAt: string;
};

export default function PostsListPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    setLoading(true);
    const res = await fetch("/api/admin/posts");
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`确定删除「${title}」？`)) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    loadPosts();
  }

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !search.trim() ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.slug.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "published" && post.isPublished) ||
        (filter === "draft" && !post.isPublished);
      return matchesSearch && matchesFilter;
    });
  }, [posts, search, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="mt-1 text-zinc-500">管理博客文章</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4" />
            新建文章
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="搜索标题或 slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((value) => (
            <Button
              key={value}
              variant={filter === value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "全部" : value === "published" ? "已发布" : "草稿"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-500">加载中...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post._id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{post.title}</div>
                    {post.featured && (
                      <Badge variant="secondary" className="mt-1">
                        Featured
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{post.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant={post.isPublished ? "success" : "warning"}>
                      {post.isPublished ? "已发布" : "草稿"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/posts/${post._id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post._id, post.title)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    暂无文章
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
