"use client";

import { useLayoutEffect, useRef } from "react";
import {
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EditorSelection } from "@/app/admin/components/ImmersiveMarkdownEditor";
import { getSelectionAnchorCoordinates } from "@/lib/textarea-caret-position";

type PostAiSelectionBubbleProps = {
  selection: EditorSelection | null;
  textarea: HTMLTextAreaElement | null;
  loading: boolean;
  onPolish: () => void;
};

export default function PostAiSelectionBubble({
  selection,
  textarea,
  loading,
  onPolish,
}: PostAiSelectionBubbleProps) {
  const { refs, floatingStyles, update } = useFloating({
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  const updateRef = useRef(update);
  updateRef.current = update;

  useLayoutEffect(() => {
    if (!selection?.text.trim() || !textarea) {
      refs.setReference(null);
      return;
    }

    function syncReference() {
      if (!selection?.text.trim() || !textarea) return;

      const coords = getSelectionAnchorCoordinates(
        textarea,
        selection.start,
        selection.end
      );

      refs.setReference({
        getBoundingClientRect: () => ({
          x: coords.left,
          y: coords.top,
          top: coords.top,
          left: coords.left,
          bottom: coords.top,
          right: coords.left,
          width: 0,
          height: 0,
        }),
      });
      updateRef.current();
    }

    syncReference();

    textarea.addEventListener("scroll", syncReference);
    window.addEventListener("resize", syncReference);

    return () => {
      textarea.removeEventListener("scroll", syncReference);
      window.removeEventListener("resize", syncReference);
    };
  }, [selection, textarea, refs.setReference]);

  if (!selection?.text.trim() || !textarea) return null;

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-50 hidden sm:block"
    >
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-8 gap-1.5 shadow-md"
        disabled={loading}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onPolish}
      >
        <Wand2 className="h-3.5 w-3.5" />
        润色
      </Button>
    </div>
  );
}
