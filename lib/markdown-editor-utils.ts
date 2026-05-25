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

export function prefixOrderedLines(
  value: string,
  selectionStart: number,
  selectionEnd: number
): TextareaSelection {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);
  const lines = selected.split("\n");
  const prefixed = lines
    .map((line, index) => (line ? `${index + 1}. ${line}` : `${index + 1}. `))
    .join("\n");
  const newValue = before + prefixed + after;
  const end = selectionStart + prefixed.length;
  return { newValue, selectionStart, selectionEnd: end };
}

function padBlockInsert(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  block: string,
  highlightStart: number,
  highlightEnd: number
): TextareaSelection {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const prefix =
    before.length > 0 && !before.endsWith("\n\n")
      ? before.endsWith("\n")
        ? "\n"
        : "\n\n"
      : "";
  const suffix =
    after.length > 0 && !after.startsWith("\n\n")
      ? after.startsWith("\n")
        ? "\n"
        : "\n\n"
      : after.length > 0
        ? ""
        : "\n";
  const insert = prefix + block + suffix;
  const newValue = before + insert + after;
  const anchor = before.length + prefix.length;
  return {
    newValue,
    selectionStart: anchor + highlightStart,
    selectionEnd: anchor + highlightEnd,
  };
}

export function insertCodeBlock(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  language = ""
): TextareaSelection {
  const selected = value.slice(selectionStart, selectionEnd);
  const code = selected || "// code here";
  const block = `\`\`\`${language}\n${code}\n\`\`\``;
  const highlightStart = `\`\`\`${language}\n`.length;
  return padBlockInsert(
    value,
    selectionStart,
    selectionEnd,
    block,
    highlightStart,
    highlightStart + code.length
  );
}

export function insertTable(
  value: string,
  selectionStart: number,
  selectionEnd: number
): TextareaSelection {
  const block = `| 列 1 | 列 2 | 列 3 |
| --- | --- | --- |
| 内容 | 内容 | 内容 |`;
  const highlightStart = block.indexOf("列 1");
  const highlightEnd = block.indexOf("内容") + "内容".length;
  return padBlockInsert(
    value,
    selectionStart,
    selectionEnd,
    block,
    highlightStart,
    highlightEnd
  );
}

export function insertHorizontalRule(
  value: string,
  selectionStart: number,
  selectionEnd: number
): TextareaSelection {
  return insertAtCursor(value, selectionStart, selectionEnd, "\n\n---\n\n");
}
