// Shared zod schema for item names (shape only; uniqueness lives in filesystem).
import { z } from "zod";

/**
 * Shape-level validation for item names.
 * Uniqueness within the parent folder is checked separately via
 * `validateName()` in `@/lib/filesystem`, which needs live state.
 */
export const itemNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty.")
    .refine((v) => !v.includes("/") && !v.includes("\\"), {
      message: 'Name cannot contain "/" or "\\".',
    }),
});

export type ItemNameInput = z.infer<typeof itemNameSchema>;
