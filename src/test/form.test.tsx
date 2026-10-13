import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { DRAFT_KEY } from '../hooks/useProjectRequest';
import { submitProjectRequest } from '../services/projectRequestApi';
import { INITIAL_DATA } from '../types/projectRequest';

vi.mock('../services/projectRequestApi', () => ({
  submitProjectRequest: vi.fn(),
})); // stub the network layer, no real requests in tests

const mockedSubmit = vi.mocked(submitProjectRequest);

// Helper to keep the tests shorter.
const clickNext = (user: ReturnType<typeof userEvent.setup>, name = 'مرحله بعد') =>
  user.click(screen.getByRole('button', { name }));

// Walks through steps 0-2 so each test can start at the contact form.
async function goToContactStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /مطب یا کلینیک/ }));
  await clickNext(user);
  await user.click(screen.getByRole('checkbox', { name: /وب‌سایت/ }));
  await clickNext(user);
  await user.click(screen.getByRole('radio', { name: /۱۰ تا ۳۰ میلیون/ }));
  await user.click(screen.getByRole('radio', { name: /حدود یک تا سه ماه/ }));
  await clickNext(user);
}

async function fillContact(user: ReturnType<typeof userEvent.setup>, mobile: string) {
  await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'علی رضایی');
  await user.type(screen.getByLabelText(/شماره موبایل/), mobile);
}

describe('فرم درخواست پروژه', () => {
  beforeEach(() => {
    mockedSubmit.mockReset(); // don't let one test's mock leak into the next
  });

  it('بدون انتخاب نوع کسب‌وکار اجازه‌ی ادامه نمی‌دهد و خطا نشان می‌دهد', async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickNext(user);

    expect(screen.getByText(/لطفاً نوع کسب‌وکار/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'کسب‌وکار شما چه نوعی است؟' })).toBeInTheDocument();
  });

  it('رفت‌وبرگشت بین مرحله‌ها انتخاب‌ها را حفظ می‌کند', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: /کارخانه/ }));
    await clickNext(user);
    expect(screen.getByRole('heading', { name: 'چه چیزی نیاز دارید؟' })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /اپلیکیشن/ }));
    await user.click(screen.getByRole('button', { name: 'بازگشت' }));

    expect(screen.getByRole('radio', { name: /کارخانه/ })).toBeChecked();

    await clickNext(user);
    expect(screen.getByRole('checkbox', { name: /اپلیکیشن/ })).toBeChecked();
  });

  it('گزینه‌ی «نمی‌دانم» با بقیه‌ی نیازها هم‌زمان انتخاب نمی‌شود', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('radio', { name: /مطب/ }));
    await clickNext(user);

    await user.click(screen.getByRole('checkbox', { name: /وب‌سایت/ }));
    await user.click(screen.getByRole('checkbox', { name: /فروشگاه اینترنتی/ }));
    await user.click(screen.getByRole('checkbox', { name: /نمی‌دانم/ }));

    expect(screen.getByRole('checkbox', { name: /نمی‌دانم/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /وب‌سایت/ })).not.toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: /وب‌سایت/ }));
    expect(screen.getByRole('checkbox', { name: /نمی‌دانم/ })).not.toBeChecked();
  });

  it('پیش‌نویس در localStorage ذخیره می‌شود', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: /فروشگاه/ }));
    await clickNext(user);

    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY)!);
    expect(saved.data.businessType).toBe('shop');
    expect(saved.step).toBe(1);
  });

  it('پیش‌نویس بعد از رفرش (mount مجدد) بازیابی می‌شود', () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step: 1,
        data: { ...INITIAL_DATA, businessType: 'factory', needs: ['website'] },
      }),
    );

    render(<App />);

    expect(screen.getByRole('heading', { name: 'چه چیزی نیاز دارید؟' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /وب‌سایت/ })).toBeChecked();
  });

  it('پیش‌نویس خراب نادیده گرفته می‌شود و فرم از اول شروع می‌شود', () => {
    // Bad JSON should never crash the form.
    localStorage.setItem(DRAFT_KEY, '{خراب');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'کسب‌وکار شما چه نوعی است؟' })).toBeInTheDocument();
  });

  it('ارقام فارسی موبایل هنگام تایپ به انگلیسی تبدیل می‌شوند و خطا زیر فیلد می‌آید', async () => {
    const user = userEvent.setup();
    render(<App />);
    await goToContactStep(user);

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'علی رضایی');
    const mobile = screen.getByLabelText(/شماره موبایل/);
    await user.type(mobile, '۰۹۱۲');
    expect(mobile).toHaveValue('0912');

    await clickNext(user, 'مرور و ارسال');
    expect(mobile).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/۱۱ رقم/)).toBeInTheDocument();
  });

  it('مسیر کامل: خلاصه، ارسال موفق و پاک شدن پیش‌نویس', async () => {
    mockedSubmit.mockResolvedValue({ referenceCode: 'REQ-TEST01' });
    const user = userEvent.setup();
    render(<App />);

    await goToContactStep(user);
    await fillContact(user, '۰۹۱۲۳۴۵۶۷۸۹');
    await clickNext(user, 'مرور و ارسال');

    expect(screen.getByRole('heading', { name: 'بازبینی و ارسال' })).toBeInTheDocument();
    expect(screen.getByText('۰۹۱۲۳۴۵۶۷۸۹')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ارسال درخواست' }));

    expect(await screen.findByText('REQ-TEST01')).toBeInTheDocument();
    expect(mockedSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ mobile: '09123456789', businessType: 'clinic' }),
    );
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('در صورت خطای ارسال پیام خطا می‌آید و اطلاعات حفظ می‌شود', async () => {
    mockedSubmit.mockRejectedValue(new Error('network'));
    const user = userEvent.setup();
    render(<App />);

    await goToContactStep(user);
    await fillContact(user, '09123456789');
    await clickNext(user, 'مرور و ارسال');
    await user.click(screen.getByRole('button', { name: 'ارسال درخواست' }));

    expect(await screen.findByText(/ارسال انجام نشد/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تلاش دوباره' })).toBeEnabled();
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
  });
});