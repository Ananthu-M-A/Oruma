# Razorpay identity mapping

Use this mapping when completing Razorpay KYC and responding to an underwriting review. Do not upload or commit PAN, Aadhaar, bank-account numbers, or unredacted KYC documents to this repository.

| Item                      | Required value                                              |
| ------------------------- | ----------------------------------------------------------- |
| Razorpay business type    | Unregistered individual business                            |
| Legal name                | Owner’s exact name as shown on PAN                          |
| Brand/trade name          | Oruma                                                       |
| PAN                       | Owner’s personal PAN                                        |
| Settlement account holder | Owner’s legal name                                          |
| Website operator          | Owner’s legal name                                          |
| Website brand             | Oruma                                                       |
| Business category         | Accurate online counselling/mental-health/wellness category |
| Address                   | Address consistent with submitted KYC evidence              |

> Warning: the owner’s name must match exactly across PAN, Razorpay KYC, the settlement bank account, website disclosures, invoices, and supporting documents. The configured website operator is `RANJINI R`; the owner must confirm this is the exact full PAN and bank-account-holder name before submission.

No source file should contain the PAN number, Aadhaar number, bank-account number, or other sensitive KYC identifier.
