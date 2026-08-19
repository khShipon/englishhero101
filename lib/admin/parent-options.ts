import type { ContentTreeNode } from "@/types/content";

export type ParentOption = { id: string; label: string };

// Flattens the tree into indented options for a parent-picker <select>.
// Excluding `excludeId` also skips its whole subtree, since a node can
// never be its own ancestor (the same rule updateContentNode enforces
// server-side — this just keeps invalid choices out of the UI).
export function flattenParentOptions(nodes: ContentTreeNode[], excludeId?: string): ParentOption[] {
  const options: ParentOption[] = [];

  function walk(list: ContentTreeNode[], depth: number) {
    for (const node of list) {
      if (node.id === excludeId) continue;
      options.push({ id: node.id, label: `${"— ".repeat(depth)}${node.title}` });
      walk(node.children, depth + 1);
    }
  }

  walk(nodes, 0);
  return options;
}
