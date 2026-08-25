"use client";

import { useState, useTransition } from "react";
import { toggleLessonComplete } from "@/lib/student/progress-actions";
import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";

export function MarkCompleteButton({
  lessonId,
  initialCompleted,
}: {
  lessonId: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const next = !completed;
    setCompleted(next); // optimistic
    startTransition(async () => {
      try {
        await toggleLessonComplete(lessonId, completed);
      } catch {
        setCompleted(!next); // revert on failure
      }
    });
  }

  return (
    <Button
      type="button"
      variant={completed ? "default" : "outline"}
      size="sm"
      disabled={pending}
      onClick={handleClick}
    >
      <CircleCheckBig />
      {completed ? "Completed" : "Mark as complete"}
    </Button>
  );
}
