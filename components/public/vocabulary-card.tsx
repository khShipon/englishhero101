import type { VocabularyEntry } from "@/lib/queries/vocabulary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PronounceButton } from "@/components/lessons/pronounce-button";
import { Languages } from "lucide-react";

export function VocabularyCard({ entry }: { entry: VocabularyEntry }) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <Languages className="size-4 shrink-0 self-center text-primary" />
          {entry.word}
          <PronounceButton text={entry.word} label="Listen" />
          {entry.pronunciation && (
            <span className="text-sm font-normal text-muted-foreground">
              {entry.pronunciation}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      {(entry.englishDefinition || entry.banglaMeaning) && (
        <CardContent className="flex flex-col gap-1 text-sm">
          {entry.englishDefinition && (
            <p className="text-muted-foreground">{entry.englishDefinition}</p>
          )}
          {entry.banglaMeaning && <p>{entry.banglaMeaning}</p>}
          {entry.exampleSentence && (
            <p className="italic text-muted-foreground">&ldquo;{entry.exampleSentence}&rdquo;</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
