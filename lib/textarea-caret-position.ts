export type CaretCoordinates = {
  top: number;
  left: number;
  height: number;
};

const MIRROR_STYLE_PROPS = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "MozTabSize",
] as const;

function copyTextareaStyles(source: HTMLTextAreaElement, target: HTMLDivElement) {
  const style = window.getComputedStyle(source);
  for (const prop of MIRROR_STYLE_PROPS) {
    target.style.setProperty(prop, style.getPropertyValue(prop));
  }
  target.style.position = "absolute";
  target.style.visibility = "hidden";
  target.style.whiteSpace = "pre-wrap";
  target.style.wordWrap = "break-word";
  target.style.top = "0";
  target.style.left = "-9999px";
}

function getMirrorDiv(textarea: HTMLTextAreaElement): HTMLDivElement {
  const existing = textarea.parentElement?.querySelector<HTMLDivElement>(
    "[data-textarea-mirror]"
  );
  if (existing) return existing;

  const mirror = document.createElement("div");
  mirror.setAttribute("data-textarea-mirror", "true");
  textarea.parentElement?.appendChild(mirror);
  return mirror;
}

export function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number
): CaretCoordinates {
  const mirror = getMirrorDiv(textarea);
  copyTextareaStyles(textarea, mirror);

  const value = textarea.value;
  const before = value.slice(0, position);
  const after = value.slice(position) || ".";

  mirror.textContent = before;
  const marker = document.createElement("span");
  marker.textContent = after[0] === "\n" ? " " : after;
  mirror.appendChild(marker);

  const textareaRect = textarea.getBoundingClientRect();
  const markerRect = marker.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();

  const top =
    markerRect.top -
    mirrorRect.top -
    textarea.scrollTop +
    textareaRect.top;
  const left =
    markerRect.left -
    mirrorRect.left -
    textarea.scrollLeft +
    textareaRect.left;

  mirror.textContent = "";

  return {
    top,
    left,
    height: markerRect.height || parseFloat(window.getComputedStyle(textarea).lineHeight) || 20,
  };
}

export function getSelectionAnchorCoordinates(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number
): CaretCoordinates {
  const anchor = start === end ? end : Math.floor((start + end) / 2);
  return getCaretCoordinates(textarea, anchor);
}
