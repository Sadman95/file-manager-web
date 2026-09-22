// Guards in-app navigation against unsaved editor changes via confirm modal.
"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";

interface GuardHandlers {
  isDirty: () => boolean;
  discard: () => void;
}

interface EditorGuardValue {
  /** Register the open editor's dirty-check + discard. Pass null when no editor. */
  registerGuard: (handlers: GuardHandlers | null) => void;
  /** Run `action`, first confirming if the editor has unsaved changes. */
  guarded: (action: () => void) => void;
}

const EditorGuardContext = createContext<EditorGuardValue | null>(null);

export function EditorGuardProvider({ children }: { children: ReactNode }) {
  const guardRef = useRef<GuardHandlers | null>(null);
  const [pending, setPending] = useState<(() => void) | null>(null);

  const registerGuard = useCallback((handlers: GuardHandlers | null) => {
    guardRef.current = handlers;
  }, []);

  const guarded = useCallback((action: () => void) => {
    if (guardRef.current?.isDirty()) {
      setPending(() => action);
    } else {
      action();
    }
  }, []);

  const confirmDiscard = useCallback(() => {
    guardRef.current?.discard();
    const action = pending;
    setPending(null);
    // Run after discard resets the draft so the editor re-syncs cleanly.
    action?.();
  }, [pending]);

  return (
    <EditorGuardContext.Provider value={{ registerGuard, guarded }}>
      {children}
      {pending && (
        <Modal title="Unsaved changes" onClose={() => setPending(null)}>
          <p className="text-sm text-slate-600">
            You have unsaved changes. Discard them and continue?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              autoFocus
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={confirmDiscard}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
            >
              Discard changes
            </button>
          </div>
        </Modal>
      )}
    </EditorGuardContext.Provider>
  );
}

export function useEditorGuard(): EditorGuardValue {
  const ctx = useContext(EditorGuardContext);
  if (!ctx) throw new Error("useEditorGuard must be used within EditorGuardProvider");
  return ctx;
}
