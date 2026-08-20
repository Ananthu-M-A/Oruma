import { describe, expect, it } from "vitest";
import {
  getRazorpayCheckoutDescription,
  getRazorpayPaymentFailureMessage,
  RAZORPAY_UPI_CHECKOUT_CONFIG,
} from "./razorpay";

describe("Razorpay UPI checkout", () => {
  it("disables the deprecated UPI Collect flow", () => {
    expect(RAZORPAY_UPI_CHECKOUT_CONFIG).toEqual({
      display: {
        hide: [{ method: "upi", flows: ["collect"] }],
      },
    });
  });

  it("explains merchant payment-method activation failures", () => {
    expect(
      getRazorpayPaymentFailureMessage({
        error: {
          code: "BAD_REQUEST_ERROR",
          reason: "payment_method_not_enabled",
        },
      }),
    ).toContain("not enabled for ORUMA");
  });

  it("uses Razorpay's description for other payment failures", () => {
    expect(
      getRazorpayPaymentFailureMessage({
        error: { description: "Payment failed at the issuing bank." },
      }),
    ).toBe("Payment failed at the issuing bank.");
  });

  it("uses only a generic booking reference in checkout descriptions", () => {
    const description = getRazorpayCheckoutDescription("BOOK-123");
    expect(description).toBe("Online counselling or wellness booking BOOK-123");
    expect(description).not.toMatch(
      /diagnosis|symptoms|therapy notes|sexual|medication/i,
    );
  });
});
