const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function getContactPhone(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;

    const digits = digitsOnly(value);
    if (digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS) {
      return value;
    }
  }

  return null;
}

export function toTelephoneHref(phone: string): string {
  const digits = digitsOnly(phone);
  const prefix = phone.trim().startsWith("+") ? "+" : "";
  return `tel:${prefix}${digits}`;
}

export function toWhatsAppNumber(phone: string | null): string | null {
  if (!phone) return null;

  let digits = digitsOnly(phone);
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = `962${digits.slice(1)}`;
  } else if (/^7\d{8}$/.test(digits)) {
    digits = `962${digits}`;
  }

  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS
    ? digits
    : null;
}
