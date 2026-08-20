import { describe, expect, it } from "vitest";
import {
  businessConfig,
  businessConfigWarnings,
  businessLinks,
  createWhatsAppUrl,
  ownershipDisclosure,
  validateBusinessConfig,
} from "./business";

describe("public business identity", () => {
  it("contains complete, non-placeholder owner and contact information", () => {
    expect(businessConfigWarnings).toEqual([]);
    expect(ownershipDisclosure).toContain("RANJINI R");
    expect(businessConfig.gstin).toBeNull();
  });

  it("keeps displayed contact details aligned with their destinations", () => {
    expect(businessLinks.supportPhone).toBe("tel:+918157039987");
    expect(businessLinks.supportEmail).toBe("mailto:oruma9987@gmail.com");
    expect(createWhatsAppUrl("Booking help")).toBe(
      "https://wa.me/918157039987?text=Booking%20help",
    );
  });

  it("warns without breaking when a required identity value is missing", () => {
    expect(
      validateBusinessConfig({
        ...businessConfig,
        operatorLegalName: "",
      }),
    ).toContain("Missing required business identity value: operatorLegalName");
  });
});
