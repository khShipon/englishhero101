"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

export type ParagraphValue = { label: string; text: string };

// Mirrors PairsEditor/OrderItemsEditor's repeater pattern from
// structured-editors.tsx, sized for passage paragraphs: an optional
// short label (e.g. "A" for a lettered paragraph) plus the paragraph
// body, reorderable since passage paragraph order matters for reading.
export function ParagraphsEditor({
  paragraphs,
  onChange,
}: {
  paragraphs: ParagraphValue[];
  onChange: (next: ParagraphValue[]) => void;
}) {
  function update(index: number, key: "label" | "text", value: string) {
    onChange(paragraphs.map((paragraph, i) => (i === index ? { ...paragraph, [key]: value } : paragraph)));
  }

  function add() {
    onChange([...paragraphs, { label: "", text: "" }]);
  }

  function remove(index: number) {
    onChange(paragraphs.filter((_, i) => i !== index));
  }

  function move(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= paragraphs.length) return;
    const next = [...paragraphs];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((paragraph, index) => (
        <div key={index} className="flex gap-2 rounded-md border p-2.5">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-sm text-muted-foreground">{index + 1}.</span>
              <Input
                value={paragraph.label}
                onChange={(event) => update(index, "label", event.target.value)}
                placeholder="Label (optional, e.g. A)"
                className="w-48"
              />
            </div>
            <Textarea
              value={paragraph.text}
              onChange={(event) => update(index, "text", event.target.value)}
              placeholder="Paragraph text"
              rows={4}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={index === 0}
              onClick={() => move(index, "up")}
              aria-label="Move up"
            >
              <ArrowUp />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={index === paragraphs.length - 1}
              onClick={() => move(index, "down")}
              aria-label="Move down"
            >
              <ArrowDown />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(index)}
              aria-label="Remove paragraph"
            >
              <X />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-fit">
        <Plus /> Add paragraph
      </Button>
    </div>
  );
}
