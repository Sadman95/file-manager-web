# Mini Workspace Explorer

Browser-based file manager — create, navigate, search, edit, rename, and delete folders and text files. Built with Next.js + TypeScript. No backend; everything persists in the browser.

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command              | Purpose                              |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the dev server                 |
| `npm run build`      | Production build                     |
| `npm run start`      | Serve the production build           |
| `npm run lint`       | ESLint                               |
| `npm run check-types`| TypeScript check (`tsc --noEmit`)    |
| `npm run test`       | Vitest unit tests                    |
| `npm run format`     | Prettier write over `src/`           |

Requires Node ≥ 20. First launch seeds a demo tree (`Workspace / Projects / Webbly / notes.txt …`) so nesting and search work immediately.

## Project structure

```text
src/
  app/                 # App Router shell (layout, page → providers + AppShell)
  components/
    layout/            # AppShell (header, responsive sidebar, main)
    sidebar/           # TreeView (recursive folders-only tree)
    breadcrumb/        # Breadcrumb (clickable root → current path)
    main/              # MainPanel (toolbar, folder/file cards, dialogs)
    editor/            # FileEditor (textarea + dirty tracking)
    search/            # SearchBar (workspace-wide results dropdown)
    dialogs/           # Create / Rename / Delete dialogs
    ui/                # Reusable Modal, AppForm + TextField, Icons
  contexts/            # WorkspaceContext (reducer + provider), EditorGuardContext
  lib/                 # filesystem utils, seed data, storage, validation schema
  types/               # FSNode, NodeMap, WorkspaceSnapshot
  utils/               # cn() class helper
```

SOC: `lib/` holds pure domain logic (testable without React), `contexts/` owns state transitions, `components/` only renders and dispatches.

## State management approach

Single `WorkspaceContext` + `useReducer`, following the existing `contexts/` pattern:

```ts
interface WorkspaceState {
  nodes: Record<string, FSNode>; // flat map, children derived via parentId
  rootId: string;
  selectedFolderId: string;      // main panel + tree highlight + breadcrumb
  openFileId: string | null;     // session-only, never persisted
  expandedIds: string[];         // tree expand state (array → JSON-friendly)
  isHydrated: boolean;           // false until localStorage loads
}
```

Actions: `CREATE_NODE / RENAME_NODE / DELETE_NODE / UPDATE_FILE_CONTENT / SELECT_FOLDER / OPEN_FILE / CLOSE_FILE / TOGGLE_EXPAND / HYDRATE / RESET_TO_SEED`. The reducer defensively re-validates (unknown ids, non-folders, duplicates, root delete are no-ops) so UI bugs can't corrupt state.

Persistence (`lib/storage.ts`, key `mini-workspace:v1`): server renders the seed, then a mount effect hydrates from `localStorage` (schema-validated, corrupt data falls back to seed), and every state change re-saves. `openFileId` is intentionally session-only.

Unsaved edits (`contexts/EditorGuardContext.tsx`): the open editor registers `{ isDirty, discard }`; all in-app navigation (tree, breadcrumb, cards, close) goes through `guarded(action)`, which shows a confirm modal when dirty. Refresh/tab-close is covered by `beforeunload`.

## File-system data structure

Flat normalized map — not a nested tree:

```ts
interface FSNode {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null; // null only for the workspace root
  content?: string;        // files only, plain text
  createdAt: number;
  updatedAt: number;
}
```

`lib/filesystem.ts` derives everything else: `getChildren` (folders-first, A–Z), `getDescendantIds` (iterative DFS, cycle-safe — powers recursive delete), `getAncestorPath` / `getFullPath` (breadcrumb, search display), `validateName` (empty, `/\`, per-folder case-insensitive duplicates), `searchNodes` (workspace-wide substring).

## Implementation decisions

- **Flat map over nested tree:** immutable updates stay one level deep, `JSON.stringify` persists directly, and search/breadcrumb are simple `parentId` walks. O(n) scans are irrelevant at this scale.
- **No store library:** Context + `useReducer` is enough; adding Zustand/Redux would be over-engineering and harder to defend line-by-line.
- **`localStorage` over IndexedDB:** synchronous, zero dependencies, plenty for text files; guarded with try/catch + versioned schema validation.
- **Forms (`react-hook-form` + `zod`):** `AppForm<T>` + controlled `TextField` (via `useController`) are reused by Create/Rename; zod checks shape, `validateName()` remains the single source for uniqueness (it needs live state).
- **Editor draft is local:** typing never touches global state; only Save dispatches, so navigation + refresh semantics are explicit (confirm / `beforeunload`).
- **Sidebar shows folders only** (spec); the main panel shows both. Selection auto-expands ancestors so breadcrumb/search jumps always reveal the tree path.
- **Root is undeletable**, deleting a selected folder reselects the nearest surviving parent, and deleting an open file closes it — all covered by reducer unit tests (`13` tests across domain, reducer, and schema).
