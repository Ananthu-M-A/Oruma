import { buildApprovedPaymentMetadata } from './payment-metadata';

describe('buildApprovedPaymentMetadata', () => {
  it('allows only explicit non-sensitive booking fields', () => {
    expect(
      buildApprovedPaymentMetadata({
        bookingReference: 'BOOK-123',
        serviceCategory: 'counselling',
        amount: 1200,
        invoiceReference: 'ORU-202608-123',
        paymentStatus: 'pending',
      }),
    ).toEqual({
      bookingReference: 'BOOK-123',
      serviceCategory: 'counselling',
      amount: '1200',
      invoiceReference: 'ORU-202608-123',
      paymentStatus: 'pending',
    });
  });

  it.each(['Diagnosis: anxiety', 'Sexual wellness details', 'Therapy notes'])(
    'rejects sensitive values: %s',
    (bookingReference) => {
      expect(() => buildApprovedPaymentMetadata({ bookingReference })).toThrow(
        'Sensitive payment metadata',
      );
    },
  );

  it('drops fields outside the explicit allowlist', () => {
    expect(
      buildApprovedPaymentMetadata({
        bookingReference: 'BOOK-123',
        diagnosis: 'not allowed',
      } as unknown as Parameters<typeof buildApprovedPaymentMetadata>[0]),
    ).toEqual({ bookingReference: 'BOOK-123' });
  });
});
