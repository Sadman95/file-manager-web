import type { FSNode, NodeMap, WorkspaceSnapshot } from "@/types/filesystem";

export const SEED_IDS = {
  root: "seed-root",
  projects: "seed-projects",
  webbly: "seed-webbly",
  personal: "seed-personal",
  documents: "seed-documents",
  notes: "seed-notes-txt",
  tasks: "seed-tasks-txt",
  readme: "seed-readme-txt",
} as const;

/** First-run demo tree from the spec — deep enough to show nesting + search. */
export function buildSeedSnapshot(): WorkspaceSnapshot {
  const now = Date.now();

  const make = (node: Omit<FSNode, "createdAt" | "updatedAt">, offset: number): FSNode => ({
    ...node,
    createdAt: now + offset,
    updatedAt: now + offset,
  });

  const list: FSNode[] = [
    make({ id: SEED_IDS.root, name: "Workspace", type: "folder", parentId: null }, 0),
    make({ id: SEED_IDS.projects, name: "Projects", type: "folder", parentId: SEED_IDS.root }, 1),
    make({ id: SEED_IDS.documents, name: "Documents", type: "folder", parentId: SEED_IDS.root }, 2),
    make(
      {
        id: SEED_IDS.readme,
        name: "README.txt",
        type: "file",
        parentId: SEED_IDS.root,
        content: "Welcome to your workspace!\n\nCreate folders and text files from the main panel.",
      },
      3,
    ),
    make({ id: SEED_IDS.webbly, name: "Webbly", type: "folder", parentId: SEED_IDS.projects }, 4),
    make(
      { id: SEED_IDS.personal, name: "Personal", type: "folder", parentId: SEED_IDS.projects },
      5,
    ),
    make(
      {
        id: SEED_IDS.notes,
        name: "notes.txt",
        type: "file",
        parentId: SEED_IDS.webbly,
        content: "Webbly launch notes\n- Landing page copy\n- Pricing draft",
      },
      6,
    ),
    make(
      {
        id: SEED_IDS.tasks,
        name: "tasks.txt",
        type: "file",
        parentId: SEED_IDS.webbly,
        content: "- [ ] Design review\n- [ ] Ship onboarding\n- [ ] Write changelog",
      },
      7,
    ),
  ];

  const nodes: NodeMap = Object.fromEntries(list.map((n) => [n.id, n]));
  return { nodes, rootId: SEED_IDS.root };
}
