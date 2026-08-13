import { z } from "zod";

export const createBrandSchema = z.object({
  organizationName: z.string().min(1, "Nom de marque requis"),
  username: z.string().min(1, "Username requis"),
  password: z.string().min(8, "8 caractères minimum"),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;

export const createAdminSchema = z.object({
  username: z.string().min(1, "Username requis"),
  password: z.string().min(8, "8 caractères minimum"),
  role: z.literal("admin"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

export const updateAdminSchema = z.object({
  username: z.string().min(1, "Username requis"),
});

export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
