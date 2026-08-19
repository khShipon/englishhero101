import { mergeAttributes, Node } from "@tiptap/core";
import type { CalloutVariant } from "@/types/lesson-content";

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (variant: CalloutVariant) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

// Backs the six semantic blocks the brief asks for (example, note,
// highlight, grammar rule, question, answer) as one node type with a
// `variant` attribute instead of six near-identical node definitions.
export const Callout = Node.create<CalloutOptions>({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      variant: {
        default: "note",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-variant") || "note",
        renderHTML: (attributes: { variant: CalloutVariant }) => ({
          "data-variant": attributes.variant,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-callout": "" }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant: CalloutVariant) =>
        ({ commands }) =>
          commands.wrapIn(this.name, { variant }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});
