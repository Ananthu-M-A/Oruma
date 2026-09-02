import { afterEach, describe, expect, it, vi } from "vitest";
import { getTherapists } from "./therapists";

describe("therapist API helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the therapist array from the public API", async () => {
    const therapists = [{ id: "therapist-1" }];
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(therapists), { status: 200 }),
    );

    await expect(getTherapists()).resolves.toEqual(therapists);
  });

  it("rejects object responses instead of letting the grid call filter on them", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "API unavailable" }), {
        status: 200,
      }),
    );

    await expect(getTherapists()).rejects.toThrow(
      "Unable to load therapists.",
    );
  });
});