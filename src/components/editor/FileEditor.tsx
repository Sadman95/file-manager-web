// Text editor with drafts, inline rename, shortcuts, and dirty guard.
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEditorGuard } from "@/contexts/EditorGuardContext";
import { getFullPath, validateName } from "@/lib/filesystem";
import { FileIcon } from "@/components/ui/Icons";
import { cn } from "@/utils/cn";

export function FileEditor() {
  const { state, dispatch } = useWorkspace();
  const { registerGuard, guarded } = useEditorGuard();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const file = state.openFileId ? state.nodes[state.openFileId] : undefined;
  const savedName = file?.name ?? "";
  const savedContent = file?.type === "file" ? (file.content ?? "") : "";

  // Remounted per file via `key` in MainPanel, so initial drafts are always correct.
  const [contentDraft, setContentDraft] = useState(savedContent);
  const [nameDraft, setNameDraft] = useState(savedName);
  const [editingName, setEditingName] = useState(false);
  const [prevSavedName, setPrevSavedName] = useState(savedName);

  // If the open file is renamed elsewhere (e.g. via the list) while the user
  // hasn't typed their own name, follow the rename instead of going stale.
  if (prevSavedName !== savedName) {
    setPrevSavedName(savedName);
    if (!editingName && nameDraft === prevSavedName) setNameDraft(savedName);
  }

  const nameChanged = nameDraft.trim() !== savedName;
  const contentChanged = contentDraft !== savedContent;
  const dirty = nameChanged || contentChanged;
  const nameCheck = file
    ? validateName(state.nodes, file.parentId, nameDraft, file.id)
    : { ok: true as const, error: undefined };
  const nameError = nameCheck.ok ? undefined : nameCheck.error;

  // Let in-app navigation confirm before discarding edits.
  useEffect(() => {
    if (!file) return;
    registerGuard({
      isDirty: () => contentDraft !== savedContent || nameDraft.trim() !== savedName,
      discard: () => {
        setContentDraft(savedContent);
        setNameDraft(savedName);
        setEditingName(false);
      },
    });
    return () => registerGuard(null);
  }, [file, contentDraft, nameDraft, savedContent, savedName, registerGuard]);

  // Browser refresh / tab close with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  if (!file || file.type !== "file") return null;

  const save = () => {
    if (!dirty || nameError) return;
    if (nameChanged) dispatch({ type: "RENAME_NODE", id: file.id, name: nameDraft });
    if (contentChanged) {
      dispatch({ type: "UPDATE_FILE_CONTENT", id: file.id, content: contentDraft });
    }
    setNameDraft(nameDraft.trim());
    setEditingName(false);
    toast.success(`Saved “${nameDraft.trim() || savedName}”`);
  };

  /** Tab indents instead of leaving the field; Cmd/Ctrl+S saves in place. */
  const onContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = areaRef.current;
      if (!el) return;
      const { selectionStart: start, selectionEnd: end } = el;
      setContentDraft((d) => `${d.slice(0, start)}  ${d.slice(end)}`);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  };

  const discardAll = () => {
    setContentDraft(savedContent);
    setNameDraft(savedName);
    setEditingName(false);
  };

  const saveDisabled = !dirty || !!nameError;

  return (
    <section
      aria-label={`Editing ${file.name}`}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          save();
        }
      }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0">
            <FileIcon name={nameDraft} />
          </span>
          {editingName ? (
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setNameDraft(savedName);
                  setEditingName(false);
                }
              }}
              autoFocus
              onFocus={(e) => e.target.select()}
              aria-label="File name"
              className="w-44 rounded-md border border-slate-300 px-1.5 py-0.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-500"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              title="Click to rename"
              className="group/name flex min-w-0 items-center gap-1 rounded px-0.5 text-left"
            >
              <span
                className={cn(
                  "truncate text-sm font-semibold text-slate-900 group-hover/name:underline",
                  nameDraft.trim() === "" && "opacity-50",
                )}
              >
                {nameDraft.trim() === "" ? savedName : nameDraft}
              </span>
              <span className="shrink-0 text-xs text-slate-300 group-hover/name:text-slate-500">
                ✎
              </span>
              {dirty && (
                <span
                  title="Unsaved changes"
                  className="ml-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500"
                />
              )}
            </button>
          )}
          <p className="hidden truncate text-xs text-slate-400 lg:block">
            {getFullPath(state.nodes, file.id)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={discardAll}
            disabled={!dirty}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saveDisabled}
            title={nameError ?? undefined}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-medium text-white",
              saveDisabled ? "bg-slate-300" : "bg-slate-900 hover:bg-slate-700",
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
      {nameError && (
        <p role="alert" className="border-b border-slate-100 px-4 py-1.5 text-xs text-red-600">
          {nameError}
        </p>
      )}
      <textarea
        ref={areaRef}
        value={contentDraft}
        onChange={(e) => setContentDraft(e.target.value)}
        onKeyDown={onContentKeyDown}
        aria-label="File content (Tab indents, Cmd/Ctrl+S saves)"
        spellCheck={false}
        placeholder="Start typing…"
        className="h-64 w-full resize-y bg-white p-4 font-mono text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-300"
      />
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-1.5 text-xs text-slate-400">
        <span>{dirty ? "Unsaved changes" : "All changes saved"}</span>
        <span>
          {contentDraft.length} chars · {contentDraft === "" ? 0 : contentDraft.split("\n").length}{" "}
          lines
        </span>
      </div>
    </section>
  );
}
