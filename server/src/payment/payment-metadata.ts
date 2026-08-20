export type ApprovedPaymentMetadata = {
  bookingReference?: string;
  serviceCategory?: 'counselling' | 'wellness';
  amount?: number;
  invoiceReference?: string;
  paymentStatus?: string;
};

const SENSITIVE_VALUE_PATTERN =
  /diagnos|symptom|therapy notes?|case[- ]?sheet|medication|sexual|presenting concern|clinical notes?|intervention|mental[- ]?health concern|reason for seeking/i;

export function buildApprovedPaymentMetadata(
  metadata: ApprovedPaymentMetadata,
): Record<string, string> {
  const output: Record<string, string> = {};

  const approvedKeys: Array<keyof ApprovedPaymentMetadata> = [
    'bookingReference',
    'serviceCategory',
    'amount',
    'invoiceReference',
    'paymentStatus',
  ];

  for (const key of approvedKeys) {
    const value = metadata[key];
    if (value === undefined || value === null || value === '') continue;
    const serialized = String(value);
    if (SENSITIVE_VALUE_PATTERN.test(serialized)) {
      throw new Error(`Sensitive payment metadata is not permitted: ${key}`);
    }
    output[key] = serialized;
  }

  return output;
}
