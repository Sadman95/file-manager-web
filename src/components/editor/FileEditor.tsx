"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEditorGuard } from "@/contexts/EditorGuardContext";
import { getFullPath } from "@/lib/filesystem";
import { FileIcon } from "@/components/ui/Icons";
import { cn } from "@/utils/cn";

export function FileEditor() {
  const { state, dispatch } = useWorkspace();
  const { registerGuard, guarded } = useEditorGuard();
  const file = state.openFileId ? state.nodes[state.openFileId] : undefined;
  const saved = file?.type === "file" ? (file.content ?? "") : "";
  // Remounted per file via `key` in MainPanel, so initial draft is always correct.
  const [draft, setDraft] = useState(saved);

  const dirty = draft !== saved;

  // Let in-app navigation confirm before discarding edits.
  useEffect(() => {
    if (!file) return;
    registerGuard({
      isDirty: () => draft !== saved,
      discard: () => setDraft(saved),
    });
    return () => registerGuard(null);
  }, [file, draft, saved, registerGuard]);

  // Browser refresh / tab close with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  if (!file || file.type !== "file") return null;

  const save = () => {
    if (!dirty) return;
    dispatch({ type: "UPDATE_FILE_CONTENT", id: file.id, content: draft });
  };

  return (
    <section
      aria-label={`Editing ${file.name}`}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-slate-400">
            <FileIcon />
          </span>
          <p className="truncate text-sm font-semibold text-slate-900">
            {file.name}
            {dirty && (
              <span title="Unsaved changes" className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />
            )}
          </p>
          <p className="hidden truncate text-xs text-slate-400 lg:block">
            {getFullPath(state.nodes, file.id)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(saved)}
            disabled={!dirty}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-medium text-white",
              dirty ? "bg-slate-900 hover:bg-slate-700" : "bg-slate-300",
            )}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => guarded(() => dispatch({ type: "CLOSE_FILE" }))}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="File content"
        spellCheck={false}
        placeholder="Start typing…"
        className="h-64 w-full resize-y bg-white p-4 font-mono text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-300"
      />
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-1.5 text-xs text-slate-400">
        <span>{dirty ? "Unsaved changes" : "All changes saved"}</span>
        <span>
          {draft.length} chars · {draft === "" ? 0 : draft.split("\n").length} lines
        </span>
      </div>
    </section>
  );
}
