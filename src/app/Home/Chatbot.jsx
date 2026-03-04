'use client';
import { useState, useMemo, useRef, useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAIN_OPTIONS = [
  { id: 'Product', label: '🔬 Product Enquiry', desc: 'Browse & enquire about our lab equipment' },
  { id: 'Service', label: '🔧 Service Request', desc: 'Repair, calibration or AMC support' },
  { id: 'Get a Quote', label: '📄 Request a Quote', desc: 'Get a customised price quote' },
  { id: 'Talk to expert', label: '💬 Talk to Expert', desc: 'Speak with our technical team' },
];

// dropdown of indian states reused across forms
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const PRODUCTS = [
  'Laboratory Drying Oven', 'Incubators', 'Chillers', 'Water Baths',
  'Rotary Evaporators', 'Pumps', 'Cabinet', 'Freezers',
  'Digital Viscometer', 'Muffle Furnace',
];

export const PRODUCT_MASTER = [
  { name: 'Laboratory Drying Oven', slug: 'laboratory-drying-oven', link: '#' },
  { name: 'Vacuum Oven (LED Display)', slug: 'vacuum-oven-led', link: '#' },
  { name: 'Vacuum Oven (Touch Control)', slug: 'vacuum-oven-touch', link: '#' },
  { name: 'High-Temperature Muffle Furnace', slug: 'muffle-furnace', link: '#' },
  { name: 'Water Bath', slug: 'water-bath', link: '#' },
  { name: 'Heating Incubator', slug: 'heating-incubator', link: '#' },
  { name: 'Vacuum Pump (Oil-Sealed)', slug: 'vacuum-pump-oil', link: '#' },
  { name: 'Diaphragm Pump', slug: 'diaphragm-pump', link: '#' },
  { name: 'Rotary Evaporator', slug: 'rotary-evaporator', link: '#' },
  { name: 'Rotary Evaporator Controller', slug: 'rotary-controller', link: '#' },
  { name: 'Recirculating Chiller (–20 °C to +20 °C)', slug: 'chiller-20', link: '#' },
  { name: 'Recirculating Chiller (–10 °C to +100 °C)', slug: 'chiller-100', link: '#' },
  { name: 'High-Temperature Chiller', slug: 'high-temp-chiller', link: '#' },
  { name: 'Digital Viscometer', slug: 'digital-viscometer', link: '#' },
  { name: 'Cooling Incubator', slug: 'cooling-incubator', link: '#' },
  { name: 'Deep Freezer (–40 °C)', slug: 'deep-freezer-40', link: '#' },
  { name: 'Deep Freezer (–25 °C)', slug: 'deep-freezer-25', link: '#' },
  { name: 'Ultra-Low Temperature Freezer (–86 °C)', slug: 'ult-freezer', link: '#' },
  { name: 'Laboratory Refrigerator (2–8 °C)', slug: 'lab-refrigerator', link: '#' },
  { name: 'CO₂ Incubator', slug: 'co2-incubator', link: '#' },
  { name: 'Biosafety Cabinet', slug: 'biosafety-cabinet', link: '#' },
  { name: 'Vertical Laminar Airflow Cabinet', slug: 'laminar-airflow', link: '#' },
  { name: 'Combined Refrigerator & Deep Freezer', slug: 'combo-fridge', link: '#' },
  { name: 'Cell Culture Lab Setup', slug: 'cell-culture-setup', link: '#' },
];

export const CROSS_SELL_MAP = {
  'Laboratory Drying Oven': ['Vacuum Oven (LED Display)', 'Vacuum Oven (Touch Control)', 'High-Temperature Muffle Furnace', 'Water Bath', 'Heating Incubator'],
  'Vacuum Oven (LED Display)': ['Vacuum Pump (Oil-Sealed)', 'Diaphragm Pump', 'Laboratory Drying Oven', 'Recirculating Chiller (–20 °C to +20 °C)'],
  'Vacuum Oven (Touch Control)': ['Vacuum Pump (Oil-Sealed)', 'Diaphragm Pump', 'Rotary Evaporator', 'Recirculating Chiller (–20 °C to +20 °C)'],
  'Vacuum Pump (Oil-Sealed)': ['Vacuum Oven (LED Display)', 'Vacuum Oven (Touch Control)', 'Rotary Evaporator', 'Diaphragm Pump'],
  'Diaphragm Pump': ['Vacuum Oven (LED Display)', 'Rotary Evaporator', 'Vacuum Pump (Oil-Sealed)'],
  'Rotary Evaporator': ['Rotary Evaporator Controller', 'Vacuum Pump (Oil-Sealed)', 'Diaphragm Pump', 'Recirculating Chiller (–20 °C to +20 °C)', 'High-Temperature Chiller', 'Water Bath'],
  'Water Bath': ['Rotary Evaporator', 'Heating Incubator', 'Digital Viscometer'],
  'Digital Viscometer': ['Water Bath', 'Heating Incubator', 'Laboratory Refrigerator (2–8 °C)'],
  'CO₂ Incubator': ['Biosafety Cabinet', 'Vertical Laminar Airflow Cabinet', 'Ultra-Low Temperature Freezer (–86 °C)', 'Laboratory Refrigerator (2–8 °C)'],
};

// ─── Tracking Utilities ───────────────────────────────────────────────────────

/**
 * Detects device type from user agent.
 * Returns 'Mobile', 'Tablet', or 'Desktop'
 */
function detectDevice(ua = '') {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet 📱';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return 'Mobile 📱';
  return 'Desktop 🖥️';
}

/**
 * Parses document.referrer to find traffic source + organic keyword.
 * UTM params (if present) always take priority.
 */
function parseReferrer(referrer = '') {
  if (!referrer) return { source: 'Direct / None', keyword: '' };

  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();

    const SEARCH_ENGINES = [
      { pattern: /google\./,     name: 'Google',     param: 'q' },
      { pattern: /bing\./,       name: 'Bing',       param: 'q' },
      { pattern: /yahoo\./,      name: 'Yahoo',      param: 'p' },
      { pattern: /duckduckgo\./, name: 'DuckDuckGo', param: 'q' },
      { pattern: /yandex\./,     name: 'Yandex',     param: 'text' },
      { pattern: /baidu\./,      name: 'Baidu',      param: 'wd' },
      { pattern: /ecosia\./,     name: 'Ecosia',     param: 'q' },
      { pattern: /ask\./,        name: 'Ask',        param: 'q' },
    ];

    const SOCIAL_NETWORKS = [
      { pattern: /facebook\.|fb\.com/, name: 'Facebook' },
      { pattern: /instagram\./,        name: 'Instagram' },
      { pattern: /linkedin\./,         name: 'LinkedIn' },
      { pattern: /twitter\.|x\.com/,   name: 'Twitter / X' },
      { pattern: /youtube\./,          name: 'YouTube' },
      { pattern: /whatsapp\./,         name: 'WhatsApp' },
      { pattern: /t\.me|telegram\./,   name: 'Telegram' },
    ];

    for (const engine of SEARCH_ENGINES) {
      if (engine.pattern.test(host)) {
        // Note: Google hides keywords via SSL — will show "(not provided)" for most organic
        const keyword = url.searchParams.get(engine.param) || '(not provided — SSL search)';
        return { source: engine.name, keyword };
      }
    }

    for (const social of SOCIAL_NETWORKS) {
      if (social.pattern.test(host)) {
        return { source: social.name, keyword: '' };
      }
    }

    return { source: `Referral — ${url.hostname}`, keyword: '' };
  } catch {
    return { source: 'Unknown', keyword: '' };
  }
}

/**
 * Collects all browser-available tracking signals.
 * IP address is NOT available client-side — injected server-side.
 */
function collectTrackingData() {
  if (typeof window === 'undefined') return {};

  const ua        = navigator.userAgent || '';
  const referrer  = document.referrer  || '';
  const urlParams = new URLSearchParams(window.location.search);

  // UTM parameters (paid campaigns, email, etc.)
  const utmSource   = urlParams.get('utm_source')   || '';
  const utmMedium   = urlParams.get('utm_medium')   || '';
  const utmCampaign = urlParams.get('utm_campaign') || '';
  const utmKeyword  = urlParams.get('utm_term') || urlParams.get('utm_keyword') || '';
  const utmContent  = urlParams.get('utm_content')  || '';

  const { source: referrerSource, keyword: organicKeyword } = parseReferrer(referrer);

  return {
    _pageUrl:        window.location.href,
    _referrerUrl:    referrer || 'Direct / None',
    // UTM source takes priority, falls back to referrer parse
    _trafficSource:  utmSource   || referrerSource,
    _trafficMedium:  utmMedium   || '',
    _utmCampaign:    utmCampaign || '',
    _utmContent:     utmContent  || '',
    // UTM keyword takes priority over organic referrer keyword
    _searchKeyword:  utmKeyword  || organicKeyword,
    _deviceType:     detectDevice(ua),
    _userAgent:      ua,
    // _visitorIp is injected by the server from x-forwarded-for
  };
}

// ─── Field Config ─────────────────────────────────────────────────────────────

const FIELD_CONFIG = {
  Product: [
    { key: 'name',        label: 'Your Name',       type: 'text',  required: true },
    { key: 'company',     label: 'Company Name',    type: 'text',  required: true },
    { key: 'email',       label: 'Email',           type: 'email', required: true },
    { key: 'contact',     label: 'Contact Number',  type: 'tel',   required: true },
    { key: 'industry',    label: 'Industry',        type: 'text',  required: true },
    { key: 'designation', label: 'Designation',     type: 'text',  required: false },
    { key: 'country',     label: 'Country',         type: 'text',  required: false, readOnly: true },
    { key: 'state',       label: 'State',           type: 'select', options: INDIAN_STATES, required: false },
    { key: 'city',        label: 'City',            type: 'text',  required: false },
    { key: 'gst',         label: 'GST Number',      type: 'text',  required: false },
  ],
  Service: [
    { key: 'customerName', label: 'Customer Name',    type: 'text',   required: true },
    { key: 'email',        label: 'Email',            type: 'email',  required: true },
    { key: 'contact',      label: 'Contact Number',   type: 'tel',    required: true },
    { key: 'company',      label: 'Company Name',     type: 'text',   required: false },
    { key: 'productName',  label: 'Product Name',     type: 'text',   required: true },
    { key: 'modelNumber',  label: 'Model Number',     type: 'text',   required: false },
    { key: 'serviceType',  label: 'Type of Service',  type: 'text',   required: true },
    { key: 'underWarranty',label: 'Under Warranty?',  type: 'select', options: ['Yes', 'No', 'Not Sure'], required: true, fullWidth: false },
    { key: 'country',      label: 'Country',          type: 'text',   required: false, readOnly: true },
    { key: 'state',        label: 'State',            type: 'select', options: INDIAN_STATES, required: false },
    { key: 'city',         label: 'City',             type: 'text',   required: false },
    { key: 'message',      label: 'Message',          type: 'textarea', required: false, fullWidth: true },
  ],
  'Get a Quote': [
    { key: 'customerName',    label: 'Customer Name',     type: 'text',     required: true },
    { key: 'company',         label: 'Company Name',      type: 'text',     required: true },
    { key: 'email',           label: 'Email',             type: 'email',    required: true },
    { key: 'contact',         label: 'Contact Number',    type: 'tel',      required: true },
    { key: 'gst',             label: 'GST Number',        type: 'text',     required: false },
    { key: 'country',         label: 'Country',          type: 'text',     required: false, readOnly: true },
    { key: 'state',           label: 'State',             type: 'select',   options: INDIAN_STATES, required: false },
    { key: 'billingAddress',  label: 'Billing Address',   type: 'textarea', required: false, fullWidth: true },
    { key: 'shippingAddress', label: 'Shipping Address',  type: 'textarea', required: false, fullWidth: true },
  ],
  'Talk to expert': [
    { key: 'customerName',    label: 'Your Name',          type: 'text',     required: true },
    { key: 'email',           label: 'Email',              type: 'email',    required: true },
    { key: 'contact',         label: 'Contact Number',     type: 'tel',      required: true },
    { key: 'company',         label: 'Company Name',       type: 'text',     required: true },
    { key: 'enquiredProduct', label: 'Product of Interest',type: 'text',     required: false },
    { key: 'country',         label: 'Country',          type: 'text',     required: false, readOnly: true },
    { key: 'state',            label: 'State',             type: 'select',   options: INDIAN_STATES, required: false },
    { key: 'city',            label: 'City',               type: 'text',     required: false },
    { key: 'message',         label: 'Message / Query',    type: 'textarea', required: false, fullWidth: true },
  ],
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }
function validatePhone(val) { return /^[\d\s\-+()]{7,15}$/.test(val); }

function validateForm(fields, formData) {
  const errors = {};
  fields.forEach(({ key, label, type, required }) => {
    const val = (formData[key] || '').trim();
    if (required && !val) { errors[key] = `${label} is required`; return; }
    if (val) {
      if (type === 'email' && !validateEmail(val)) errors[key] = 'Enter a valid email';
      if (type === 'tel'   && !validatePhone(val)) errors[key] = 'Enter a valid phone number';
    }
  });
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step, category }) {
  const total   = category === 'Product' ? 4 : 3;
  const current = category === 'Product' ? step + 1 : step === 0 ? 1 : step === 2 ? 2 : 3;
  return (
    <div className="h-0.5 bg-blue-100">
      <div className="h-full bg-gradient-to-r from-[#2F4191] to-[#2B7EC2] transition-all duration-500"
        style={{ width: `${Math.min((current / total) * 100, 100)}%` }} />
    </div>
  );
}

function FormField({ field, value, error, onChange }) {
  const base =
    'w-full border text-sm px-3 py-2 rounded-xl transition outline-none focus:ring-2 focus:ring-[#2F4191]/40 ' +
    (error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-[#2F4191]');

  return (
    <div className={field.fullWidth ? 'col-span-2' : ''}>
      <label className="block text-xs text-gray-500 mb-1 font-medium">
        {/* {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>} */}
      </label>
      {field.type === 'textarea' ? (
        <textarea rows={3} placeholder={field.label + (field.required ? ' *' : '')} value={value}
          onChange={(e) => onChange(field.key, e.target.value)} className={base + ' resize-none'} />
      ) : field.type === 'select' ? (
        <select value={value} onChange={(e) => onChange(field.key, e.target.value)} className={base}>
          <option value="">Select…</option>
          {field.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={field.type} placeholder={field.label} value={value}
          onChange={(e) => onChange(field.key, e.target.value)} className={base} />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Chatbot({ open, onClose }) {
  const [step, setStep]                       = useState(0);
  const [category, setCategory]               = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productSearch, setProductSearch]     = useState('');
  const [formData, setFormData]               = useState({});
  const [errors, setErrors]                   = useState({});
  const [loading, setLoading]                 = useState(false);
  const [apiError, setApiError]               = useState('');
  const [showCrossSell, setShowCrossSell]     = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const bodyRef = useRef(null);

  const fields           = useMemo(() => FIELD_CONFIG[category] || [], [category]);
  const filteredProducts = useMemo(() =>
    PRODUCTS.filter((p) => p.toLowerCase().includes(productSearch.toLowerCase())),
    [productSearch]
  );

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [step]);

  if (!open) return null;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCategorySelect = (opt) => {
    setCategory(opt);
    // ensure every new form pre-fills country as India
    setFormData({ country: 'India' });
    setErrors({}); setApiError('');
    setStep(opt === 'Product' ? 1 : 2);
  };

  const handleProductSelect = (product) => { setSelectedProduct(product); setStep(2); };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(fields, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      return;
    }

    setLoading(true);
    setApiError('');

    const tracking = collectTrackingData();

    const payload = {
      category: category === 'Get a Quote' ? 'Quote' : category,
      ...(category === 'Product' && { product: selectedProduct }),
      ...formData,
      submittedAt: new Date().toISOString(),
      ...tracking,
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      if (category === 'Product' && CROSS_SELL_MAP[selectedProduct]) {
        const matched = PRODUCT_MASTER.filter((p) => CROSS_SELL_MAP[selectedProduct].includes(p.name));
        setRecommendedProducts(matched);
        setShowCrossSell(matched.length > 0);
      }

      setStep(3);
    } catch (err) {
      console.error('Chatbot submit error:', err);
      setApiError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setApiError('');
    if (step === 1) { setStep(0); setCategory(null); setSelectedProduct(''); setProductSearch(''); }
    else if (step === 2) { if (category === 'Product') setStep(1); else { setStep(0); setCategory(null); } setErrors({}); }
  };

  const handleReset = () => {
    setStep(0); setCategory(null); setSelectedProduct(''); setProductSearch('');
    setFormData({}); setErrors({}); setApiError(''); setShowCrossSell(false); setRecommendedProducts([]);
  };

  // ─── Renders ───────────────────────────────────────────────────────────────

  const renderCategorySelection = () => (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">How can we help?</p>
      {MAIN_OPTIONS.map((opt) => (
        <button key={opt.id} onClick={() => handleCategorySelect(opt.id)}
          className="w-full text-left bg-[#2F4191] rounded-xl border border-gray-100 px-4 py-3 hover:border-[#2F4191] hover:bg-blue-50/60 transition group">
          <div className="text-sm font-semibold text-white group-hover:text-[#2F4191]">{opt.label}</div>
          <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
        </button>
      ))}
    </div>
  );

  const renderProductSelection = () => (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Select a Product</p>
      <input type="text" placeholder="Search products…" value={productSearch}
        onChange={(e) => setProductSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4191]/40 focus:border-[#2F4191]" />
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {filteredProducts.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No products match your search.</p>
        )}
        {filteredProducts.map((p) => (
          <button key={p} onClick={() => handleProductSelect(p)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition
              ${selectedProduct === p ? 'border-[#2F4191] bg-[#2F4191] text-white' : 'border-gray-100 hover:border-[#2F4191] hover:bg-blue-50/60 text-gray-700'}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-4">
      {category === 'Product' && selectedProduct && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-blue-400 text-base">🔬</span>
          <span className="text-xs font-medium text-[#2F4191] truncate">{selectedProduct}</span>
        </div>
      )}
      <p className="text-xs text-gray-400">Fields marked <span className="text-red-400 font-bold">*</span> are required</p>
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2">{apiError}</div>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {fields.map((field) => (
          <FormField key={field.key} field={field} value={formData[field.key] || ''}
            error={errors[field.key]} onChange={handleFieldChange} />
        ))}
      </div>
      <button onClick={handleSubmit} disabled={loading}
        className="w-full mt-1 rounded-xl bg-gradient-to-r from-[#2F4191] to-[#2B7EC2] text-white py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition">
        {loading ? (
          <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>Submitting…</>
        ) : (
          <>Submit & Send
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </>
        )}
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-4 space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 text-4xl mx-auto">✅</div>
      <div>
        <h3 className="font-bold text-lg text-[#2F4191]">All Done!</h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">Your request has been received. Our team will reach out shortly.</p>
      </div>
      {showCrossSell && (
        <div className="border-t pt-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">You may also need</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recommendedProducts.map((product) => (
              <a key={product.slug} href={product.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 text-sm rounded-xl border-2 border-[#2F4191]/20 hover:border-[#2F4191] hover:bg-blue-50 transition group">
                <span className="text-gray-700 group-hover:text-[#2F4191] font-medium text-left">{product.name}</span>
                <span className="text-[#2F4191] opacity-0 group-hover:opacity-100 transition text-xs">View →</span>
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button onClick={handleReset} className="flex-1 rounded-xl border border-gray-200 text-gray-600 py-2 text-sm font-medium hover:bg-gray-50 transition">New Request</button>
        <button onClick={onClose} className="flex-1 rounded-xl bg-gradient-to-r from-[#2F4191] to-[#2B7EC2] text-white py-2 text-sm font-semibold hover:opacity-90 transition">Close</button>
      </div>
    </div>
  );

  const stepTitles = { 0: 'How can we help?', 1: 'Select Product', 2: category ? `${category} Form` : 'Fill Details', 3: 'Submitted!' };

  return (
    <div className="fixed bottom-5 right-15 z-50 w-[300px] md:w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#2F4191] to-[#2B7EC2] text-white px-4 py-3 shrink-0">
        {(step === 1 || step === 2) && (
          <button onClick={handleBack} className="p-1 rounded-lg hover:bg-white/20 transition mr-1" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs opacity-70 leading-none mb-0.5">Being India</p>
          <p className="text-sm font-semibold truncate">{stepTitles[step]}</p>
        </div>
        <button onClick={onClose} aria-label="Close chat" className="p-1 rounded-lg hover:bg-white/20 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {step < 3 && <ProgressBar step={step} category={category} />}

      <div ref={bodyRef} className="p-4 overflow-y-auto flex-1">
        {step === 0 && renderCategorySelection()}
        {step === 1 && renderProductSelection()}
        {step === 2 && renderForm()}
        {step === 3 && renderSuccess()}
      </div>

      <div className="px-4 py-2 border-t border-gray-50 shrink-0">
        <p className="text-center text-[10px] text-gray-300">
          Powered by <span className="text-[#2F4191] font-medium">Being India</span> · Your data is safe with us
        </p>
      </div>
    </div>
  );
}
