import { describe, expect, it } from "vitest";
import { timeAgo } from "@/lib/time";

const NOW = new Date("2026-09-22T12:00:00Z").getTime();

describe("timeAgo", () => {
  it("covers seconds through days", () => {
    expect(timeAgo(NOW - 10_000, NOW)).toBe("just now");
    expect(timeAgo(NOW - 5 * 60_000, NOW)).toBe("5m ago");
    expect(timeAgo(NOW - 3 * 3_600_000, NOW)).toBe("3h ago");
    expect(timeAgo(NOW - 2 * 86_400_000, NOW)).toBe("2d ago");
  });

  it("falls back to a date for older timestamps", () => {
    expect(timeAgo(NOW - 30 * 86_400_000, NOW)).toBe(
      new Date(NOW - 30 * 86_400_000).toLocaleDateString(),
    );
  });
});
