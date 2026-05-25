export type MarkdownFormatAction = (
  value: string,
  start: number,
  end: number
) => TextareaSelection;

export type TextareaSelection = {
  newValue: string;
  selectionStart: number;
  selectionEnd: number;
};

export function applyTextareaUpdate(
  textarea: HTMLTextAreaElement,
  update: TextareaSelection
) {
  textarea.value = update.newValue;
  textarea.focus();
  textarea.setSelectionRange(update.selectionStart, update.selectionEnd);
}

export function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string = before,
  placeholder = ""
): TextareaSelection {
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const newValue =
    value.slice(0, selectionStart) +
    before +
    selected +
    after +
    value.slice(selectionEnd);
  const start = selectionStart + before.length;
  const end = start + selected.length;
  return { newValue, selectionStart: start, selectionEnd: end };
}

export function insertAtCursor(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insert: string
): TextareaSelection {
  const newValue =
    value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
  const cursor = selectionStart + insert.length;
  return { newValue, selectionStart: cursor, selectionEnd: cursor };
}

export function prefixLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string
): TextareaSelection {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);
  const lines = selected.split("\n");
  const prefixed = lines.map((line) => (line ? `${prefix}${line}` : prefix)).join("\n");
  const newValue = before + prefixed + after;
  const end = selectionStart + prefixed.length;
  return { newValue, selectionStart, selectionEnd: end };
}
