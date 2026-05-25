"use client";

import { useEffect, useRef, useState } from "react";

export function useModKeyLabel() {
  const [label, setLabel] = useState("Ctrl");

  useEffect(() => {
    setLabel(/Mac|iPhone|iPad/i.test(navigator.userAgent) ? "⌘" : "Ctrl");
  }, []);

  return label;
}

function isModKey(e: KeyboardEvent) {
  return e.metaKey || e.ctrlKey;
}

type PostEditorShortcutHandlers = {
  onSave: () => void;
  onPublish: () => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  saving: boolean;
  metadataOpen: boolean;
};

export function usePostEditorShortcuts({
  onSave,
  onPublish,
  onOpenSettings,
  onCloseSettings,
  saving,
  metadataOpen,
}: PostEditorShortcutHandlers) {
  const onSaveRef = useRef(onSave);
  const onPublishRef = useRef(onPublish);
  const onOpenSettingsRef = useRef(onOpenSettings);
  const onCloseSettingsRef = useRef(onCloseSettings);
  const savingRef = useRef(saving);
  const metadataOpenRef = useRef(metadataOpen);

  onSaveRef.current = onSave;
  onPublishRef.current = onPublish;
  onOpenSettingsRef.current = onOpenSettings;
  onCloseSettingsRef.current = onCloseSettings;
  savingRef.current = saving;
  metadataOpenRef.current = metadataOpen;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && metadataOpenRef.current) {
        e.preventDefault();
        onCloseSettingsRef.current();
        return;
      }

      if (!isModKey(e)) return;

      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        if (savingRef.current) return;

        if (e.shiftKey) {
          onPublishRef.current();
        } else {
          onSaveRef.current();
        }
        return;
      }

      if (e.key === ",") {
        e.preventDefault();
        onOpenSettingsRef.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
