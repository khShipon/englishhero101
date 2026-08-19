import type { VocabularyEntry } from "@/lib/queries/vocabulary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function VocabularyCard({ entry }: { entry: VocabularyEntry }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          {entry.word}
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
        </CardContent>
      )}
    </Card>
  );
}
