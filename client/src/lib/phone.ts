type CountryOption = {
  label: string;
  dialCode: string;
  example: string;
  minDigits: number;
  maxDigits: number;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { label: "India", dialCode: "+91", example: "9876543210", minDigits: 10, maxDigits: 10 },
  { label: "United Arab Emirates", dialCode: "+971", example: "501234567", minDigits: 8, maxDigits: 9 },
  { label: "United Kingdom", dialCode: "+44", example: "7123456789", minDigits: 10, maxDigits: 10 },
  { label: "United States", dialCode: "+1", example: "2025550143", minDigits: 10, maxDigits: 10 },
  { label: "Canada", dialCode: "+1", example: "2045550199", minDigits: 10, maxDigits: 10 },
  { label: "Singapore", dialCode: "+65", example: "91234567", minDigits: 8, maxDigits: 8 },
  { label: "Australia", dialCode: "+61", example: "412345678", minDigits: 9, maxDigits: 9 },
];

export function parsePhoneInput(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");

  if (!digits) {
    return { raw: "", dialCode: "+91" };
  }

  const countryMatch = COUNTRY_OPTIONS.find((option) => {
    const dialDigits = option.dialCode.replace("+", "");
    return digits.startsWith(dialDigits);
  });

  if (countryMatch) {
    const dialDigits = countryMatch.dialCode.replace("+", "");
    return {
      raw: digits.slice(dialDigits.length),
      dialCode: countryMatch.dialCode,
    };
  }

  return {
    raw: digits,
    dialCode: "+91",
  };
}

export function formatPhoneNumber(raw: string, dialCode: string) {
  const digits = raw.replace(/\D/g, "");
  return `${dialCode}${digits}`;
}

export function isValidPhoneNumber(raw: string, dialCode: string) {
  const digits = raw.replace(/\D/g, "");
  const country = COUNTRY_OPTIONS.find((option) => option.dialCode === dialCode);

  if (!country || !digits) {
    return false;
  }

  return digits.length >= country.minDigits && digits.length <= country.maxDigits;
}
