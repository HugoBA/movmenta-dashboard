import { z } from "zod";

export const testSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  brandId: z.number({ error: "Marque requise" }).int().positive("Marque requise"),
});

export type TestInput = z.infer<typeof testSchema>;
