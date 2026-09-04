import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";

// Sits in the same spot the real ReadingPassagesPanel occupies on the
// edit page, so a brand-new lesson shows *where* passages/questions
// will go instead of that area only appearing after a save. Passages
// and questions are foreign-keyed to the lesson, so neither can exist
// until the lesson row does.
export function ReadingPassagesPlaceholder() {
  return (
    <Card className="xl:sticky xl:top-6">
      <CardHeader>
        <CardTitle>Reading passages &amp; questions</CardTitle>
        <CardDescription>For IELTS-style reading tests.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <BookOpenText className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          Save this lesson first (Save Draft or Publish) — you&apos;ll come right back here to add
          passages and, for each one, its own questions.
        </p>
      </CardContent>
    </Card>
  );
}
