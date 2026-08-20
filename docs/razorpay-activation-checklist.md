# Razorpay activation checklist

> Fixing the website does not guarantee approval. Razorpay and its banking partners may still require additional KYC, business-model, practitioner, licensing, or underwriting documents, and they make the final activation, MID, UPI terminal, and QR-product decisions.

Do not submit from this checklist until every required value has been checked against the current Razorpay dashboard and source document.

| Review item                               | Required/current position                                                                  | Status                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------- |
| Owner’s exact PAN name                    | Must exactly match PAN; configured disclosure is `RANJINI R`                               | Owner confirmation required             |
| Razorpay business type                    | Unregistered individual business                                                           | Dashboard confirmation required         |
| Brand name                                | Oruma                                                                                      | Confirm                                 |
| Settlement bank-account holder            | Owner’s exact legal name                                                                   | [VERIFICATION REQUIRED]                 |
| Website ownership disclosure              | Oruma is operated by RANJINI R as an individual business                                   | Implemented                             |
| Full address                              | Must match KYC evidence and configured 690504 address                                      | Evidence match required                 |
| Official contact details                  | +91-8157039987 / oruma9987@gmail.com                                                       | Implemented; verify access              |
| Accurate business category                | Online counselling / mental-health / wellness, matching actual scope                       | Dashboard selection required            |
| GST applicability                         | No GSTIN supplied; do not claim GST registration                                           | Owner/tax-adviser confirmation required |
| Udyam registration, if any                | None supplied; do not claim it                                                             | Owner confirmation required             |
| Practitioner qualifications               | Per-practitioner evidence                                                                  | [VERIFICATION REQUIRED]                 |
| Professional registrations, if applicable | Verify with issuing authority                                                              | [VERIFICATION REQUIRED]                 |
| Practitioner agreements                   | Signed and current                                                                         | [VERIFICATION REQUIRED]                 |
| Sample invoice                            | Generate from a test-mode paid booking after migration/config validation                   | Required                                |
| Sample booking confirmation               | Generate through test mode; verify reference, amount, slot, duration, support and policies | Required                                |
| Service-delivery workflow                 | Published `/service-delivery-policy` and booking UI                                        | Implemented; operational test required  |
| Refund workflow                           | Policy, dashboard handling, original-payment reconciliation                                | Implemented; operational test required  |
| UPI/QR use case                           | See `docs/razorpay-qr-use-case.md`                                                         | Owner decisions required                |
| Requested QR configuration                | Prefer dynamic, fixed-amount, order-specific, single-payment                               | Dashboard/product confirmation required |
| Public claims evidence                    | See `docs/public-claims-evidence.md`                                                       | Unsupported claims removed/softened     |
| Razorpay rejection message                | Not present in the repository                                                              | [VERIFICATION REQUIRED]                 |
| Razorpay rejection reason code            | Not present in the repository                                                              | [VERIFICATION REQUIRED]                 |
| Rejection scope                           | Account activation, MID, UPI terminal, or QR product                                       | [VERIFICATION REQUIRED]                 |

## Dashboard completion sequence

1. Select the business type that Razorpay describes for an unregistered individual business; do not select private limited/company merely to pass validation.
2. Enter the legal name exactly as printed on the owner’s PAN. Confirm the same name is the settlement account holder.
3. Use `Oruma` only as the brand/trade name and use `https://oruma.me` as the website.
4. Enter the operating address exactly as supported by the submitted KYC address evidence.
5. Select the most accurate available online counselling/mental-health/wellness category. Do not select hospital or clinic unless the business model and documentation genuinely support it.
6. Confirm the official phone and email are accessible and complete any ownership/contact verification Razorpay requests.
7. Answer GST and Udyam questions truthfully. Do not enter a number unless it exists and has been verified.
8. Supply only the practitioner qualifications, registrations, and agreements that have passed the private verification checklist.
9. Provide a sample invoice, paid-booking confirmation, service-delivery workflow, refund workflow, and the documented QR use case if requested.
10. Request the order-specific dynamic/fixed-amount UPI/QR capability needed for the documented checkout flow. Avoid an unexplained arbitrary-amount QR.
11. Save the exact rejection message, reason code, product/MID scope, and requested documents in the private activation record before responding.
12. Keep live payment settings unchanged until Razorpay approves the relevant capability and an authorized owner schedules a production change.

The exact prior rejection cannot be determined from this repository because the rejection message and reason code were not supplied. Identity inconsistency, unsupported claims, unclear ownership, missing practitioner evidence, and an unclear QR reconciliation use case were website-level underwriting risks; they are not asserted as Razorpay’s actual rejection reason.
