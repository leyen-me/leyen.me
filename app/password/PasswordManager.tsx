"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Slide } from "@/app/animation/Slide";
import {
  setupVault,
  verifyMasterPassword,
  encryptEntry,
  decryptEntry,
} from "@/lib/password-crypto";
import type { PasswordEntryType, PasswordEntryData } from "@/types";
import {
  BiLockAlt,
  BiPlus,
  BiTrash,
  BiEdit,
  BiLoaderAlt,
  BiX,
  BiSearch,
  BiGridVertical,
  BiShow,
  BiHide,
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
      const fields =
        entry.type === "SECRET"
          ? [entry.key, entry.value].filter(Boolean)
          : [
              entry.name,
              entry.username,
              entry.password,
              entry.url,
              entry.notes,
            ].filter(Boolean);
      return fields.some((f) => String(f).toLowerCase().includes(q));
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
      title="添加"
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
      title="编辑"
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
  const init = initialData as PasswordEntryData | undefined;
  const initialType = (init?.type ?? "PASSWORD") as "PASSWORD" | "SECRET";
  const [entryType, setEntryType] = useState<"PASSWORD" | "SECRET">(initialType);
  const [name, setName] = useState(
    init && init.type === "PASSWORD" ? init.name ?? "" : ""
  );
  const [username, setUsername] = useState(
    init && init.type === "PASSWORD" ? init.username ?? "" : ""
  );
  const [password, setPassword] = useState(
    init && init.type === "PASSWORD" ? init.password ?? "" : ""
  );
  const [url, setUrl] = useState(
    init && init.type === "PASSWORD" ? init.url ?? "" : ""
  );
  const [notes, setNotes] = useState(
    init && init.type === "PASSWORD" ? init.notes ?? "" : ""
  );
  const [key, setKey] = useState(
    init && init.type === "SECRET" ? init.key ?? "" : ""
  );
  const [value, setValue] = useState(
    init && init.type === "SECRET" ? init.value ?? "" : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (entryType === "SECRET") {
      if (!key.trim()) return;
    } else {
      if (!name.trim()) return;
    }
    setSaving(true);
    try {
      if (entryType === "SECRET") {
        await Promise.resolve(
          onSave({ type: "SECRET", key: key.trim(), value })
        );
      } else {
        await Promise.resolve(
          onSave({
            type: "PASSWORD",
            name: name.trim(),
            username,
            password,
            url,
            notes,
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${embedded ? "p-0" : "dark:bg-primary-bg bg-zinc-100 border dark:border-zinc-700 border-zinc-200 rounded-xl p-6 mb-4"}`}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm dark:text-zinc-400 text-zinc-600">分类</span>
        <div className="flex rounded-lg bg-zinc-200 dark:bg-zinc-700 p-1">
          <button
            type="button"
            onClick={() => setEntryType("PASSWORD")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              entryType === "PASSWORD"
                ? "bg-white dark:bg-zinc-900 shadow dark:text-white text-zinc-800"
                : "dark:text-zinc-400 text-zinc-600 hover:text-zinc-800 dark:hover:text-white"
            }`}
          >
            PASSWORD
          </button>
          <button
            type="button"
            onClick={() => setEntryType("SECRET")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              entryType === "SECRET"
                ? "bg-white dark:bg-zinc-900 shadow dark:text-white text-zinc-800"
                : "dark:text-zinc-400 text-zinc-600 hover:text-zinc-800 dark:hover:text-white"
            }`}
          >
            SECRET
          </button>
        </div>
      </div>

      {entryType === "PASSWORD" ? (
        <>
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
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Key *"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-4 py-2 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50"
            required
          />
          <input
            type="password"
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2 rounded-lg dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-zinc-200 dark:text-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-color/50 font-mono"
          />
        </>
      )}
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
    <div className="group dark:bg-primary-bg bg-zinc-100 border dark:border-zinc-700 border-zinc-200 rounded-xl p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg">
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
        <div className="flex-1 min-w-0 overflow-hidden">
          {entry.type === "SECRET" ? (
            <>
              <h3 className="font-incognito font-semibold text-lg mb-2 dark:text-white text-zinc-800 truncate" title={entry.key}>
                {entry.key}
              </h3>
              {entry.value && (
                <div className="flex items-center gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => onCopy(entry.value, `copy-${entry._id}-value`)}
                    className="flex items-center gap-2 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity"
                    title="点击复制"
                  >
                    <span className="text-sm font-mono truncate">
                      {showPassword ? entry.value : "••••••••"}
                    </span>
                    {copyStatus === `copy-${entry._id}-value` ? (
                      <RiCheckboxCircleFill className="text-secondary-color text-sm shrink-0" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassword(!showPassword);
                    }}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded shrink-0"
                    title={showPassword ? "隐藏" : "显示"}
                  >
                    {showPassword ? (
                      <BiHide className="text-sm text-zinc-500 dark:text-zinc-400" />
                    ) : (
                      <BiShow className="text-sm text-zinc-500 dark:text-zinc-400" />
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {"url" in entry && entry.url ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={entry.url}
                  className="font-incognito font-semibold text-lg mb-2 block dark:text-white text-zinc-800 hover:underline"
                >
                  {entry.name}
                </a>
              ) : (
                <h3 className="font-incognito font-semibold text-lg mb-2 dark:text-white text-zinc-800">
                  {entry.name}
                </h3>
              )}
              {"username" in entry && entry.username && (
                <button
                  type="button"
                  onClick={() => onCopy(entry.username, `copy-${entry._id}-user`)}
                  className="flex items-center gap-2 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity mb-1"
                  title="点击复制"
                >
                  <span className="text-sm dark:text-zinc-400 text-zinc-600 truncate">
                    {entry.username}
                  </span>
                  {copyStatus === `copy-${entry._id}-user` ? (
                    <RiCheckboxCircleFill className="text-secondary-color text-sm shrink-0" />
                  ) : null}
                </button>
              )}
              {"password" in entry && entry.password && (
                <div className="flex items-center gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => onCopy(entry.password, `copy-${entry._id}-pass`)}
                    className="flex items-center gap-2 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity"
                    title="点击复制"
                  >
                    <span className="text-sm font-mono truncate">
                      {showPassword ? entry.password : "••••••••"}
                    </span>
                    {copyStatus === `copy-${entry._id}-pass` ? (
                      <RiCheckboxCircleFill className="text-secondary-color text-sm shrink-0" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassword(!showPassword);
                    }}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded shrink-0"
                    title={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? (
                      <BiHide className="text-sm text-zinc-500 dark:text-zinc-400" />
                    ) : (
                      <BiShow className="text-sm text-zinc-500 dark:text-zinc-400" />
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div
          className={`flex gap-2 shrink-0 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 ${isDeleting ? "md:!opacity-100" : ""}`}
        >
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
