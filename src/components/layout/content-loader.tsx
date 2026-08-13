import { Loader2 } from "lucide-react";

export function ContentLoader() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}
