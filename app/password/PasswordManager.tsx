"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Slide } from "@/app/animation/Slide";
import {
  setupVault,
  verifyMasterPassword,
  encryptEntry,
  decryptEntry,
  type PasswordEntryData,
} from "@/lib/password-crypto";
import type { PasswordEntryType } from "@/types";
import {
  BiLockAlt,
  BiPlus,
  BiTrash,
  BiEdit,
  BiCopy,
  BiLinkExternal,
  BiLoaderAlt,
  BiX,
  BiSearch,
  BiGridVertical,
} from "react-icons/bi";
import { RiCheckboxCircleFill } from "react-icons/ri";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type VaultState = {
  salt: string;
  verificationCipher: string;
} | null;

type DecryptedEntry = PasswordEntryData & {
  _id: string;
  _createdAt: string;
  order?: number;
};

export default function PasswordManager() {
  const [vault, setVault] = useState<VaultState>(null);
  const [entries, setEntries] = useState<PasswordEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterPassword, setMasterPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [decryptedEntries, setDecryptedEntries] = useState<DecryptedEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return decryptedEntries;
    const q = searchQuery.trim().toLowerCase();
    return decryptedEntries.filter((entry) => {
      const fields = [
        entry.name,
        entry.username,
        entry.password,
        entry.url,
        entry.notes,
      ].filter(Boolean);
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [decryptedEntries, searchQuery]);

  const fetchVault = useCallback(async () => {
    try {
      const res = await fetch(`/api/password/vault?t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      const data = await res.json();
      if (data.vault) {
        setVault({
          salt: data.vault.salt,
          verificationCipher: data.vault.verificationCipher,
        });
        setEntries(data.entries || []);
      } else {
        setIsSetup(true);
      }
    } catch (err) {
      setError("无法加载保险库"); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  const decryptAllEntries = useCallback(
    async (password: string, salt: string, entriesList: PasswordEntryType[]) => {
      const decrypted: DecryptedEntry[] = [];
      for (const entry of entriesList) {
        if (!entry.encryptedData) continue;
        try {
          const data = await decryptEntry(
            entry.encryptedData,
            password,
            salt
          );
          decrypted.push({
            ...data,
            _id: entry._id,
            _createdAt: entry._createdAt,
            order: entry.order,
          });
        } catch {
          // Skip corrupted entries
        }
      }
      setDecryptedEntries(decrypted);
    },
    []
  );

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!masterPassword.trim()) {
      setError("请输入主密码");
      return;
    }

    if (isSetup) {
      try {
        const { salt, verificationCipher } = await setupVault(masterPassword);
        await fetch("/api/password/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salt, verificationCipher }),
        });
        setVault({ salt, verificationCipher });
        setVerified(true);
        setDecryptedEntries([]);
        setIsSetup(false);
      } catch (err) {
        setError("设置失败，请重试");
      }
    } else if (vault) {
      let valid = await verifyMasterPassword(
        masterPassword,
        vault.salt,
        vault.verificationCipher
      );
      // 备用验证：若 verificationCipher 校验失败，尝试解密第一条记录
      // 解决 fetch 缓存或 Sanity 返回数据异常导致的校验失败
      if (!valid && entries.length > 0) {
        try {
          await decryptEntry(
            entries[0].encryptedData,
            masterPassword,
            vault.salt
          );
          valid = true;
        } catch {
          // 解密也失败，密码确实错误
        }
      }
      if (valid) {
        setVerified(true);
        await decryptAllEntries(masterPassword, vault.salt, entries);
      } else {
        setError("主密码错误");
      }
    }
  };

  const handleAddEntry = async (data: PasswordEntryData) => {
    if (!vault || !masterPassword) return;
    try {
      const encrypted = await encryptEntry(data, masterPassword, vault.salt);
      const order = decryptedEntries.length;
      const res = await fetch("/api/password/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedData: encrypted, order }),
      });
      const result = await res.json();
      if (result.success) {
        setEntries((prev) => [
          ...prev,
          { _id: result._id, _createdAt: new Date().toISOString(), encryptedData: encrypted, order },
        ]);
        setDecryptedEntries((prev) => [
          ...prev,
          { ...data, _id: result._id, _createdAt: new Date().toISOString(), order },
        ]);
        setShowAddForm(false);
      }
    } catch (err) {
      setError("添加失败");
    }
  };

  const handleUpdateEntry = async (id: string, data: PasswordEntryData) => {
    if (!vault || !masterPassword) return;
    try {
      const encrypted = await encryptEntry(data, masterPassword, vault.salt);
      const res = await fetch(`/api/password/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedData: encrypted }),
      });
      if (res.ok) {
        setDecryptedEntries((prev) =>
          prev.map((e) => (e._id === id ? { ...e, ...data } : e))
        );
        setEntries((prev) =>
          prev.map((e) => (e._id === id ? { ...e, encryptedData: encrypted } : e))
        );
        setEditingId(null);
      }
    } catch (err) {
      setError("更新失败");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/password/entries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e._id !== id));
        setDecryptedEntries((prev) => prev.filter((e) => e._id !== id));
      }
    } catch (err) {
      setError("删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 1500);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = decryptedEntries.findIndex((e) => e._id === active.id);
    const newIndex = decryptedEntries.findIndex((e) => e._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(decryptedEntries, oldIndex, newIndex);
    setDecryptedEntries(reordered);

    const ids = reordered.map((e) => e._id);
    setReordering(true);
    try {
      const res = await fetch("/api/password/entries/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        setDecryptedEntries(decryptedEntries);
        setError("排序保存失败");
      }
    } catch {
      setDecryptedEntries(decryptedEntries);
      setError("排序保存失败");
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="dark:text-zinc-400 text-zinc-600">加载中...</p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Slide>
          <div className="dark:bg-primary-bg bg-zinc-100 border dark:border-zinc-700 border-zinc-200 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <BiLockAlt className="text-3xl dark:text-primary-color text-secondary-color" />
              <h1 className="font-incognito font-semibold text-2xl tracking-tight">
                {isSetup ? "创建主密码" : "输入主密码"}
              </h1>
            </div>
            <p className="text-sm dark:text-zinc-400 text-zinc-600 mb-6">
              {isSetup
                ? "首次使用，请设置一个主密码（建议 6 位数字）。主密码仅存在你的设备内存中，刷新页面后需重新输入。"
                : "请输入主密码以解锁密码管理器。主密码不会存储在服务器。"}
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={20}
                placeholder="主密码（如 6 位数字）"
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-incognito font-semibold dark:bg-primary-color bg-secondary-color dark:text-white text-zinc-800 hover:opacity-90 transition"
              >
                {isSetup ? "创建并进入" : "解锁"}
              </button>
            </form>
          </div>
        </Slide>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <Slide>
        <header className="mb-10">
          <h1 className="font-incognito font-semibold tracking-tight sm:text-5xl text-3xl mb-6">
            密码管理器
          </h1>
          <p className="max-w-2xl text-base dark:text-zinc-400 text-zinc-600 leading-relaxed">
            安全存储你的账号密码，数据经主密码加密后保存。刷新页面需重新输入主密码。
          </p>
        </header>
      </Slide>

      {error && (
        <p className="mb-4 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <Slide delay={0.1}>
        {reordering && (
          <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">保存排序中...</p>
        )}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 text-lg" />
            <input
              type="text"
              placeholder="搜索名称、用户名、网址、备注..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50 placeholder:text-zinc-400"
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg dark:bg-primary-bg bg-zinc-100 border dark:border-zinc-700 border-zinc-200 hover:border-primary-color/50 transition font-incognito font-medium shrink-0"
          >
            <BiPlus className="text-lg" />
            添加密码
          </button>
        </div>

        {showAddForm && (
          <AddEntryModal
            onSave={(data) => handleAddEntry(data)}
            onClose={() => setShowAddForm(false)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decryptedEntries.length === 0 ? (
            <div className="col-span-full dark:bg-primary-bg bg-zinc-100 border border-dashed dark:border-zinc-700 border-zinc-200 rounded-xl px-6 py-12 text-center">
              <p className="dark:text-zinc-400 text-zinc-600 mb-4">
                暂无密码记录，点击上方「添加密码」开始添加
              </p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="col-span-full dark:bg-primary-bg bg-zinc-100 border border-dashed dark:border-zinc-700 border-zinc-200 rounded-xl px-6 py-12 text-center">
              <p className="dark:text-zinc-400 text-zinc-600 mb-4">
                未找到匹配「{searchQuery}」的记录
              </p>
            </div>
          ) : searchQuery.trim() ? (
            filteredEntries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onEdit={() => setEditingId(entry._id)}
                onDelete={() => handleDeleteEntry(entry._id)}
                onCopy={copyToClipboard}
                copyStatus={copyStatus}
                deletingId={deletingId}
              />
            ))
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={decryptedEntries.map((e) => e._id)}
                strategy={rectSortingStrategy}
              >
                {decryptedEntries.map((entry) => (
                  <SortableEntryCard
                    key={entry._id}
                    entry={entry}
                    onEdit={() => setEditingId(entry._id)}
                    onDelete={() => handleDeleteEntry(entry._id)}
                    onCopy={copyToClipboard}
                    copyStatus={copyStatus}
                    deletingId={deletingId}
                    disabled={reordering}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {editingId && (() => {
          const entry = decryptedEntries.find((e) => e._id === editingId);
          if (!entry) return null;
          return (
            <EditEntryModal
              key={editingId}
              entry={entry}
              onSave={(data) => handleUpdateEntry(entry._id, data)}
              onClose={() => setEditingId(null)}
            />
          );
        })()}
      </Slide>
    </div>
  );
}

function EntryModal({
  title,
  initialData,
  onSave,
  onClose,
}: {
  title: string;
  initialData?: DecryptedEntry;
  onSave: (data: PasswordEntryData) => void | Promise<void>;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/70 dark:bg-black/85" aria-hidden />
      <div className="relative w-full max-w-md dark:bg-zinc-900 bg-white rounded-xl shadow-xl border dark:border-zinc-700 border-zinc-200">
        <div className="flex items-center justify-between p-4 border-b dark:border-zinc-700 border-zinc-200">
          <h2 className="font-incognito font-semibold text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg dark:hover:bg-zinc-700 hover:bg-zinc-200 transition"
            aria-label="关闭"
          >
            <BiX className="text-xl" />
          </button>
        </div>
        <div className="p-6">
          <EntryForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onClose}
            embedded
          />
        </div>
      </div>
    </div>
  );
}

function AddEntryModal({
  onSave,
  onClose,
}: {
  onSave: (data: PasswordEntryData) => void | Promise<void>;
  onClose: () => void;
}) {
  return (
    <EntryModal
      title="添加密码"
      onSave={onSave}
      onClose={onClose}
    />
  );
}

function EditEntryModal({
  entry,
  onSave,
  onClose,
}: {
  entry: DecryptedEntry;
  onSave: (data: PasswordEntryData) => void | Promise<void>;
  onClose: () => void;
}) {
  return (
    <EntryModal
      title="编辑密码"
      initialData={entry}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

function EntryForm({
  initialData,
  onSave,
  onCancel,
  embedded,
}: {
  initialData?: DecryptedEntry;
  onSave: (data: PasswordEntryData) => void | Promise<void>;
  onCancel: () => void;
  embedded?: boolean;
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [username, setUsername] = useState(initialData?.username ?? "");
  const [password, setPassword] = useState(initialData?.password ?? "");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await Promise.resolve(onSave({ name: name.trim(), username, password, url, notes }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${embedded ? "p-0" : "dark:bg-primary-bg bg-zinc-100 border dark:border-zinc-700 border-zinc-200 rounded-xl p-6 mb-4"}`}
    >
      <input
        type="text"
        placeholder="名称 *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50"
        required
      />
      <input
        type="text"
        placeholder="用户名 / 邮箱"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-4 py-2 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50"
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50"
      />
      <input
        type="url"
        placeholder="网址"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full px-4 py-2 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50"
      />
      <textarea
        placeholder="备注"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full px-4 py-2 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50 resize-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-incognito font-semibold dark:bg-primary-color bg-secondary-color dark:text-white text-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <BiLoaderAlt className="animate-spin text-lg" />
              保存中...
            </>
          ) : (
            "保存"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg dark:bg-zinc-800 bg-zinc-200 dark:text-white text-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          取消
        </button>
      </div>
    </form>
  );
}

function SortableEntryCard({
  entry,
  onEdit,
  onDelete,
  onCopy,
  copyStatus,
  deletingId,
  disabled,
}: {
  entry: DecryptedEntry;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (text: string, id: string) => void;
  copyStatus: string | null;
  deletingId: string | null;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry._id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <EntryCard
        entry={entry}
        onEdit={onEdit}
        onDelete={onDelete}
        onCopy={onCopy}
        copyStatus={copyStatus}
        deletingId={deletingId}
        dragHandleProps={{ attributes, listeners, disabled }}
      />
    </div>
  );
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
  onCopy,
  copyStatus,
  deletingId,
  dragHandleProps,
}: {
  entry: DecryptedEntry;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (text: string, id: string) => void;
  copyStatus: string | null;
  deletingId: string | null;
  dragHandleProps?: {
    attributes: object;
    listeners: object | undefined;
    disabled?: boolean;
  };
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isDeleting = deletingId === entry._id;

  return (
    <div className="dark:bg-primary-bg bg-zinc-100 border dark:border-zinc-700 border-zinc-200 rounded-xl p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        {dragHandleProps && !dragHandleProps.disabled && (
          <button
            type="button"
            className="p-1.5 -ml-1 rounded-lg dark:hover:bg-zinc-700 hover:bg-zinc-200 transition cursor-grab active:cursor-grabbing touch-none"
            aria-label="拖拽排序"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <BiGridVertical className="text-lg text-zinc-500 dark:text-zinc-400" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-incognito font-semibold text-lg mb-2 dark:text-white text-zinc-800">
            {entry.name}
          </h3>
          {entry.username && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm dark:text-zinc-400 text-zinc-600">
                {entry.username}
              </span>
              <button
                onClick={() => onCopy(entry.username, `copy-${entry._id}-user`)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
              >
                {copyStatus === `copy-${entry._id}-user` ? (
                  <RiCheckboxCircleFill className="text-secondary-color text-sm" />
                ) : (
                  <BiCopy className="text-sm" />
                )}
              </button>
            </div>
          )}
          {entry.password && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono">
                {showPassword ? entry.password : "••••••••"}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs dark:text-zinc-400 text-zinc-600 hover:underline"
              >
                {showPassword ? "隐藏" : "显示"}
              </button>
              <button
                onClick={() => onCopy(entry.password, `copy-${entry._id}-pass`)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
              >
                {copyStatus === `copy-${entry._id}-pass` ? (
                  <RiCheckboxCircleFill className="text-secondary-color text-sm" />
                ) : (
                  <BiCopy className="text-sm" />
                )}
              </button>
            </div>
          )}
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-color hover:underline"
            >
              <BiLinkExternal />
              {entry.url}
            </a>
          )}
          {entry.notes && (
            <p className="mt-2 text-sm dark:text-zinc-400 text-zinc-600">
              {entry.notes}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onEdit}
            disabled={isDeleting}
            className="p-2 rounded-lg dark:hover:bg-zinc-700 hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="编辑"
          >
            <BiEdit />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 p-2 rounded-lg dark:hover:bg-zinc-700 hover:bg-zinc-200 text-red-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
            title="删除"
          >
            {isDeleting ? (
              <>
                <BiLoaderAlt className="animate-spin text-base" />
                <span className="text-xs">删除中</span>
              </>
            ) : (
              <BiTrash />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
