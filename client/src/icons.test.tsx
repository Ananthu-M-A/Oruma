import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LucideIcon } from "./icons";

describe("LucideIcon", () => {
  it("renders a bundled SVG icon", () => {
    render(<span data-testid="icon"><LucideIcon name="calendar" /></span>);
    expect(screen.getByTestId("icon").querySelector("svg")).toBeInTheDocument();
  });

  it("uses a safe fallback for an unknown name", () => {
    render(<span data-testid="icon"><LucideIcon name="not-an-icon" /></span>);
    expect(screen.getByTestId("icon").querySelector("svg")).toBeInTheDocument();
  });
});
