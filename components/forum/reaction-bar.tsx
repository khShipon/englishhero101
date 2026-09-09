"use client";

import { useState, useTransition } from "react";
import { toggleReaction, type ReactionTarget } from "@/lib/forum/reaction-actions";
import type { ReactionType } from "@/lib/queries/forum";
import { ThumbsUp, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReactionBar({
  target,
  initialLike,
  initialLove,
  initialMine,
}: {
  target: ReactionTarget;
  initialLike: number;
  initialLove: number;
  initialMine: ReactionType | null;
}) {
  const [state, setState] = useState({ like: initialLike, love: initialLove, mine: initialMine });
  const [pending, startTransition] = useTransition();

  function handleClick(type: ReactionType) {
    const previous = state;
    setState((current) => {
      const next = { ...current };
      if (current.mine === type) {
        next.mine = null;
        if (type === "like") next.like--;
        else next.love--;
      } else {
        if (current.mine === "like") next.like--;
        else if (current.mine === "love") next.love--;
        next.mine = type;
        if (type === "like") next.like++;
        else next.love++;
      }
      return next;
    });

    startTransition(async () => {
      try {
        await toggleReaction(target, type);
      } catch {
        setState(previous);
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => handleClick("like")}
        aria-pressed={state.mine === "like"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
          state.mine === "like"
            ? "bg-blue-600/10 text-blue-600"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <ThumbsUp className={cn("size-3.5", state.mine === "like" && "fill-current")} />
        Like{state.like > 0 && <span>· {state.like}</span>}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => handleClick("love")}
        aria-pressed={state.mine === "love"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
          state.mine === "love"
            ? "bg-pink-600/10 text-pink-600"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Heart className={cn("size-3.5", state.mine === "love" && "fill-current")} />
        Love{state.love > 0 && <span>· {state.love}</span>}
      </button>
    </div>
  );
}
