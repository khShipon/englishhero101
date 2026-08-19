"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

export type OptionValue = { text: string; isCorrect: boolean };

// Shared by multiple_choice, multiple_answer, and true_false. `locked`
// fixes the option labels (used for true_false's "True"/"False") so
// only which one is correct can change. `multiple` switches between
// checkbox semantics (multiple_answer) and radio semantics (single
// correct option).
export function OptionsEditor({
  options,
  onChange,
  multiple,
  locked = false,
}: {
  options: OptionValue[];
  onChange: (next: OptionValue[]) => void;
  multiple: boolean;
  locked?: boolean;
}) {
  function updateText(index: number, text: string) {
    onChange(options.map((option, i) => (i === index ? { ...option, text } : option)));
  }

  function toggleCorrect(index: number) {
    if (multiple) {
      onChange(
        options.map((option, i) => (i === index ? { ...option, isCorrect: !option.isCorrect } : option)),
      );
    } else {
      onChange(options.map((option, i) => ({ ...option, isCorrect: i === index })));
    }
  }

  function addOption() {
    onChange([...options, { text: "", isCorrect: false }]);
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type={multiple ? "checkbox" : "radio"}
            checked={option.isCorrect}
            onChange={() => toggleCorrect(index)}
            className="size-4 shrink-0"
            aria-label="Correct answer"
          />
          <Input
            value={option.text}
            onChange={(event) => updateText(index, event.target.value)}
            placeholder={`Option ${index + 1}`}
            disabled={locked}
          />
          {!locked && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeOption(index)}
              aria-label="Remove option"
            >
              <X />
            </Button>
          )}
        </div>
      ))}
      {!locked && (
        <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-fit">
          <Plus /> Add option
        </Button>
      )}
    </div>
  );
}

export type PairValue = { left: string; right: string };

export function PairsEditor({
  pairs,
  onChange,
}: {
  pairs: PairValue[];
  onChange: (next: PairValue[]) => void;
}) {
  function update(index: number, key: "left" | "right", value: string) {
    onChange(pairs.map((pair, i) => (i === index ? { ...pair, [key]: value } : pair)));
  }

  function add() {
    onChange([...pairs, { left: "", right: "" }]);
  }

  function remove(index: number) {
    onChange(pairs.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={pair.left}
            onChange={(event) => update(index, "left", event.target.value)}
            placeholder="Item"
          />
          <span className="shrink-0 text-muted-foreground">↔</span>
          <Input
            value={pair.right}
            onChange={(event) => update(index, "right", event.target.value)}
            placeholder="Matches with"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(index)}
            aria-label="Remove pair"
          >
            <X />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-fit">
        <Plus /> Add pair
      </Button>
    </div>
  );
}

export function OrderItemsEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) {
  function update(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  function add() {
    onChange([...items, ""]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Items in their correct order.</p>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-sm text-muted-foreground">{index + 1}.</span>
          <Input
            value={item}
            onChange={(event) => update(index, event.target.value)}
            placeholder={`Item ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => move(index, "up")}
            aria-label="Move up"
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
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
            aria-label="Remove item"
          >
            <X />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-fit">
        <Plus /> Add item
      </Button>
    </div>
  );
}
