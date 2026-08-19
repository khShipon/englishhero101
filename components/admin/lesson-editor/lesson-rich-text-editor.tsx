"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { lessonEditorExtensions } from "./editor-extensions";
import { LessonEditorToolbar } from "./lesson-editor-toolbar";
import { EMPTY_LESSON_CONTENT, type LessonContent } from "@/types/lesson-content";

export function LessonRichTextEditor({
  name,
  initialContent,
}: {
  name: string;
  initialContent?: LessonContent;
}) {
  const [json, setJson] = useState<LessonContent>(initialContent ?? EMPTY_LESSON_CONTENT);

  const editor = useEditor({
    extensions: lessonEditorExtensions,
    content: initialContent ?? EMPTY_LESSON_CONTENT,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => {
      setJson(editor.getJSON() as LessonContent);
    },
  });

  return (
    <div className="rounded-lg border">
      {editor && <LessonEditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={JSON.stringify(json)} />
    </div>
  );
}
