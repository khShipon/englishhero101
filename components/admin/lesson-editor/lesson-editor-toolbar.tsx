"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CalloutVariant, HighlightColor } from "@/types/lesson-content";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Minus,
  Rows,
  Columns,
  Trash2,
  Undo2,
  Redo2,
  Lightbulb,
  StickyNote,
  Highlighter,
  BookOpenCheck,
  MessageCircleQuestionMark,
  CircleCheck,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CALLOUT_OPTIONS: { variant: CalloutVariant; label: string; icon: typeof Lightbulb }[] = [
  { variant: "example", label: "Example", icon: Lightbulb },
  { variant: "note", label: "Note", icon: StickyNote },
  { variant: "highlight", label: "Highlight", icon: Highlighter },
  { variant: "grammar-rule", label: "Grammar rule", icon: BookOpenCheck },
  { variant: "question", label: "Question", icon: MessageCircleQuestionMark },
  { variant: "answer", label: "Answer", icon: CircleCheck },
];

const HIGHLIGHT_SWATCHES: { color: HighlightColor; label: string; className: string }[] = [
  { color: "yellow", label: "Yellow", className: "bg-[oklch(0.92_0.18_95)]" },
  { color: "green", label: "Green", className: "bg-[oklch(0.92_0.14_145)]" },
  { color: "blue", label: "Blue", className: "bg-[oklch(0.92_0.08_240)]" },
  { color: "pink", label: "Pink", className: "bg-[oklch(0.92_0.1_350)]" },
];

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      className={cn(active && "bg-muted text-foreground")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function LessonEditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border-b bg-muted/30 p-1.5">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough />
      </ToolbarButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-7 items-center gap-1 rounded-lg px-1.5 hover:bg-muted data-[popup-open]:bg-muted"
          aria-label="Highlight color"
        >
          <Highlighter className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {HIGHLIGHT_SWATCHES.map(({ color, label, className }) => (
            <button
              key={color}
              type="button"
              onClick={() => editor.chain().focus().setHighlight(color).run()}
              className="flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
            >
              <span className={cn("size-3.5 rounded-full border", className)} /> {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className="flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground [&_svg]:size-4"
          >
            <X /> Remove highlight
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
      <ToolbarButton
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          const url = window.prompt("Link URL (https://, mailto:, or /path):");
          if (!url) return;
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        <LinkIcon />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        label="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight />
      </ToolbarButton>
      <ToolbarButton
        label="Justify"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 4"
        active={editor.isActive("heading", { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <Heading4 />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote />
      </ToolbarButton>
      <ToolbarButton
        label="Insert table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <TableIcon />
      </ToolbarButton>
      {editor.isActive("table") && (
        <>
          <ToolbarButton
            label="Add row below"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <Rows />
          </ToolbarButton>
          <ToolbarButton
            label="Add column right"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Columns />
          </ToolbarButton>
          <ToolbarButton label="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Rows className="text-destructive" />
          </ToolbarButton>
          <ToolbarButton
            label="Delete column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Columns className="text-destructive" />
          </ToolbarButton>
          <ToolbarButton
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 className="text-destructive" />
          </ToolbarButton>
        </>
      )}
      <ToolbarButton
        label="Insert pronunciation button"
        onClick={() => {
          const text = window.prompt("Word or phrase to pronounce:");
          if (text) editor.chain().focus().setPronounce(text).run();
        }}
      >
        <Volume2 />
      </ToolbarButton>
      <ToolbarButton
        label="Insert divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-7 items-center gap-1 rounded-lg px-2 text-sm hover:bg-muted"
        >
          <Lightbulb className="size-4" /> Insert block
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {CALLOUT_OPTIONS.map(({ variant, label, icon: Icon }) => (
            <button
              key={variant}
              type="button"
              onClick={() => editor.chain().focus().setCallout(variant).run()}
              className="flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground [&_svg]:size-4"
            >
              <Icon /> {label}
            </button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 />
        </ToolbarButton>
      </div>
    </div>
  );
}
