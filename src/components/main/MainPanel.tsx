// Main panel: breadcrumb, toolbar, item cards, and CRUD dialogs.
"use client";

import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEditorGuard } from "@/contexts/EditorGuardContext";
import { getChildren } from "@/lib/filesystem";
import { timeAgo } from "@/lib/time";
import type { FSNode, NodeMap, NodeType } from "@/types/filesystem";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { FileEditor } from "@/components/editor/FileEditor";
import { FileIcon, FolderIcon } from "@/components/ui/Icons";
import { CreateDialog } from "@/components/dialogs/CreateDialog";
import { RenameDialog } from "@/components/dialogs/RenameDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";

type DialogState =
  | { kind: "create"; nodeType: NodeType }
  | { kind: "rename"; id: string }
  | { kind: "delete"; id: string }
  | null;

/** Files show recency; folders show contents (folder `updatedAt` doesn't track children). */
export function itemSubtitle(nodes: NodeMap, item: FSNode): string {
  if (item.type === "file") return `Text file · ${timeAgo(item.updatedAt)}`;
  const count = getChildren(nodes, item.id).length;
  if (count === 0) return "Empty folder";
  return `${count} item${count === 1 ? "" : "s"}`;
}

export function MainPanel() {
  const { state, dispatch } = useWorkspace();
  const { guarded } = useEditorGuard();
  const [dialog, setDialog] = useState<DialogState>(null);
  const current = state.nodes[state.selectedFolderId];
  const items = getChildren(state.nodes, state.selectedFolderId);

  if (!current) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">Selected folder no longer exists.</p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Breadcrumb />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDialog({ kind: "create", nodeType: "folder" })}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              + Folder
            </button>
            <button
              type="button"
              onClick={() => setDialog({ kind: "create", nodeType: "file" })}
              className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
            >
              + File
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {items.length === 0
            ? "Empty folder"
            : `${items.filter((i) => i.type === "folder").length} folders · ${items.filter((i) => i.type === "file").length} files`}
        </p>
      </div>

      <FileEditor key={state.openFileId ?? "closed"} />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-700">This folder is empty</p>
          <p className="mt-1 text-sm text-slate-500">
            Create a folder or text file to get started.
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDialog({ kind: "create", nodeType: "folder" })}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              New folder
            </button>
            <button
              type="button"
              onClick={() => setDialog({ kind: "create", nodeType: "file" })}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              New file
            </button>
          </div>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 hover:border-slate-300 hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  guarded(() =>
                    item.type === "folder"
                      ? dispatch({ type: "SELECT_FOLDER", id: item.id })
                      : dispatch({ type: "OPEN_FILE", id: item.id }),
                  )
                }
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="shrink-0">
                  {item.type === "folder" ? (
                    <span className="block text-sky-600">
                      <FolderIcon className="h-5 w-5" />
                    </span>
                  ) : (
                    <FileIcon name={item.name} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {itemSubtitle(state.nodes, item)}
                  </span>
                </span>
              </button>
              <span className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 max-md:opacity-100">
                <button
                  type="button"
                  aria-label={`Rename ${item.name}`}
                  title="Rename"
                  onClick={() => setDialog({ kind: "rename", id: item.id })}
                  className="rounded-md px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  ✎
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  title="Delete"
                  onClick={() => setDialog({ kind: "delete", id: item.id })}
                  className="rounded-md px-1.5 py-1 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  🗑
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {dialog?.kind === "create" && (
        <CreateDialog
          parentId={state.selectedFolderId}
          initialType={dialog.nodeType}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "rename" && (
        <RenameDialog nodeId={dialog.id} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === "delete" && (
        <DeleteDialog nodeId={dialog.id} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
