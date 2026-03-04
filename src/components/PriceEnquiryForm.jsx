'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

// ─── Regex & Constants ─────────────────────────────────────────────────────────

const GST_REGEX   = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
  'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Chandigarh','Puducherry','Jammu & Kashmir','Ladakh',
  'Andaman & Nicobar Islands','Lakshadweep','Dadra & Nagar Haveli','Daman & Diu',
];

const INITIAL_FORM = {
  name: '', company: '', gstNumber: '', industry: '',
  designation: '', department: '', phone: '', email: '',
  country: 'India', state: '', city: '', message: '',
};

// ─── Tracking ─────────────────────────────────────────────────────────────────

function detectDevice(ua = '') {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function parseReferrer(ref = '') {
  if (!ref) return { source: 'Direct / None', keyword: '' };
  try {
    const url  = new URL(ref);
    const host = url.hostname.toLowerCase();
    const engines = [
      { p: /google\./,     n: 'Google',     q: 'q'    },
      { p: /bing\./,       n: 'Bing',       q: 'q'    },
      { p: /yahoo\./,      n: 'Yahoo',      q: 'p'    },
      { p: /duckduckgo\./, n: 'DuckDuckGo', q: 'q'    },
      { p: /yandex\./,     n: 'Yandex',     q: 'text' },
    ];
    for (const e of engines) {
      if (e.p.test(host)) return { source: e.n, keyword: url.searchParams.get(e.q) || '(not provided)' };
    }
    const social = [
      [/facebook\.|fb\.com/, 'Facebook'], [/instagram\./, 'Instagram'],
      [/linkedin\./, 'LinkedIn'],         [/twitter\.|x\.com/, 'Twitter / X'],
      [/youtube\./, 'YouTube'],           [/whatsapp\./, 'WhatsApp'],
    ];
    for (const [p, n] of social) if (p.test(host)) return { source: n, keyword: '' };
    return { source: `Referral: ${url.hostname}`, keyword: '' };
  } catch { return { source: 'Unknown', keyword: '' }; }
}

function collectTracking() {
  if (typeof window === 'undefined') return {};
  const ua  = navigator.userAgent || '';
  const ref = document.referrer   || '';
  const p   = new URLSearchParams(window.location.search);
  const { source, keyword } = parseReferrer(ref);
  return {
    _pageUrl:       window.location.href,
    _referrerUrl:   ref || 'Direct / None',
    _trafficSource: p.get('utm_source')   || source,
    _searchKeyword: p.get('utm_term') || p.get('utm_keyword') || keyword,
    _utmMedium:     p.get('utm_medium')   || '',
    _utmCampaign:   p.get('utm_campaign') || '',
    _deviceType:    detectDevice(ua),
    _userAgent:     ua,
  };
}

// ─── Sanitizers ───────────────────────────────────────────────────────────────

const SANITIZERS = {
  name:        (v) => v.replace(/[^a-zA-Z\s]/g, '').replace(/\b\w/g, c => c.toUpperCase()),
  company:     (v) => v.replace(/[^a-zA-Z0-9\s&.,()-]/g, ''),
  gstNumber:   (v) => v.toUpperCase().slice(0, 15),
  phone:       (v) => v.replace(/\D/g, '').slice(0, 10),
  email:       (v) => v.replace(/\s/g, ''),
  city:        (v) => v.replace(/[^a-zA-Z\s]/g, ''),
  industry:    (v) => v.replace(/[^a-zA-Z\s&/]/g, ''),
  designation: (v) => v.replace(/[^a-zA-Z\s.]/g, ''),
  department:  (v) => v.replace(/[^a-zA-Z\s&/]/g, ''),
};

function sanitizeField(name, value) {
  if (/https?:\/\/|www\./i.test(value)) return null;
  return SANITIZERS[name] ? SANITIZERS[name](value) : value;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateAll(f) {
  const errs = {};
  if (!f.name.trim())                         errs.name        = 'Full name is required';
  if (!f.company.trim())                      errs.company     = 'Company name is required';
  if (f.gstNumber && !GST_REGEX.test(f.gstNumber))
                                              errs.gstNumber   = 'Enter a valid 15-digit GSTIN';
  if (!f.industry.trim())                     errs.industry    = 'Industry is required';
  if (!f.designation.trim())                  errs.designation = 'Designation is required';
  if (!f.department.trim())                   errs.department  = 'Department is required';
  if (!PHONE_REGEX.test(f.phone))             errs.phone       = 'Enter a valid 10-digit number';
  if (!EMAIL_REGEX.test(f.email))             errs.email       = 'Enter a valid email address';
  if (!f.state)                               errs.state       = 'Please select your state';
  if (!f.city.trim())                         errs.city        = 'City is required';
  return errs;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const INPUT_BASE = [
  'w-full h-13 px-4 py-3',
  'text-[15px] text-[#0f172a] font-medium',
  'border-2 border-[#94a3b8]',
  'rounded-xl bg-white outline-none',
  'transition-all duration-150',
  'placeholder:text-[#94a3b8] placeholder:font-normal',
  'focus:border-[#2F4191] focus:ring-4 focus:ring-[#2F4191]/15',
  'hover:border-[#64748b]',
].join(' ');

const INPUT_ERROR    = 'border-2 border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500';
const INPUT_READONLY = 'border-2 border-[#cbd5e1] bg-slate-50 text-[#64748b] cursor-not-allowed';

// ─── Field Components ─────────────────────────────────────────────────────────

function Label({ children, required, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-bold text-[#1e293b] mb-2 tracking-wide">
      {children}
      {required && <span className="text-red-500 ml-1 text-base leading-none">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600 mt-1.5">
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
      {msg}
    </p>
  );
}

function TextInput({ label, name, value, onChange, errors, type = 'text', placeholder, required, readOnly, id }) {
  const err     = errors?.[name];
  const inputId = id || name;
  return (
    <div>
      <Label required={required} htmlFor={inputId}>{label}</Label>
      <input
        id={inputId} name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder}
        required={required} readOnly={readOnly}
        className={readOnly ? INPUT_READONLY + ' w-full h-13 px-4 py-3 text-[15px] font-medium rounded-xl border-2 outline-none' : err ? `${INPUT_BASE} ${INPUT_ERROR}` : INPUT_BASE}
      />
      <ErrorMsg msg={err} />
    </div>
  );
}

// ─── Email Input with personal / official toggle ──────────────────────────────
function EmailInput({ value, onChange, errors }) {
  const [type, setType] = useState('personal'); // 'personal' | 'official'
  const err = errors?.email;

  const placeholder = type === 'personal' ? 'yourname@gmail.com' : 'name@company.com';
  const hint        = type === 'personal'
    ? 'Personal email (Gmail, Outlook, etc.)'
    : 'Official / work email address';

  return (
    <div>
      <Label required htmlFor="email">Email Address</Label>

      {/* Toggle pill */}
      <div className="inline-flex mb-2.5 p-1 rounded-xl bg-slate-100 border border-[#cbd5e1] gap-1">
        {['personal', 'official'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={[
              'px-4 py-1.5 rounded-lg text-[13px] font-bold capitalize transition-all duration-150',
              type === t
                ? 'bg-[#2F4191] text-white shadow-sm'
                : 'text-[#64748b] hover:text-[#1e293b]',
            ].join(' ')}
          >
            {t === 'personal' ? '👤 Personal' : '🏢 Official'}
          </button>
        ))}
      </div>

      <input
        id="email" name="email" type="email"
        value={value} onChange={onChange}
        placeholder={placeholder} required
        className={err ? `${INPUT_BASE} ${INPUT_ERROR}` : INPUT_BASE}
      />
      <p className="text-[11px] text-[#64748b] font-medium mt-1.5">{hint}</p>
      <ErrorMsg msg={err} />
    </div>
  );
}

function PhoneInput({ value, onChange, errors }) {
  const err = errors?.phone;
  return (
    <div>
      <Label required htmlFor="phone">Phone Number</Label>
      <div className={[
        'flex rounded-xl overflow-hidden border-2 transition-all duration-150 focus-within:ring-4',
        err
          ? 'border-red-400 bg-red-50 focus-within:ring-red-200 focus-within:border-red-500'
          : 'border-[#94a3b8] hover:border-[#64748b] focus-within:border-[#2F4191] focus-within:ring-[#2F4191]/15',
      ].join(' ')}>
        <span className="flex items-center gap-1.5 px-3.5 bg-slate-100 border-r-2 border-[#94a3b8] text-[#334155] text-sm font-bold shrink-0 select-none">
          🇮🇳 +91
        </span>
        <input
          id="phone" name="phone" value={value} onChange={onChange} required
          placeholder="Enter 10-digit number" maxLength={10} inputMode="numeric"
          className="flex-1 px-4 py-3 text-[15px] font-medium text-[#0f172a] bg-white outline-none placeholder:text-[#94a3b8] placeholder:font-normal"
        />
      </div>
      <ErrorMsg msg={err} />
    </div>
  );
}

function StateSelect({ value, onChange, errors }) {
  const err = errors?.state;
  return (
    <div>
      <Label required htmlFor="state">State</Label>
      <div className="relative">
        <select
          id="state" name="state" value={value} onChange={onChange} required
          className={[INPUT_BASE, 'pr-10 appearance-none cursor-pointer', err ? INPUT_ERROR : '', !value ? 'text-[#94a3b8]' : 'text-[#0f172a]'].join(' ')}
        >
          <option value="" disabled>Select your state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s} className="text-[#0f172a]">{s}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </span>
      </div>
      <ErrorMsg msg={err} />
    </div>
  );
}

function GSTInput({ value, onChange, errors }) {
  const err      = errors?.gstNumber;
  const hasValue = value.length > 0;
  const isValid  = hasValue && GST_REGEX.test(value);
  const isWrong  = hasValue && !isValid;
  return (
    <div>
      <label htmlFor="gstNumber" className="block text-sm font-bold text-[#1e293b] mb-2 tracking-wide">
        GST Number{' '}
        <span className="text-[11px] text-[#94a3b8] font-normal normal-case tracking-normal">— optional</span>
      </label>
      <div className="relative">
        <input
          id="gstNumber" name="gstNumber" value={value} onChange={onChange}
          placeholder="Leave blank if not available" maxLength={15}
          className={[INPUT_BASE, 'pr-10 font-mono tracking-widest uppercase', err || isWrong ? INPUT_ERROR : ''].join(' ')}
        />
        {hasValue && (
          <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-base ${isValid ? 'text-green-600' : 'text-red-500'}`}>
            {isValid ? '✓' : '✗'}
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#64748b] font-medium mt-1.5">
        Format: <span className="font-mono tracking-wider">22AAAAA0000A1Z5</span> (15 chars)
      </p>
      <ErrorMsg msg={err} />
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <div className="w-7 h-7 rounded-lg bg-[#2F4191]/10 flex items-center justify-center shrink-0 text-sm">
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-[3px] text-[#2F4191]">{title}</span>
      <div className="flex-1 h-[2px] bg-[#2F4191]/12 rounded-full" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PriceEnquiryForm({ isOpen, onClose, productData, onSuccess }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        product: productData?.model || '',
        price:   productData?.price || '',
      }));
      setErrors({});
      setApiError('');
    }
  }, [isOpen, productData]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const sanitized = sanitizeField(name, value);
    if (sanitized === null) return;
    setFormData(prev => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAll(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTimeout(() => {
        document.querySelector('[data-form-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setLoading(true);
    setApiError('');

    const payload = {
      ...formData,
      product:     productData?.model || '',
      price:       productData?.price || '',
      submittedAt: new Date().toISOString(),
      ...collectTracking(),
    };

    try {
      const res = await fetch('/api/priceEnquiry', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server error ${res.status}`);
      }
      onSuccess?.({ product: productData, price: productData?.price });
      onClose();
      setFormData(INITIAL_FORM);
    } catch (err) {
      console.error('[PriceEnquiry]', err);
      setApiError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-[#cbd5e1]"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(148,163,184,0.3)' }}
      >

        {/* ── HEADER ── */}
        <div className="shrink-0 flex justify-between items-center px-6 py-4 border-b-2 border-[#e2e8f0] bg-gradient-to-r from-[#2F4191]/5 to-[#2B7EC2]/5 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-black text-[#2F4191] tracking-tight">Price Enquiry</h2>
            <p className="text-sm text-[#64748b] font-medium mt-0.5">Fill in your details to unlock an exclusive quote</p>
          </div>
          <button
            onClick={onClose} aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-[#e2e8f0] hover:border-[#94a3b8] hover:bg-slate-50 transition text-[#64748b] hover:text-[#1e293b]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 transparent' }}>

          {/* ── PRODUCT CARD ── */}
          {productData && (
            <div className="px-6 pt-5 pb-5 border-b-2 border-[#e2e8f0]">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#2F4191]/8 to-[#2B7EC2]/8 rounded-xl border-2 border-[#2F4191]/20">
                {productData.thumbnail && (
                  <div className="w-16 h-16 rounded-xl bg-white border-2 border-[#cbd5e1] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    <Image src={productData.thumbnail} alt={productData.model} width={56} height={56} className="object-contain" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-[2px] font-bold text-[#2B7EC2] mb-0.5">Selected Product</p>
                  <p className="text-base font-black text-[#2F4191] truncate">{productData.model}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 bg-[#2F4191] text-white px-3.5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  Exclusive
                </div>
              </div>
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-6">

            {/* ── PERSONAL INFO ── */}
            <SectionTitle icon="👤" title="Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextInput label="Full Name" name="name" value={formData.name}
                onChange={handleChange} errors={errors} placeholder="e.g. Ravi Kumar" required />
              <TextInput label="Designation" name="designation" value={formData.designation}
                onChange={handleChange} errors={errors} placeholder="e.g. Manager, Director" required />
              <EmailInput value={formData.email} onChange={handleChange} errors={errors} />
              <PhoneInput value={formData.phone} onChange={handleChange} errors={errors} />
            </div>

            {/* ── ORGANISATION ── */}
            <SectionTitle icon="🏢" title="Organisation Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextInput label="Company Name" name="company" value={formData.company}
                onChange={handleChange} errors={errors} placeholder="Your company name" required />
              <GSTInput value={formData.gstNumber} onChange={handleChange} errors={errors} />
              <TextInput label="Industry" name="industry" value={formData.industry}
                onChange={handleChange} errors={errors} placeholder="e.g. Pharma, Research" required />
              <TextInput label="Department" name="department" value={formData.department}
                onChange={handleChange} errors={errors} placeholder="e.g. Procurement, R&D" required />
            </div>

            {/* ── LOCATION ── */}
            <SectionTitle icon="📍" title="Location" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <TextInput label="City" name="city" value={formData.city}
                onChange={handleChange} errors={errors} placeholder="e.g. Hyderabad" required />
              <StateSelect value={formData.state} onChange={handleChange} errors={errors} />
              <div>
                <Label htmlFor="country">Country</Label>
                <input
                  id="country" value="India" readOnly
                  className={INPUT_READONLY + ' w-full h-13 px-4 py-3 text-[15px] font-medium rounded-xl border-2 outline-none'}
                />
              </div>
            </div>

            {/* ── REQUIREMENTS ── */}
            <SectionTitle icon="💬" title="Requirements" />
            <div>
              <Label htmlFor="message">Requirements / Message</Label>
              <textarea
                id="message" name="message" rows={4}
                value={formData.message} onChange={handleChange}
                placeholder="Describe your requirements — quantity, delivery timeline, application, special configurations..."
                className={[
                  'w-full px-4 py-3 resize-none rounded-xl outline-none',
                  'text-[15px] font-medium text-[#0f172a]',
                  'border-2 border-[#94a3b8]',
                  'placeholder:text-[#94a3b8] placeholder:font-normal',
                  'focus:border-[#2F4191] focus:ring-4 focus:ring-[#2F4191]/15',
                  'hover:border-[#64748b] transition-all duration-150',
                ].join(' ')}
              />
              <p className="text-[12px] text-[#64748b] font-medium mt-1.5">
                💡 More detail = more accurate quote
              </p>
            </div>

            {/* ── API ERROR ── */}
            {apiError && (
              <div data-form-error className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <span className="text-xl mt-0.5">⚠️</span>
                <div>
                  <p className="text-sm font-black text-red-700">Submission Failed</p>
                  <p className="text-xs font-medium text-red-600 mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {/* ── VALIDATION SUMMARY ── */}
            {Object.keys(errors).length > 2 && (
              <div data-form-error className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <span className="text-xl mt-0.5">📋</span>
                <div>
                  <p className="text-sm font-black text-amber-800">
                    Please fix {Object.keys(errors).length} fields before submitting
                  </p>
                  <p className="text-xs font-medium text-amber-700 mt-0.5">
                    Each field with an error is highlighted in red below it.
                  </p>
                </div>
              </div>
            )}

            {/* ── SUBMIT ── */}
            <button
              type="submit" disabled={loading}
              className={[
                'w-full py-4 px-6 rounded-xl text-base font-black text-white',
                'flex items-center justify-center gap-3',
                'bg-gradient-to-r from-[#2F4191] to-[#2B7EC2]',
                'hover:from-[#2B7EC2] hover:to-[#1a5fa8]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'transition-all duration-200 group',
                'shadow-[0_4px_24px_rgba(47,65,145,0.35)] hover:shadow-[0_6px_32px_rgba(47,65,145,0.45)]',
                'hover:-translate-y-0.5 active:translate-y-0',
                'border-2 border-[#2F4191]/20',
              ].join(' ')}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Sending Your Enquiry…
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Unlock My Exclusive Price
                </>
              )}
            </button>

            <p className="text-center text-[12px] text-[#94a3b8] font-medium">
              🔒 Your information is confidential and will never be shared with third parties.
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}