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
    mockedSubmit.mockRejectedValueOnce(new Error('network'));
    const user = userEvent.setup();
    render(<App />);

    await goToContactStep(user);
    await fillContact(user, '09123456789');
    await clickNext(user, 'مرور و ارسال');
    await user.click(screen.getByRole('button', { name: 'ارسال درخواست' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/ارسال انجام نشد/);
    expect(screen.getByRole('button', { name: 'تلاش دوباره' })).toBeEnabled();
    // خلاصه همچنان دیده می‌شود، یعنی اطلاعات از بین نرفته است.
    expect(screen.getByRole('heading', { name: 'بازبینی و ارسال' })).toBeInTheDocument();
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    // تلاش دوباره با موفقیت، به صفحه‌ی موفقیت می‌رسد.
    mockedSubmit.mockResolvedValueOnce({ referenceCode: 'REQ-RETRY01' });
    await user.click(screen.getByRole('button', { name: 'تلاش دوباره' }));

    expect(await screen.findByText('REQ-RETRY01')).toBeInTheDocument();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('فیلدهای خطادار aria-invalid و aria-describedby دارند تا صفحه‌خوان خطا را بخواند', async () => {
    const user = userEvent.setup();
    render(<App />);

    // قدم صفر: گروه رادیویی بدون انتخاب
    await clickNext(user);
    const businessError = screen.getByText(/لطفاً نوع کسب‌وکار/);
    expect(businessError).toHaveAttribute('role', 'alert');
    expect(businessError).toHaveAttribute('id', 'businessType-error');
    const businessRadios = screen.getAllByRole('radio');
    expect(businessRadios.length).toBeGreaterThan(0);
    for (const radio of businessRadios) {
      expect(radio).toHaveAttribute('aria-invalid', 'true');
      expect(radio).toHaveAttribute('aria-describedby', 'businessType-error');
    }

    // ادامه تا قدم تماس، بعد ارسال خالی برای خطای متنی
    await user.click(screen.getByRole('radio', { name: /مطب یا کلینیک/ }));
    await clickNext(user);
    await user.click(screen.getByRole('checkbox', { name: /وب‌سایت/ }));
    await clickNext(user);
    await user.click(screen.getByRole('radio', { name: /۱۰ تا ۳۰ میلیون/ }));
    await user.click(screen.getByRole('radio', { name: /حدود یک تا سه ماه/ }));
    await clickNext(user);

    await clickNext(user, 'مرور و ارسال');

    const nameInput = screen.getByLabelText(/نام و نام خانوادگی/);
    const nameError = screen.getByText(/نام و نام خانوادگی را وارد کنید/);
    expect(nameError).toHaveAttribute('role', 'alert');
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput.getAttribute('aria-describedby')).toContain('fullName-error');

    const mobileInput = screen.getByLabelText(/شماره موبایل/);
    const mobileError = screen.getByText(/شماره موبایل را وارد کنید/);
    expect(mobileError).toHaveAttribute('role', 'alert');
    expect(mobileInput).toHaveAttribute('aria-invalid', 'true');
    expect(mobileInput.getAttribute('aria-describedby')).toContain('mobile-error');
  });
});