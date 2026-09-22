"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEditorGuard } from "@/contexts/EditorGuardContext";
import { getFullPath, searchNodes } from "@/lib/filesystem";
import type { FSNode } from "@/types/filesystem";
import { FileIcon, FolderIcon } from "@/components/ui/Icons";

const MAX_RESULTS = 20;

/** First case-insensitive match wrapped in <mark>; plain text when no match. */
export function HighlightedName({ name, query }: { name: string; query: string }) {
  const q = query.trim().toLowerCase();
  const i = q === "" ? -1 : name.toLowerCase().indexOf(q);
  if (i === -1) return <>{name}</>;
  return (
    <>
      {name.slice(0, i)}
      <mark className="rounded-sm bg-yellow-200 px-px">{name.slice(i, i + q.length)}</mark>
      {name.slice(i + q.length)}
    </>
  );
}

export function SearchBar() {
  const { state, dispatch } = useWorkspace();
  const { guarded } = useEditorGuard();
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchNodes(state.nodes, query), [state.nodes, query]);
  const trimmed = query.trim();
  const visible = results.slice(0, MAX_RESULTS);

  const select = (node: FSNode) => {
    guarded(() => {
      if (node.type === "folder") {
        dispatch({ type: "SELECT_FOLDER", id: node.id });
      } else {
        dispatch({ type: "OPEN_FILE", id: node.id });
      }
    });
    setQuery("");
  };

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setQuery("");
        }}
        placeholder="Search files and folders…"
        aria-label="Search workspace"
        className="relative z-20 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
      />
      {trimmed !== "" && (
        <>
          <button
            type="button"
            aria-label="Close search results"
            onClick={() => setQuery("")}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {visible.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">No results for “{trimmed}”.</p>
            ) : (
              <ul className="max-h-72 overflow-auto py-1">
                {visible.map((node) => (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => select(node)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <span className="shrink-0">
                        {node.type === "folder" ? (
                          <span className="block text-sky-600">
                            <FolderIcon />
                          </span>
                        ) : (
                          <FileIcon name={node.name} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          <HighlightedName name={node.name} query={trimmed} />
                        </span>
                        <span className="block truncate text-xs text-slate-400">
                          {getFullPath(state.nodes, node.id)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {results.length > MAX_RESULTS && (
              <p className="border-t border-slate-100 px-4 py-1.5 text-xs text-slate-400">
                Showing {MAX_RESULTS} of {results.length} matches — keep typing to narrow down.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
