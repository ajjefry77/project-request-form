import { describe, expect, it } from 'vitest';
import { toEnglishDigits, toPersianDigits } from '../utils/persianDigits';
import {
  findFirstInvalidStep,
  normalizeMobile,
  validateMobile,
  validateStep,
} from '../utils/validation';
import { INITIAL_DATA } from '../types/projectRequest';

describe('تبدیل ارقام', () => {
  it('ارقام فارسی و عربی را به انگلیسی تبدیل می‌کند', () => {
    expect(toEnglishDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    expect(toEnglishDigits('٠٩١٢٣٤٥٦٧٨٩')).toBe('09123456789');
    expect(toEnglishDigits('09ab۱')).toBe('09ab1');
  });

  it('ارقام انگلیسی را برای نمایش فارسی می‌کند', () => {
    expect(toPersianDigits('09123')).toBe('۰۹۱۲۳');
  });
});

describe('اعتبارسنجی موبایل', () => {
  it('شماره‌ی معتبر با ارقام انگلیسی و فارسی را می‌پذیرد', () => {
    expect(validateMobile('09123456789')).toBeNull();
    expect(validateMobile('۰۹۱۲۳۴۵۶۷۸۹')).toBeNull();
  });

  it('قالب‌های +98 ، 0098 و بدون صفر را نرمال و قبول می‌کند', () => {
    expect(normalizeMobile('+989123456789')).toBe('09123456789');
    expect(normalizeMobile('00989123456789')).toBe('09123456789');
    expect(normalizeMobile('9123456789')).toBe('09123456789');
    expect(normalizeMobile('0912 345 6789')).toBe('09123456789');
    expect(validateMobile('+98 912 345 6789')).toBeNull();
  });

  it('شماره‌ی خالی، کوتاه، بلند و غیرموبایل را رد می‌کند', () => {
    expect(validateMobile('')).toMatch(/وارد کنید/);
    expect(validateMobile('0912345')).toMatch(/۱۱ رقم/);
    expect(validateMobile('091234567890')).toMatch(/۱۱ رقم/);
    expect(validateMobile('02112345678')).toMatch(/۰۹ شروع/);
    expect(validateMobile('0912abc6789')).toMatch(/رقم/);
  });
});

describe('اعتبارسنجی مرحله‌ها', () => {
  it('هر مرحله‌ی خالی خطای مخصوص خودش را می‌دهد', () => {
    expect(validateStep(0, INITIAL_DATA).businessType).toBeDefined();
    expect(validateStep(1, INITIAL_DATA).needs).toBeDefined();
    expect(Object.keys(validateStep(2, INITIAL_DATA))).toEqual(['budget', 'timeline']);
    expect(Object.keys(validateStep(3, INITIAL_DATA))).toEqual(['fullName', 'mobile']);
  });

  it('اولین مرحله‌ی نامعتبر را پیدا می‌کند', () => {
    expect(findFirstInvalidStep(INITIAL_DATA)).toBe(0);
    expect(
      findFirstInvalidStep({
        businessType: 'clinic',
        needs: ['website'],
        budget: '10to30',
        timeline: 'flexible',
        fullName: 'علی رضایی',
        mobile: '09123456789',
      }),
    ).toBeNull();
  });
});