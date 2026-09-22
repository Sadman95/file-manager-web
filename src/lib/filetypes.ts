export interface FileKind {
  key: string;
  /** Short label, e.g. "HTML" — used for title/aria. */
  label: string;
  /** Glyph tint (hex — inline style, no Tailwind purge issues). */
  color: string;
  /** Key into FILETYPE_ICON_PATHS (Bootstrap Icons glyphs, vendored offline). */
  icon: string;
}

/** Lowercase extension without dot; "" when none (dotfiles, extensionless, "file."). */
export function getExtension(filename: string): string {
  const base = filename.trim().split(/[/\\]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}

const KINDS: Record<string, FileKind> = {
  html: { key: "html", label: "HTML", color: "#ea580c", icon: "filetype-html" },
  htm: { key: "html", label: "HTML", color: "#ea580c", icon: "filetype-html" },
  css: { key: "css", label: "CSS", color: "#2563eb", icon: "filetype-css" },
  scss: { key: "css", label: "SCSS", color: "#c6538c", icon: "filetype-scss" },
  sass: { key: "css", label: "SASS", color: "#c6538c", icon: "filetype-scss" },
  js: { key: "js", label: "JS", color: "#ca8a04", icon: "filetype-js" },
  jsx: { key: "js", label: "JSX", color: "#ca8a04", icon: "filetype-jsx" },
  mjs: { key: "js", label: "JS", color: "#ca8a04", icon: "filetype-js" },
  cjs: { key: "js", label: "JS", color: "#ca8a04", icon: "filetype-js" },
  ts: { key: "ts", label: "TS", color: "#1d4ed8", icon: "filetype-tsx" },
  tsx: { key: "ts", label: "TSX", color: "#1d4ed8", icon: "filetype-tsx" },
  json: { key: "json", label: "JSON", color: "#7c3aed", icon: "filetype-json" },
  md: { key: "md", label: "MD", color: "#0f766e", icon: "filetype-md" },
  markdown: { key: "md", label: "MD", color: "#0f766e", icon: "filetype-md" },
  txt: { key: "txt", label: "TXT", color: "#64748b", icon: "filetype-txt" },
  pdf: { key: "pdf", label: "PDF", color: "#dc2626", icon: "filetype-pdf" },
  png: { key: "image", label: "PNG", color: "#059669", icon: "filetype-png" },
  jpg: { key: "image", label: "JPG", color: "#059669", icon: "filetype-jpg" },
  jpeg: { key: "image", label: "JPG", color: "#059669", icon: "filetype-jpg" },
  gif: { key: "image", label: "GIF", color: "#059669", icon: "filetype-gif" },
  svg: { key: "image", label: "SVG", color: "#059669", icon: "filetype-svg" },
  webp: { key: "image", label: "Image", color: "#059669", icon: "file-earmark-image" },
  ico: { key: "image", label: "Image", color: "#059669", icon: "file-earmark-image" },
  mp3: { key: "audio", label: "MP3", color: "#9333ea", icon: "filetype-mp3" },
  wav: { key: "audio", label: "WAV", color: "#9333ea", icon: "filetype-wav" },
  ogg: { key: "audio", label: "Audio", color: "#9333ea", icon: "file-earmark-music" },
  mp4: { key: "video", label: "MP4", color: "#db2777", icon: "filetype-mp4" },
  mov: { key: "video", label: "MOV", color: "#db2777", icon: "filetype-mov" },
  webm: { key: "video", label: "Video", color: "#db2777", icon: "file-earmark-play" },
  zip: { key: "archive", label: "ZIP", color: "#475569", icon: "file-earmark-zip" },
  tar: { key: "archive", label: "Archive", color: "#475569", icon: "file-earmark-zip" },
  gz: { key: "archive", label: "Archive", color: "#475569", icon: "file-earmark-zip" },
  rar: { key: "archive", label: "Archive", color: "#475569", icon: "file-earmark-zip" },
  "7z": { key: "archive", label: "Archive", color: "#475569", icon: "file-earmark-zip" },
  py: { key: "py", label: "PY", color: "#3776ab", icon: "filetype-py" },
  csv: { key: "csv", label: "CSV", color: "#15803d", icon: "filetype-csv" },
  xml: { key: "xml", label: "XML", color: "#b45309", icon: "filetype-xml" },
  yml: { key: "yaml", label: "YAML", color: "#be123c", icon: "filetype-yml" },
  yaml: { key: "yaml", label: "YAML", color: "#be123c", icon: "filetype-yml" },
  sh: { key: "sh", label: "SH", color: "#111827", icon: "filetype-sh" },
  java: { key: "java", label: "Java", color: "#b45309", icon: "filetype-java" },
  rb: { key: "rb", label: "Ruby", color: "#cc342d", icon: "filetype-rb" },
  php: { key: "php", label: "PHP", color: "#777bb4", icon: "filetype-php" },
  doc: { key: "doc", label: "DOC", color: "#2b579a", icon: "filetype-doc" },
  docx: { key: "doc", label: "DOCX", color: "#2b579a", icon: "filetype-docx" },
  xls: { key: "xls", label: "XLS", color: "#217346", icon: "filetype-xls" },
  xlsx: { key: "xls", label: "XLSX", color: "#217346", icon: "filetype-xlsx" },
  ppt: { key: "ppt", label: "PPT", color: "#d24726", icon: "filetype-ppt" },
  pptx: { key: "ppt", label: "PPTX", color: "#d24726", icon: "filetype-pptx" },
};

const GENERIC: FileKind = {
  key: "file",
  label: "File",
  color: "#64748b",
  icon: "file-earmark-text",
};

/**
 * Pure mapping — call it with any draft string and the icon follows in real time.
 * Unknown extensions fall back to a generic glyph ("app.astro" → earmark).
 */
export function getFileKind(filename: string): FileKind {
  const ext = getExtension(filename);
  if (!ext) return GENERIC;
  return KINDS[ext] ?? { ...GENERIC, label: ext.toUpperCase() };
}
