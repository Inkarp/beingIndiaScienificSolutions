import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

// ─── Environment Validation ────────────────────────────────────────────────────
const REQUIRED_ENV = ['EMAIL_USER', 'EMAIL_PASS', 'COMPANY_EMAIL'];

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

// ─── Transporter (lazy singleton) ─────────────────────────────────────────────
let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  validateEnv();
  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    pool: true,
    maxConnections: 3,
    rateDelta: 1000,
    rateLimit: 5,
  });
  return _transporter;
}

// ─── Rate Limiting (in-memory, per IP) ────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_MAX    = 50;  // Increased for development; reduce to 5 for production
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, e] of rateLimitMap.entries()) {
      if (now > e.resetAt) rateLimitMap.delete(ip);
    }
  }, 10 * 60 * 1000);
}

// ─── IP Extraction ────────────────────────────────────────────────────────────
function extractIp(request) {
  // Vercel / Cloudflare / proxies set x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  // Cloudflare sets cf-connecting-ip
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return 'Unknown';
}

// ─── Input Sanitization ───────────────────────────────────────────────────────
function sanitize(value) {
  if (typeof value !== 'string') return String(value ?? '');
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim()
    .slice(0, 2000);
}

// ─── Field Label Map ──────────────────────────────────────────────────────────
const LABEL_MAP = {
  name: 'Name', customerName: 'Customer Name', company: 'Company Name',
  email: 'Email', officialEmail: 'Official Email', contact: 'Contact Number',
  designation: 'Designation', department: 'Department', industry: 'Industry',
  country: 'Country', state: 'State', city: 'City', gst: 'GST Number',
  productName: 'Product Name', modelNumber: 'Model Number',
  serviceType: 'Type of Service', underWarranty: 'Under Warranty',
  billingAddress: 'Billing Address', shippingAddress: 'Shipping Address',
  enquiredProduct: 'Enquired Product', message: 'Message',
  submittedAt: 'Submitted At', category: 'Category', product: 'Product',
};

function formatLabel(key) {
  return LABEL_MAP[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

// ─── Tracking field keys (prefixed with _) ────────────────────────────────────
const TRACKING_KEYS = new Set([
  '_pageUrl', '_referrerUrl', '_trafficSource', '_trafficMedium',
  '_utmCampaign', '_utmContent', '_searchKeyword', '_deviceType',
  '_userAgent', '_visitorIp',
]);

// Fields to skip from the main form table
const SKIP_IN_FORM_TABLE = new Set(['category', 'product', 'submittedAt', ...TRACKING_KEYS]);

// ─── Validation ───────────────────────────────────────────────────────────────
const VALID_CATEGORIES = ['Product', 'Service', 'Quote', 'Talk to expert'];

const REQUIRED_FIELDS = {
  Product:          ['name', 'company', 'email', 'contact'],
  Service:          ['customerName', 'email', 'contact', 'productName', 'serviceType', 'underWarranty'],
  Quote:            ['customerName', 'company', 'email', 'contact'],
  'Talk to expert': ['customerName', 'email', 'contact'],
};

function validatePayload(data) {
  const errors = [];
  if (!data.category || !VALID_CATEGORIES.includes(data.category))
    errors.push('Invalid or missing category.');

  for (const field of REQUIRED_FIELDS[data.category] ?? []) {
    if (!data[field]?.toString().trim())
      errors.push(`Missing required field: ${formatLabel(field)}`);
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push('Invalid email format.');

  if (data.contact && !/^[\d\s\-+()]{7,15}$/.test(data.contact))
    errors.push('Invalid contact number.');

  return errors;
}

// ─── Email Template ───────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  Product:          '#22d3ee',
  Service:          '#f59e0b',
  Quote:            '#a78bfa',
  'Talk to expert': '#34d399',
};

function buildFormRows(data) {
  return Object.entries(data)
    .filter(([key]) => !SKIP_IN_FORM_TABLE.has(key))
    .map(([key, value]) => `
      <tr>
        <td style="padding:10px 14px; border-bottom:1px solid #1e293b; font-weight:600;
                   color:#94a3b8; white-space:nowrap; width:36%; vertical-align:top; font-size:13px;">
          ${formatLabel(key)}
        </td>
        <td style="padding:10px 14px; border-bottom:1px solid #1e293b; color:#e2e8f0;
                   font-size:13px; word-break:break-word;">
          ${sanitize(value) || '<span style="color:#475569;">—</span>'}
        </td>
      </tr>
    `)
    .join('');
}

function pill(color, label) {
  return `<span style="display:inline-block; background:${color}22; color:${color};
    border:1px solid ${color}44; border-radius:20px; padding:2px 10px;
    font-size:11px; font-weight:700; letter-spacing:.5px;">${label}</span>`;
}

function trackingRow(icon, label, value, highlight = false) {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:9px 14px; border-bottom:1px solid #1e293b; color:#64748b;
                 font-size:12px; white-space:nowrap; vertical-align:top; width:36%;">
        ${icon} ${label}
      </td>
      <td style="padding:9px 14px; border-bottom:1px solid #1e293b;
                 font-size:12px; word-break:break-word;
                 color:${highlight ? '#fbbf24' : '#cbd5e1'}; font-weight:${highlight ? '700' : '400'};">
        ${sanitize(value)}
      </td>
    </tr>
  `;
}

function buildEmailHtml({ data, now, visitorIp }) {
  const category    = data.category ?? 'General';
  const product     = data.product  ?? '';
  const accent      = CATEGORY_COLORS[category] ?? '#38bdf8';
  const formRows    = buildFormRows(data);

  // Source badge
  const source   = data._trafficSource || 'Direct / None';
  const keyword  = data._searchKeyword || '';
  const device   = data._deviceType   || 'Unknown';
  const pageUrl  = data._pageUrl      || '';
  const referrer = data._referrerUrl  || '';
  const medium   = data._trafficMedium  || '';
  const campaign = data._utmCampaign    || '';
  const content  = data._utmContent     || '';
  const ua       = data._userAgent      || '';

  // Color-code source
  const sourceColor =
    /google/i.test(source) ? '#4285F4' :
    /bing/i.test(source)   ? '#008373' :
    /facebook|instagram/i.test(source) ? '#1877F2' :
    /direct/i.test(source) ? '#64748b' : accent;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>New ${sanitize(category)} Enquiry</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- ── HEADER ── -->
      <tr>
        <td style="background:${accent}18;border:1px solid ${accent}33;
                   border-radius:12px 12px 0 0;padding:22px 28px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;
                    text-transform:uppercase;color:${accent};">Being India — Website Chatbot</p>
          <h1 style="margin:0;font-size:20px;color:#f8fafc;font-weight:700;">
            New ${sanitize(category)} Enquiry
            ${product ? `<span style="font-size:13px;color:#94a3b8;font-weight:400;">
              &nbsp;·&nbsp;${sanitize(product)}</span>` : ''}
          </h1>
          <p style="margin:8px 0 0;font-size:12px;color:#64748b;">Received: ${now}</p>
        </td>
      </tr>

      <!-- ── VISITOR INTELLIGENCE PANEL ── -->
      <tr>
        <td style="background:#020617;border-left:1px solid ${accent}33;
                   border-right:1px solid ${accent}33;padding:0;">

          <!-- Section title -->
          <div style="padding:14px 14px 6px;border-bottom:1px solid #1e293b;">
            <span style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                         text-transform:uppercase;color:#475569;">
              📊 Visitor Intelligence
            </span>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

            <!-- IP Address -->
            <tr>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;color:#64748b;
                         font-size:12px;white-space:nowrap;vertical-align:top;width:36%;">
                🌐 IP Address
              </td>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;font-size:12px;
                         color:#f87171;font-weight:700;font-family:monospace;">
                ${sanitize(visitorIp)}
              </td>
            </tr>

            <!-- Device -->
            <tr>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;color:#64748b;
                         font-size:12px;white-space:nowrap;vertical-align:top;">
                💻 Device Type
              </td>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;font-size:12px;color:#e2e8f0;">
                ${pill(device.includes('Mobile') ? '#f59e0b' : device.includes('Tablet') ? '#a78bfa' : '#22d3ee', sanitize(device))}
              </td>
            </tr>

            <!-- Traffic Source -->
            <tr>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;color:#64748b;
                         font-size:12px;white-space:nowrap;vertical-align:top;">
                🔍 Traffic Source
              </td>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;font-size:12px;">
                ${pill(sourceColor, sanitize(source))}
                ${medium ? `<span style="font-size:11px;color:#64748b;margin-left:6px;">via ${sanitize(medium)}</span>` : ''}
              </td>
            </tr>

            <!-- Search Keyword — highlighted if present -->
            <tr>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;color:#64748b;
                         font-size:12px;white-space:nowrap;vertical-align:top;">
                🔑 Search Keyword
              </td>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;font-size:12px;
                         color:${keyword && !/not provided/i.test(keyword) ? '#fbbf24' : '#475569'};
                         font-weight:${keyword && !/not provided/i.test(keyword) ? '700' : '400'};">
                ${keyword ? sanitize(keyword) : '<span style="color:#334155;font-style:italic;">Not available</span>'}
              </td>
            </tr>

            ${campaign ? trackingRow('📢', 'Campaign', campaign, false) : ''}
            ${content  ? trackingRow('🎯', 'Ad Content', content, false) : ''}

            <!-- Page URL -->
            <tr>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;color:#64748b;
                         font-size:12px;white-space:nowrap;vertical-align:top;">
                📄 Page URL
              </td>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;font-size:12px;
                         word-break:break-all;">
                ${pageUrl
                  ? `<a href="${sanitize(pageUrl)}" style="color:#38bdf8;text-decoration:none;">${sanitize(pageUrl)}</a>`
                  : '<span style="color:#334155;">—</span>'}
              </td>
            </tr>

            <!-- Referrer -->
            <tr>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;color:#64748b;
                         font-size:12px;white-space:nowrap;vertical-align:top;">
                🔗 Referrer
              </td>
              <td style="padding:9px 14px;border-bottom:1px solid #1e293b;font-size:12px;
                         word-break:break-all;color:#94a3b8;">
                ${referrer && referrer !== 'Direct / None'
                  ? `<a href="${sanitize(referrer)}" style="color:#64748b;text-decoration:none;">${sanitize(referrer)}</a>`
                  : '<span style="color:#334155;font-style:italic;">Direct / None</span>'}
              </td>
            </tr>

            <!-- User Agent (collapsed visually) -->
            <tr>
              <td style="padding:9px 14px;color:#334155;font-size:11px;white-space:nowrap;vertical-align:top;">
                🖥️ User Agent
              </td>
              <td style="padding:9px 14px;font-size:10px;color:#334155;word-break:break-all;font-family:monospace;">
                ${sanitize(ua) || '—'}
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- ── FORM DATA ── -->
      <tr>
        <td style="background:#020617;border-left:1px solid ${accent}33;
                   border-right:1px solid ${accent}33;padding:0;border-top:2px solid #0f172a;">

          <div style="padding:14px 14px 6px;border-bottom:1px solid #1e293b;">
            <span style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                         text-transform:uppercase;color:#475569;">
              📋 Submission Details
            </span>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${formRows}
            <!-- Submitted At -->
            <tr>
              <td style="padding:10px 14px;font-weight:600;color:#475569;font-size:12px;
                         white-space:nowrap;vertical-align:top;">
                🕐 Submitted At
              </td>
              <td style="padding:10px 14px;color:#475569;font-size:12px;">
                ${now} (IST)
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ── FOOTER ── -->
      <tr>
        <td style="background:#0f172a;border:1px solid ${accent}22;border-top:none;
                   border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#334155;">
            Auto-generated by the Being India website chatbot. Do not reply to this email.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
  `.trim();
}

// ─── Plain-text Fallback ──────────────────────────────────────────────────────
function buildPlainText({ data, now, visitorIp }) {
  const trackingLines = [
    `IP Address    : ${visitorIp}`,
    `Device        : ${data._deviceType || 'Unknown'}`,
    `Traffic Source: ${data._trafficSource || 'Direct / None'}`,
    `Search Keyword: ${data._searchKeyword || 'N/A'}`,
    data._trafficMedium  ? `Medium        : ${data._trafficMedium}` : '',
    data._utmCampaign    ? `Campaign      : ${data._utmCampaign}` : '',
    `Page URL      : ${data._pageUrl || 'N/A'}`,
    `Referrer      : ${data._referrerUrl || 'Direct / None'}`,
  ].filter(Boolean);

  const formLines = Object.entries(data)
    .filter(([key]) => !SKIP_IN_FORM_TABLE.has(key))
    .map(([key, val]) => `${formatLabel(key).padEnd(20)}: ${val ?? '—'}`);

  return [
    `Being India — New ${data.category ?? 'General'} Enquiry`,
    `Received: ${now}`,
    '',
    '── VISITOR INTELLIGENCE ──',
    ...trackingLines,
    '',
    '── SUBMISSION DETAILS ──',
    ...formLines,
    `${'Submitted At'.padEnd(20)}: ${now} (IST)`,
    '',
    'Auto-generated by the Being India website chatbot.',
  ].join('\n');
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(request) {

  // Extract IP first (needed for rate limiting AND email)
  const visitorIp = extractIp(request);

  // Rate limit
  if (isRateLimited(visitorIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Parse body
  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  // Validate
  const validationErrors = validatePayload(data);
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: 'Validation failed.', details: validationErrors }, { status: 422 });
  }

  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  try {
    const transporter = getTransporter();
    const category    = data.category ?? 'General';
    const product     = data.product  ?? '';

    const emailOptions = {
      from:    `"Being Website Chatbot" <${process.env.EMAIL_USER}>`,
      to:      process.env.COMPANY_EMAIL,
      replyTo: data.email || undefined,
      subject: `[${category}]${product ? ` ${product} —` : ''} New Enquiry · ${visitorIp}`,
      text:    buildPlainText({ data, now, visitorIp }),
      html:    buildEmailHtml({ data, now, visitorIp }),
    };

    await transporter.sendMail(emailOptions);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error('[Chatbot API] Email failed:', err);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}