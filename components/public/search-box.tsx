import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchBox({
  className,
  defaultValue,
  action = "/search",
  placeholder = "Search lessons, vocabulary, grammar...",
}: {
  className?: string;
  defaultValue?: string;
  action?: string;
  placeholder?: string;
}) {
  return (
    <form action={action} className={className}>
      <div className="flex items-center gap-2">
        <Input name="q" defaultValue={defaultValue} placeholder={placeholder} aria-label="Search" />
        <Button type="submit" size="icon" aria-label="Search">
          <Search />
        </Button>
      </div>
    </form>
  );
}
