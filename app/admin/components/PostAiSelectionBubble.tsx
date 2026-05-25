"use client";

import { useEffect, useState } from "react";
import {
  autoUpdate,
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
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  const { refs, floatingStyles } = useFloating({
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!selection || !textarea) {
      setAnchor(null);
      return;
    }

    function updateAnchor() {
      if (!selection || !textarea) return;
      const coords = getSelectionAnchorCoordinates(
        textarea,
        selection.start,
        selection.end
      );
      setAnchor({ x: coords.left, y: coords.top });
    }

    updateAnchor();

    textarea.addEventListener("scroll", updateAnchor);
    window.addEventListener("resize", updateAnchor);

    return () => {
      textarea.removeEventListener("scroll", updateAnchor);
      window.removeEventListener("resize", updateAnchor);
    };
  }, [selection, textarea]);

  useEffect(() => {
    if (!anchor) {
      refs.setReference(null);
      return;
    }

    refs.setReference({
      getBoundingClientRect: () => ({
        x: anchor.x,
        y: anchor.y,
        top: anchor.y,
        left: anchor.x,
        bottom: anchor.y,
        right: anchor.x,
        width: 0,
        height: 0,
      }),
    });
  }, [anchor, refs]);

  if (!selection?.text.trim() || !anchor) return null;

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
