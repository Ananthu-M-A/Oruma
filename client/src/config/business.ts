import rawBusinessConfig from "../../../config/business.json";

export type BusinessConfig = typeof rawBusinessConfig;

const placeholderPattern =
  /\[(?:required|verification required)\]|\b(?:todo|tbd|placeholder|example)\b/i;

export function validateBusinessConfig(config: BusinessConfig) {
  const warnings: string[] = [];
  const requiredIdentityValues = {
    brandName: config.brandName,
    website: config.website,
    operatorLegalName: config.operatorLegalName,
    businessStructure: config.businessStructure,
    serviceDescription: config.serviceDescription,
    supportPhone: config.supportPhone.display,
    supportPhoneLink: config.supportPhone.e164,
    whatsappPhone: config.whatsappPhone.digits,
    supportEmail: config.emails.support,
    refundEmail: config.emails.refund,
    cancellationEmail: config.emails.cancellation,
    privacyEmail: config.emails.privacy,
    address: config.address.lines.join(", "),
  };

  for (const [field, value] of Object.entries(requiredIdentityValues)) {
    if (!value.trim())
      warnings.push(`Missing required business identity value: ${field}`);
    else if (placeholderPattern.test(value)) {
      warnings.push(`Placeholder business identity value detected: ${field}`);
    }
  }

  if (!/^\+91\d{10}$/.test(config.supportPhone.e164)) {
    warnings.push("Support phone must be an Indian E.164 number.");
  }
  if (
    config.whatsappPhone.digits !== config.supportPhone.e164.replace(/^\+/, "")
  ) {
    warnings.push(
      "The displayed support phone and WhatsApp destination do not match.",
    );
  }
  if (!config.address.postalCode.match(/^\d{6}$/)) {
    warnings.push("The operating address requires a six-digit PIN code.");
  }

  return warnings;
}

export const businessConfig = Object.freeze(rawBusinessConfig);
export const businessConfigWarnings = validateBusinessConfig(businessConfig);
export const businessAddress = businessConfig.address.lines.join(", ");
export const ownershipDisclosure = `${businessConfig.brandName} is a brand operated by ${businessConfig.operatorLegalName}, an individual business providing online counselling and wellness services.`;

export const businessLinks = Object.freeze({
  website: businessConfig.website,
  supportEmail: `mailto:${businessConfig.emails.support}`,
  refundEmail: `mailto:${businessConfig.emails.refund}`,
  cancellationEmail: `mailto:${businessConfig.emails.cancellation}`,
  privacyEmail: `mailto:${businessConfig.emails.privacy}`,
  supportPhone: `tel:${businessConfig.supportPhone.e164}`,
});

export function createWhatsAppUrl(message: string) {
  return `https://wa.me/${businessConfig.whatsappPhone.digits}?text=${encodeURIComponent(message)}`;
}

if (businessConfigWarnings.length > 0) {
  console.warn(`[business-config] ${businessConfigWarnings.join(" ")}`);
}
