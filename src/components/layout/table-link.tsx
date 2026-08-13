import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function TableLink({
  href,
  tooltip,
  newTab = false,
  children,
}: {
  href: string;
  tooltip?: string;
  newTab?: boolean;
  children: React.ReactNode;
}) {
  const link = (
    <Link
      href={href}
      className="text-primary hover:underline"
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );

  if (!tooltip) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
}
