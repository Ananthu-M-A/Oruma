# Razorpay UPI and QR use case

> “QR payments will be accepted only against identifiable counselling or wellness bookings or invoices. Each payment will be reconciled using a non-sensitive booking or invoice reference. Diagnosis, symptoms, therapy notes, and other clinical information will not be included in payment metadata.”

## Intended technical arrangement

The website currently creates a Razorpay order only after a customer selects a verified practitioner, service, appointment slot, package, and price. The preferred QR arrangement is an order-specific, fixed-amount, single-payment dynamic QR or the equivalent QR presented by Razorpay Standard Checkout. The booking UUID and Razorpay order/payment identifiers provide reconciliation. Refunds are reconciled to the original payment and the internal invoice/booking reference.

A reusable arbitrary-amount QR must not be introduced without a documented invoice-validation and reconciliation workflow.

## Owner decisions still required

Record the selected dashboard/product configuration before requesting activation:

| Decision                              | Recommended option                                           | Owner decision          |
| ------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| Static or dynamic QR                  | Dynamic, order-specific QR                                   | [VERIFICATION REQUIRED] |
| Single- or multiple-payment QR        | Single-payment                                               | [VERIFICATION REQUIRED] |
| Fixed or customer-entered amount      | Fixed amount from the booking/order                          | [VERIFICATION REQUIRED] |
| Online checkout or offline collection | Online Standard Checkout; document any separate offline flow | [VERIFICATION REQUIRED] |
| Booking-level reconciliation          | Booking UUID + Razorpay order ID + payment ID                | [VERIFICATION REQUIRED] |
| Refund reconciliation                 | Original payment ID + invoice and booking reference          | [VERIFICATION REQUIRED] |

Payment metadata is restricted to booking reference, generic service category, amount, invoice reference, and payment status. It must never contain diagnosis, symptoms, reasons for seeking support, sexual-wellness details, medication, case sheets, or session notes.

Official references checked on 19 August 2026:

- [Razorpay UPI documentation](https://razorpay.com/docs/payments/payment-methods/upi/) states that UPI Collect is deprecated effective 28 February 2026 and directs affected users to Intent or UPI QR.
- [Razorpay UPI FAQs](https://razorpay.com/docs/payments/payment-methods/upi/faqs/) explain that Standard Checkout handles Intent on supported mobile flows and dynamic QR on desktop, subject to account enablement.
- [Razorpay QR creation documentation](https://razorpay.com/docs/payments/qr-codes/create/) distinguishes single/multiple payment and fixed/customer-entered amount configurations; single-payment QR accepts a fixed amount.
- [Razorpay QR API documentation](https://razorpay.com/docs/payments/qr-codes/apis/) distinguishes dynamic single-use and static multiple-use QR behaviour.
