import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const clientRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(clientRoot, "..");
const configPath = path.join(repositoryRoot, "config", "business.json");
const warnings = [];
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function listSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(entryPath);
    return /\.(?:ts|tsx|html)$/.test(entry.name) ? [entryPath] : [];
  });
}

if (!fs.existsSync(configPath)) {
  warnings.push(
    "Missing config/business.json. Identity-dependent production content is unresolved.",
  );
} else {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const required = {
    brandName: config.brandName,
    website: config.website,
    operatorLegalName: config.operatorLegalName,
    businessStructure: config.businessStructure,
    address: config.address?.lines?.join(", "),
    postalCode: config.address?.postalCode,
    supportPhone: config.supportPhone?.e164,
    whatsapp: config.whatsappPhone?.digits,
    supportEmail: config.emails?.support,
    refundEmail: config.emails?.refund,
    cancellationEmail: config.emails?.cancellation,
    privacyEmail: config.emails?.privacy,
  };
  for (const [field, value] of Object.entries(required)) {
    if (!value)
      warnings.push(`Missing required business identity value: ${field}.`);
    if (
      /\[(?:required|verification required)\]|placeholder|example\.com/i.test(
        String(value ?? ""),
      )
    ) {
      warnings.push(`Placeholder business identity value: ${field}.`);
    }
  }
  if (
    config.whatsappPhone?.digits !==
    config.supportPhone?.e164?.replace(/^\+/, "")
  ) {
    errors.push("Support phone and WhatsApp destination do not match.");
  }
}

const appSource = read("client/src/App.tsx");
const footerSource = read("client/components/Footer.tsx");
const sitemap = read("client/public/sitemap.xml");
for (const route of [
  "/terms",
  "/privacy-policy",
  "/refund-policy",
  "/cancellation-policy",
  "/service-delivery-policy",
  "/contact",
  "/about",
  "/therapists",
]) {
  if (!appSource.includes(`path="${route}"`))
    errors.push(`Missing route: ${route}`);
}
for (const route of [
  "/terms",
  "/privacy-policy",
  "/refund-policy",
  "/cancellation-policy",
  "/service-delivery-policy",
]) {
  if (!footerSource.includes(`href: "${route}"`)) {
    errors.push(`Footer is missing legal link: ${route}`);
  }
  if (!sitemap.includes(`https://oruma.me${route}`)) {
    errors.push(`Sitemap is missing policy route: ${route}`);
  }
}

const publicFiles = [
  ...listSourceFiles(path.join(clientRoot, "components")),
  ...listSourceFiles(path.join(clientRoot, "routes")),
  path.join(clientRoot, "index.html"),
];
const publicSource = publicFiles
  .filter((file) => !/routes[\\/]profile-|routes[\\/]admin-/.test(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

const forbiddenPublicPatterns = [
  [
    /\[(?:required|verification required)\]/i,
    "public verification placeholder",
  ],
  [
    /ORUMA\s+Wellness\s+(?:Pvt\.?\s+Ltd|Private\s+Limited)/i,
    "unverified incorporated identity",
  ],
  [/Kerala.?s first youth-led/i, "unsupported first/youth-led claim"],
  [
    /\b(?:10K\+|20K|40\+\s*countries|500\+\s*(?:couples|individuals))\b/i,
    "unsupported numeric marketing claim",
  ],
  [/\b24\/7 support\b/i, "unsupported continuous support claim"],
  [/\balways anonymous\b|\banonymous sanctuary\b/i, "absolute anonymity claim"],
  [/end-to-end encrypted platforms/i, "unverified encryption claim"],
  [
    /\blicensed psychologists\b|\bcertified psychologists\b/i,
    "unverified regulated professional claim",
  ],
];
for (const [pattern, label] of forbiddenPublicPatterns) {
  if (pattern.test(publicSource)) errors.push(`Detected ${label}.`);
}

const paymentSource = read("server/src/payment/payment.service.ts");
const bookingSource = read("client/components/BookingModal.tsx");
if (!paymentSource.includes("buildApprovedPaymentMetadata")) {
  errors.push(
    "Razorpay order/refund metadata does not use the approved allowlist.",
  );
}
if (!bookingSource.includes("getRazorpayCheckoutDescription(appointmentId)")) {
  errors.push(
    "Razorpay checkout description is not generated from the safe helper.",
  );
}

for (const warning of warnings) console.warn(`[compliance warning] ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`[compliance error] ${error}`);
  process.exitCode = 1;
} else {
  console.log("Compliance validation passed.");
}
