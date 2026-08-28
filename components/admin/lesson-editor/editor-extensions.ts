import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Callout } from "./callout-node";
import { Pronounce } from "./pronounce-node";
import { Highlight } from "./highlight-mark";

// Only the node/mark types types/lesson-content.ts validates and
// LessonRenderer knows how to render are enabled here — anything
// StarterKit ships that isn't part of the brief's feature list (code
// blocks) is turned off so the editor can never produce content the
// schema would reject.
export const lessonEditorExtensions = [
  StarterKit.configure({
    code: false,
    codeBlock: false,
    heading: { levels: [2, 3, 4] },
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      protocols: ["http", "https", "mailto"],
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    },
  }),
  TableKit.configure({
    table: { resizable: false },
  }),
  TextAlign.configure({
    types: ["paragraph", "heading"],
    alignments: ["left", "center", "right", "justify"],
  }),
  Callout,
  Pronounce,
  Highlight,
  Placeholder.configure({
    placeholder: "Start writing the lesson...",
  }),
];
