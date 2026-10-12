const PERSIAN_ZERO = 0x06f0; // ۰
const ARABIC_ZERO = 0x0660; // ٠
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** ارقام فارسی (۰-۹) و عربی (٠-٩) را به انگلیسی تبدیل می‌کند. */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - PERSIAN_ZERO))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - ARABIC_ZERO));
}

/** ارقام انگلیسی را برای نمایش به فارسی تبدیل می‌کند. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}