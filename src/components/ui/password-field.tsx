import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const PasswordField = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & { onGenerate: () => void }
>(function PasswordField({ onGenerate, ...inputProps }, ref) {
  return (
    <div className="flex gap-2">
      <Input ref={ref} {...inputProps} />
      <Button type="button" variant="outline" onClick={onGenerate}>
        Générer
      </Button>
    </div>
  );
});
