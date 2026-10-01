/// <reference types="vite/client" />

type RazorpayPaymentFailureResponse = {
  error: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

type RazorpayCheckoutConfig = {
  display: {
    hide: Array<{
      method: "upi";
      flows: Array<"collect">;
    }>;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  timeout?: number;
  retry?: {
    enabled: boolean;
  };
  modal?: {
    ondismiss?: () => void;
  };
  config?: RazorpayCheckoutConfig;
};

interface Window {
  Razorpay?: new (options: RazorpayCheckoutOptions) => {
    open: () => void;
    on: (
      event: "payment.failed",
      handler: (response: RazorpayPaymentFailureResponse) => void,
    ) => void;
  };
}
