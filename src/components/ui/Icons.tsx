// Shared glyphs: chevron, folder, and the extension-aware file icon.
import { getFileKind } from "@/lib/filetypes";
import { FILETYPE_ICON_PATHS } from "@/components/ui/filetype-icons";
import { cn } from "@/utils/cn";

interface IconProps {
  className?: string;
}

export function ChevronIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FolderIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M1.5 4.5a1 1 0 011-1h3l1.2 1.5h5.8a1 1 0 011 1v4.5a1 1 0 01-1 1h-10a1 1 0 01-1-1v-6z"
        fill="currentColor"
        opacity={0.9}
      />
    </svg>
  );
}

/**
 * Real per-extension glyph (Bootstrap Icons, vendored offline) tinted by kind.
 * Pure function of `name`, so it follows the text live wherever the name is
 * draft state (create/rename/editor). Falls back to a generic glyph.
 */
export function FileIcon({ name, className = "h-5 w-5" }: IconProps & { name?: string }) {
  const kind = getFileKind(name ?? "");
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      style={{ color: kind.color }}
      className={cn("shrink-0", className)}
      // Build-time generated from a trusted MIT package; no runtime input inside.
      dangerouslySetInnerHTML={{ __html: FILETYPE_ICON_PATHS[kind.icon] }}
    />
  );
}
