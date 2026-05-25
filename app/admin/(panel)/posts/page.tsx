"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import AdminTableShell from "@/app/admin/components/AdminTableShell";

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
      <AdminPageHeader
        title="Posts"
        description="管理博客文章"
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/posts/new">
              <Plus className="h-4 w-4" />
              新建文章
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Input
          placeholder="搜索标题或 slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
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
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-zinc-500 dark:border-zinc-800">
          暂无文章
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((post) => (
              <div
                key={post._id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{post.title}</p>
                    <p className="mt-1 truncate text-xs text-zinc-500">{post.slug}</p>
                  </div>
                  <Badge variant={post.isPublished ? "success" : "warning"}>
                    {post.isPublished ? "已发布" : "草稿"}
                  </Badge>
                </div>
                {post.featured && (
                  <Badge variant="secondary" className="mt-2">
                    Featured
                  </Badge>
                )}
                <div className="mt-3 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/posts/${post._id}`}>
                      <Pencil className="h-4 w-4" />
                      编辑
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600"
                    onClick={() => handleDelete(post._id, post.title)}
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
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">标题</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <tr
                    key={post._id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
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
              </tbody>
            </table>
          </AdminTableShell>
        </>
      )}
    </div>
  );
}
