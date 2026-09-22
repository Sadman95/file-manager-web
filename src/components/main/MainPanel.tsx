"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getChildren } from "@/lib/filesystem";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { FileIcon, FolderIcon } from "@/components/ui/Icons";

export function MainPanel() {
  const { state, dispatch } = useWorkspace();
  const current = state.nodes[state.selectedFolderId];
  const items = getChildren(state.nodes, state.selectedFolderId);
  const openFile = state.openFileId ? state.nodes[state.openFileId] : undefined;

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
        <Breadcrumb />
        <p className="mt-1 text-xs text-slate-400">
          {items.length === 0
            ? "Empty folder"
            : `${items.filter((i) => i.type === "folder").length} folders · ${items.filter((i) => i.type === "file").length} files`}
        </p>
      </div>

      {openFile?.type === "file" && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-sky-900">
              Open: {openFile.name} <span className="font-normal text-sky-600">(preview)</span>
            </p>
            <button
              type="button"
              onClick={() => dispatch({ type: "CLOSE_FILE" })}
              className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100"
            >
              Close
            </button>
          </div>
          <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-white p-3 text-xs whitespace-pre-wrap text-slate-700">
            {openFile.content || "(empty file)"}
          </pre>
          <p className="mt-1 text-xs text-sky-600">Full editor lands in Phase 6.</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-700">This folder is empty</p>
          <p className="mt-1 text-sm text-slate-500">
            Create a folder or text file to get started (Phase 5).
          </p>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) =>
            item.type === "folder" ? (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_FOLDER", id: item.id })}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-slate-300 hover:shadow-sm"
                >
                  <span className="text-sky-600">
                    <FolderIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </span>
                    <span className="block text-xs text-slate-400">Folder</span>
                  </span>
                </button>
              </li>
            ) : (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "OPEN_FILE", id: item.id })}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-slate-300 hover:shadow-sm"
                >
                  <span className="text-slate-400">
                    <FileIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </span>
                    <span className="block text-xs text-slate-400">Text file</span>
                  </span>
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
