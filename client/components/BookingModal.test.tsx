import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import BookingModal from "./BookingModal";

describe("BookingModal accessibility", () => {
  it("has no critical accessibility violations on its first step", async () => {
    const { container } = render(
      <BookingModal
        isOpen
        onClose={vi.fn()}
        therapist={{
          name: "Test Therapist",
          title: "Psychologist",
          price: 1000,
        }}
      />,
    );
    const result = await axe.run(container, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } });
    expect(result.violations.filter((item) => item.impact === "critical")).toEqual([]);
  });

  it("offers couple therapy whenever a couple fee is configured", () => {
    render(
      <BookingModal
        isOpen
        onClose={vi.fn()}
        therapist={{
          name: "Test Therapist",
          title: "Psychologist",
          price: 1000,
          couplePrice: 1600,
        }}
      />,
    );

    expect(
      screen.getByRole("option", { name: "Couple Therapy" }),
    ).toBeInTheDocument();
  });
});
