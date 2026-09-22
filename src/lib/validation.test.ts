// Unit tests for the item-name zod schema.
import { describe, expect, it } from "vitest";
import { itemNameSchema } from "@/lib/validation";

describe("itemNameSchema", () => {
  it("rejects empty and slash names", () => {
    expect(itemNameSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(itemNameSchema.safeParse({ name: "a/b" }).success).toBe(false);
    expect(itemNameSchema.safeParse({ name: "notes.txt" }).success).toBe(true);
  });
});
