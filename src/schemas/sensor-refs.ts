import { z } from "zod";

export const sensorRefSchema = z.object({
  name: z.string().min(1, "Nom requis"),
});

export type SensorRefInput = z.infer<typeof sensorRefSchema>;
