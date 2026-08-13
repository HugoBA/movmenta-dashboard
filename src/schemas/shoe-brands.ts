import { z } from "zod";

export const shoeBrandSchema = z.object({
  brandName: z.string().min(1, "Nom requis"),
});

export type ShoeBrandInput = z.infer<typeof shoeBrandSchema>;
