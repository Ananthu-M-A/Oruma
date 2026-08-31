import { describe, expect, it } from "vitest";
import {
  combineTherapistTags,
  splitTherapistTags,
} from "./therapistProfileOptions";

describe("therapist profile dropdown helpers", () => {
  it("separates known languages from areas of practice", () => {
    expect(
      splitTherapistTags(["Anxiety", "english", "Malayalam", "Trauma"]),
    ).toEqual({
      areasOfPractice: ["Anxiety", "Trauma"],
      languages: ["English", "Malayalam"],
    });
  });

  it("combines dropdown selections without duplicate tags", () => {
    expect(
      combineTherapistTags(
        ["Anxiety", "Relationship Issues", "Anxiety"],
        ["English", "Malayalam"],
      ),
    ).toEqual([
      "Anxiety",
      "Relationship Issues",
      "English",
      "Malayalam",
    ]);
  });
});
