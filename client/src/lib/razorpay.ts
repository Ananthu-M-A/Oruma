export const RAZORPAY_UPI_CHECKOUT_CONFIG: RazorpayCheckoutConfig = {
  display: {
    hide: [
      {
        method: "upi",
        flows: ["collect"],
      },
    ],
  },
};

export const RAZORPAY_CHECKOUT_TIMEOUT_SECONDS = 10 * 60;
export const RAZORPAY_STATUS_POLL_INTERVAL_MS = 2_000;
export const RAZORPAY_STATUS_POLL_WINDOW_MS = 15 * 60_000;

export function getRazorpayCheckoutDescription(bookingReference: string) {
  const safeReference = bookingReference
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 24);
  return `Online counselling or wellness booking ${safeReference}`.trim();
}

export function getRazorpayPaymentFailureMessage(
  response: RazorpayPaymentFailureResponse,
) {
  const reason = response.error.reason?.trim();

  if (reason === "payment_method_not_enabled") {
    return "This payment method is not enabled for ORUMA yet. Please choose another payment method or contact support.";
  }

  if (reason === "payment_timed_out") {
    return "The payment timed out. Please retry and complete it in your UPI app.";
  }

  if (reason === "payment_cancelled") {
    return "The payment was cancelled. Please retry when you are ready.";
  }

  return (
    response.error.description?.trim() ||
    "The payment was declined. Please retry or choose another payment method."
  );
}
