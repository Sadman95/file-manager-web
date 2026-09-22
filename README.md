# Mini Workspace Explorer

Browser-based file manager — create, navigate, search, edit, rename, and delete folders and text files. Built with Next.js + TypeScript.

> Phase 1 scaffold. Full docs (structure, state, data model, decisions) land in Phase 7.

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build
npm run start
npm run lint
npm run check-types
npm run format
```

## Project structure (planned)

```text
src/
  app/          # App Router shell (layout, page)
  components/   # TreeView, MainPanel, Breadcrumb, FileEditor, Search, dialogs
  contexts/     # WorkspaceContext + reducer
  hooks/        # usePersistence, etc.
  lib/          # filesystem utils, seed data, storage
  types/        # FSNode, WorkspaceState
  utils/        # cn() class helper
```

## State management approach (planned)

Single `WorkspaceContext` + `useReducer`, flat `Record<id, FSNode>` store, persisted to `localStorage`.

## File-system data structure (planned)

```ts
interface FSNode {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  content?: string;
}
```

## Implementation decisions (planned)

Documented in Phase 7.
