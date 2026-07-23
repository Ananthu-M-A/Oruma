import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import BookingModal from "./BookingModal";

describe("BookingModal accessibility", () => {
  it("has no critical accessibility violations on its first step", async () => {
    const { container } = render(<BookingModal isOpen onClose={vi.fn()} therapist={{ name: "Test Therapist", title: "Psychologist", group: 1, price: 1000 }} />);
    const result = await axe.run(container, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } });
    expect(result.violations.filter((item) => item.impact === "critical")).toEqual([]);
  });
});
