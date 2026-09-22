// App shell: header with search, responsive sidebar, and main panel.
"use client";

import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { TreeView } from "@/components/sidebar/TreeView";
import { MainPanel } from "@/components/main/MainPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { cn } from "@/utils/cn";

export function AppShell() {
  const { state } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!state.isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading workspace…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 md:hidden"
        >
          ☰
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900">
            Mini Workspace Explorer
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Create, navigate, search, and edit folders + text files.
          </p>
        </div>
        <div className="order-last flex w-full min-w-0 sm:order-none sm:ml-auto sm:w-auto sm:flex-1 sm:justify-end">
          <SearchBar />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 items-start gap-4 p-4 sm:p-6">
        <aside
          className={cn(
            "w-72 shrink-0 rounded-xl border border-slate-200 bg-white p-3",
            "fixed inset-y-0 left-0 z-20 mt-14 max-h-[calc(100vh-4rem)] overflow-auto shadow-lg md:static md:z-auto md:mt-0 md:max-h-none md:shadow-none",
            sidebarOpen ? "block" : "hidden md:block",
          )}
        >
          <div className="mb-2 flex items-center justify-between px-2">
            <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Folders
            </h2>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 md:hidden"
            >
              Close
            </button>
          </div>
          <TreeView />
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-10 bg-slate-900/20 md:hidden"
          />
        )}

        <main className="min-w-0 flex-1" onClick={() => setSidebarOpen(false)}>
          <MainPanel />
        </main>
      </div>
    </div>
  );
}
