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

export function FileIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M3.5 1.5h5.2L12.5 5v9.5h-9v-13z"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d="M8.5 1.5V5H12" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}
