import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import { Callout } from "./callout-node";

// Only the node/mark types types/lesson-content.ts validates and
// LessonRenderer knows how to render are enabled here — anything
// StarterKit ships that isn't part of the brief's feature list (code
// blocks, strikethrough, links, horizontal rules) is turned off so the
// editor can never produce content the schema would reject.
export const lessonEditorExtensions = [
  StarterKit.configure({
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    link: false,
    heading: { levels: [2, 3, 4] },
  }),
  TableKit.configure({
    table: { resizable: false },
  }),
  Callout,
  Placeholder.configure({
    placeholder: "Start writing the lesson...",
  }),
];
