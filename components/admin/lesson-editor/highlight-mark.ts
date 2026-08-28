import { mergeAttributes, Mark } from "@tiptap/core";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/types/lesson-content";

export interface HighlightOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: (color: HighlightColor) => ReturnType;
      unsetHighlight: () => ReturnType;
    };
  }
}

// A fixed 4-swatch highlighter (yellow/green/blue/pink), not the
// open-ended stock @tiptap/extension-highlight — this always emits a
// `data-color` attribute from HIGHLIGHT_COLORS so it round-trips
// through the strict `highlight` mark schema in types/lesson-content.ts
// instead of an arbitrary inline color the schema would reject.
export const Highlight = Mark.create<HighlightOptions>({
  name: "highlight",

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      color: {
        default: "yellow",
        parseHTML: (element: HTMLElement) => {
          const color = element.getAttribute("data-color");
          return (HIGHLIGHT_COLORS as readonly string[]).includes(color ?? "") ? color : "yellow";
        },
        renderHTML: (attributes: { color: HighlightColor }) => ({
          "data-color": attributes.color,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "mark[data-color]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setHighlight:
        (color: HighlightColor) =>
        ({ commands }) =>
          commands.setMark(this.name, { color }),
      unsetHighlight:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
