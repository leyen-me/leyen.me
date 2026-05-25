"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MarkdownEditor from "@/app/admin/components/MarkdownEditor";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import type { ImageInput } from "@/lib/admin/sanity-helpers";

export default function ProfileEditor() {
  const router = useRouter();
  const resumeRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [profileImage, setProfileImage] = useState<ImageInput | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>();
  const [shortBio, setShortBio] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [fullBio, setFullBio] = useState("");
  const [usage, setUsage] = useState("");
  const [resumeAssetId, setResumeAssetId] = useState<string>();
  const [resumeURL, setResumeURL] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data) { setLoading(false); return; }
        setFullName(data.fullName ?? "");
        setHeadline(data.headline ?? "");
        setProfileImage(
          data.profileImage?.assetId
            ? { assetId: data.profileImage.assetId, alt: data.profileImage.alt }
            : null
        );
        setProfileImageUrl(data.profileImage?.url);
        setShortBio(data.shortBio ?? "");
        setEmail(data.email ?? "");
        setLocation(data.location ?? "");
        setFullBio(typeof data.fullBio === "string" ? data.fullBio : "");
        setUsage(typeof data.usage === "string" ? data.usage : "");
        setResumeAssetId(data.resumeAssetId);
        setResumeURL(data.resumeURL);
        setLoading(false);
      });
  }, []);

  async function handleResumeUpload(file: File) {
    setUploadingResume(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "file");
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setResumeAssetId(data.assetId);
      setResumeURL(data.url);
    }
    setUploadingResume(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileImage?.assetId) return;
    setSaving(true);
    await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName, headline, profileImage, shortBio, email, location,
        fullBio, usage, resumeAssetId,
      }),
    });
    router.refresh();
    setSaving(false);
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>全名</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
        <div className="space-y-2"><Label>邮箱</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      </div>
      <div className="space-y-2"><Label>Headline</Label><Input value={headline} onChange={(e) => setHeadline(e.target.value)} required /></div>
      <div className="space-y-2"><Label>位置</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Short Bio</Label><Textarea value={shortBio} onChange={(e) => setShortBio(e.target.value)} rows={4} required /></div>
      <ImageUploadField label="头像" value={profileImage} previewUrl={profileImageUrl} onChange={setProfileImage} />
      <div className="space-y-2">
        <Label>Resume</Label>
        {resumeURL && <p className="text-sm text-zinc-500">当前: {resumeURL}</p>}
        <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f); }} />
        <Button type="button" variant="outline" disabled={uploadingResume} onClick={() => resumeRef.current?.click()}>
          {uploadingResume ? "上传中..." : "上传 Resume"}
        </Button>
      </div>
      <MarkdownEditor label="Full Bio (Markdown)" value={fullBio} onChange={setFullBio} />
      <MarkdownEditor label="Usage (Markdown)" value={usage} onChange={setUsage} />
      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? "保存中..." : "保存"}
      </Button>
    </form>
  );
}
