import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import clientPromise from '../../library/mongodb';

export const runtime = 'nodejs';

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

const GST_REGEX   = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

// ─────────────────────────────────────────────────────────────────────────────
// NODEMAILER TRANSPORTER
// Created once outside the handler to reuse the SMTP connection pool.
// ─────────────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password — NOT your real password
  },
  pool: true,        // Keep connection alive and reuse it
  maxConnections: 3, // Max 3 parallel SMTP connections
});

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITER
// Prevents the same IP from spamming the form.
// Map: { "1.2.3.4": { count: 3, resetAt: 1234567890 } }
// ─────────────────────────────────────────────────────────────────────────────

const rateLimitStore  = new Map();
const RATE_LIMIT_MAX    = 5;               // Max 5 submissions
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // Per hour (ms)

function checkRateLimit(ip) {
  const now   = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

// Clean up expired entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, ip) => {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  });
}, 30 * 60 * 1000);

// ─────────────────────────────────────────────────────────────────────────────
// SANITIZE
// Strips HTML / escapes special chars to prevent XSS / email injection
// ─────────────────────────────────────────────────────────────────────────────

function sanitize(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;')
    .trim()
    .slice(0, 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// IP EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

function getIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return 'Unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL HTML BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildEmailHtml(formData, ip, submittedAt) {

  function row(label, value, highlight) {
    const bgColor    = highlight ? '#1e3a5f' : '#020617';
    const labelColor = '#94a3b8';
    const valueColor = highlight ? '#fbbf24' : '#e2e8f0';
    return (
      `<tr style="background:${bgColor};">` +
        `<td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;font-weight:700;color:${labelColor};white-space:nowrap;width:36%;vertical-align:top;">${label}</td>` +
        `<td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:${valueColor};word-break:break-word;font-weight:${highlight ? '700' : '400'};">${sanitize(value) || '<span style="color:#334155;">—</span>'}</td>` +
      `</tr>`
    );
  }

  function sectionHead(title, emoji) {
    return (
      `<tr>` +
        `<td colspan="2" style="padding:12px 16px 8px;background:#0f172a;border-bottom:1px solid #1e293b;border-top:2px solid #1e293b;">` +
          `<span style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#475569;">${emoji}  ${title}</span>` +
        `</td>` +
      `</tr>`
    );
  }

  const source      = formData._trafficSource || 'Direct';
  let   accentColor = '#22d3ee';
  if (/google/i.test(source))              accentColor = '#4285F4';
  if (/bing/i.test(source))               accentColor = '#008373';
  if (/facebook|instagram/i.test(source)) accentColor = '#1877F2';
  if (/direct/i.test(source))             accentColor = '#64748b';

  const device      = sanitize(formData._deviceType || 'Unknown');
  let   deviceColor = '#22d3ee';
  if (/mobile/i.test(device)) deviceColor = '#f59e0b';
  if (/tablet/i.test(device)) deviceColor = '#a78bfa';

  const kw      = formData._searchKeyword || '';
  const hasReal = kw && !/not provided/i.test(kw);
  const kwColor  = hasReal ? '#fbbf24' : '#475569';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Price Enquiry — ${sanitize(formData.product)}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

      <!-- HEADER -->
      <tr>
        <td style="background:${accentColor}18;border:1px solid ${accentColor}44;border-radius:12px 12px 0 0;padding:24px 28px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:${accentColor};">Being India — Price Enquiry</p>
          <h1 style="margin:0;font-size:22px;color:#f8fafc;font-weight:800;">${sanitize(formData.product)}</h1>
          ${formData.price ? `<p style="margin:6px 0 0;font-size:14px;color:#4ade80;font-weight:700;">₹ ${sanitize(formData.price)}</p>` : ''}
          <p style="margin:10px 0 0;font-size:11px;color:#475569;">Received: ${submittedAt}</p>
        </td>
      </tr>

      <!-- TABLE BODY -->
      <tr>
        <td style="background:#020617;border-left:1px solid ${accentColor}33;border-right:1px solid ${accentColor}33;padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

            ${sectionHead('Contact Details', '👤')}
            ${row('Full Name',    formData.name,        true)}
            ${row('Company',      formData.company,     false)}
            ${row('Designation',  formData.designation, false)}
            ${row('Department',   formData.department,  false)}
            ${row('Industry',     formData.industry,    false)}
            ${row('Phone',        '+91 ' + formData.phone, false)}
            ${row('Email',        formData.email,       false)}

            ${sectionHead('Business Info', '🏢')}
            ${formData.gstNumber ? row('GST Number', formData.gstNumber, false) : ''}
            ${row('City',    formData.city,  false)}
            ${row('State',   formData.state, false)}
            ${row('Country', 'India',        false)}

            ${formData.message
              ? sectionHead('Requirements / Message', '💬') +
                `<tr><td colspan="2" style="padding:14px 16px;background:#020617;border-bottom:1px solid #1e293b;font-size:13px;color:#cbd5e1;line-height:1.7;">${sanitize(formData.message)}</td></tr>`
              : ''}

            ${sectionHead('Visitor Intelligence', '📊')}

            <!-- IP -->
            <tr style="background:#020617;">
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;font-weight:700;color:#94a3b8;white-space:nowrap;width:36%;vertical-align:top;">🌐 IP Address</td>
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:#f87171;font-weight:700;font-family:monospace;">${sanitize(ip)}</td>
            </tr>

            <!-- Device -->
            <tr style="background:#020617;">
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;font-weight:700;color:#94a3b8;white-space:nowrap;vertical-align:top;">💻 Device</td>
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;">
                <span style="display:inline-block;background:${deviceColor}22;color:${deviceColor};border:1px solid ${deviceColor}55;border-radius:20px;padding:2px 12px;font-size:11px;font-weight:800;letter-spacing:.5px;">${device}</span>
              </td>
            </tr>

            <!-- Traffic Source -->
            <tr style="background:#020617;">
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;font-weight:700;color:#94a3b8;white-space:nowrap;vertical-align:top;">🔍 Traffic Source</td>
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;">
                <span style="display:inline-block;background:${accentColor}22;color:${accentColor};border:1px solid ${accentColor}55;border-radius:20px;padding:2px 12px;font-size:11px;font-weight:800;letter-spacing:.5px;">${sanitize(source)}</span>
              </td>
            </tr>

            <!-- Search Keyword -->
            <tr style="background:#020617;">
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;font-weight:700;color:#94a3b8;white-space:nowrap;vertical-align:top;">🔑 Search Keyword</td>
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:${kwColor};font-weight:${hasReal ? '700' : '400'};">
                ${kw ? sanitize(kw) : '<span style="color:#334155;font-style:italic;">Not available</span>'}
              </td>
            </tr>

            ${formData._utmCampaign ? row('📢 Campaign', formData._utmCampaign, false) : ''}
            ${formData._utmMedium   ? row('📡 Medium',   formData._utmMedium,   false) : ''}

            <!-- Page URL -->
            <tr style="background:#020617;">
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;font-weight:700;color:#94a3b8;white-space:nowrap;vertical-align:top;">📄 Page URL</td>
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:12px;word-break:break-all;">
                ${formData._pageUrl
                  ? `<a href="${sanitize(formData._pageUrl)}" style="color:#38bdf8;text-decoration:none;">${sanitize(formData._pageUrl)}</a>`
                  : '<span style="color:#334155;">—</span>'}
              </td>
            </tr>

            <!-- Referrer -->
            <tr style="background:#020617;">
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:13px;font-weight:700;color:#94a3b8;white-space:nowrap;vertical-align:top;">🔗 Referrer</td>
              <td style="padding:11px 16px;border-bottom:1px solid #1e293b;font-size:12px;word-break:break-all;color:#64748b;">
                ${formData._referrerUrl && formData._referrerUrl !== 'Direct / None'
                  ? `<a href="${sanitize(formData._referrerUrl)}" style="color:#64748b;text-decoration:none;">${sanitize(formData._referrerUrl)}</a>`
                  : '<span style="color:#334155;font-style:italic;">Direct / None</span>'}
              </td>
            </tr>

            <!-- User Agent -->
            <tr style="background:#020617;">
              <td style="padding:9px 16px;font-size:11px;font-weight:600;color:#334155;white-space:nowrap;vertical-align:top;">🖥️ User Agent</td>
              <td style="padding:9px 16px;font-size:10px;color:#334155;word-break:break-all;font-family:monospace;">${sanitize(formData._userAgent || '')}</td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#0f172a;border:1px solid ${accentColor}22;border-top:none;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#334155;">Auto-generated from the Being India website. Do not reply to this email.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAIN TEXT FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

function buildPlainText(formData, ip, submittedAt) {
  const lines = [
    'Being India — New Price Enquiry',
    'Received: ' + submittedAt,
    '',
    '── PRODUCT ─────────────────────────',
    'Product       : ' + (formData.product || '—'),
    'Price         : ' + (formData.price ? '₹ ' + formData.price : '—'),
    '',
    '── CONTACT DETAILS ─────────────────',
    'Name          : ' + (formData.name        || '—'),
    'Company       : ' + (formData.company     || '—'),
    'Designation   : ' + (formData.designation || '—'),
    'Department    : ' + (formData.department  || '—'),
    'Industry      : ' + (formData.industry    || '—'),
    'Phone         : +91 ' + (formData.phone   || '—'),
    'Email         : ' + (formData.email       || '—'),
    '',
    '── BUSINESS INFO ───────────────────',
    'GST Number    : ' + (formData.gstNumber   || '—'),
    'City          : ' + (formData.city        || '—'),
    'State         : ' + (formData.state       || '—'),
    'Country       : India',
    '',
    ...(formData.message ? ['── MESSAGE ─────────────────────────', formData.message, ''] : []),
    '── VISITOR INTELLIGENCE ────────────',
    'IP Address    : ' + ip,
    'Device        : ' + (formData._deviceType    || '—'),
    'Traffic Source: ' + (formData._trafficSource || '—'),
    'Search Keyword: ' + (formData._searchKeyword || '—'),
    'UTM Medium    : ' + (formData._utmMedium     || '—'),
    'UTM Campaign  : ' + (formData._utmCampaign   || '—'),
    'Page URL      : ' + (formData._pageUrl       || '—'),
    'Referrer      : ' + (formData._referrerUrl   || '—'),
    '',
    'Auto-generated from the Being India website.',
  ];
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN POST HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request) {

  // ── 1. Extract IP ──
  const ip = getIp(request);

  // ── 2. Rate limit ──
  if (checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in an hour.' },
      { status: 429 }
    );
  }

  // ── 3. Parse body ──
  let formData;
  try {
    formData = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body. Expected JSON.' }, { status: 400 });
  }

  // ── 4. Shape check ──
  if (!formData || typeof formData !== 'object') {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  // ── 5. Honeypot ──
  if (formData.website || formData.honeypot) {
    return NextResponse.json({ error: 'Spam detected.' }, { status: 400 });
  }

  // ── 6. Server-side validation ──

  if (!formData.name?.trim())
    return NextResponse.json({ error: 'Name is required.' }, { status: 422 });

  if (!formData.company?.trim())
    return NextResponse.json({ error: 'Company is required.' }, { status: 422 });

  // GST is optional — only validate format if provided
  if (formData.gstNumber && !GST_REGEX.test(formData.gstNumber))
    return NextResponse.json({ error: 'Invalid GST number format.' }, { status: 422 });

  if (!formData.industry?.trim())
    return NextResponse.json({ error: 'Industry is required.' }, { status: 422 });

  if (!formData.designation?.trim())
    return NextResponse.json({ error: 'Designation is required.' }, { status: 422 });

  if (!formData.department?.trim())
    return NextResponse.json({ error: 'Department is required.' }, { status: 422 });

  if (!PHONE_REGEX.test(formData.phone))
    return NextResponse.json({ error: 'Phone must be exactly 10 digits.' }, { status: 422 });

  // Single email field — personal or official, user chooses
  if (!EMAIL_REGEX.test(formData.email))
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 422 });

  if (!formData.state?.trim())
    return NextResponse.json({ error: 'State is required.' }, { status: 422 });

  if (!formData.city?.trim())
    return NextResponse.json({ error: 'City is required.' }, { status: 422 });

  // ── 7. Timestamp ──
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // ── 8. Save to MongoDB ──
  let dbInsertedId = null;

  try {
    const client = await clientPromise;
    const db     = client.db('BeingDB');

    const dbDoc = {
      // Lead metadata
      leadType:    'Price Enquiry',
      leadSource:  'Website',
      status:      'New',
      priority:    'Normal',
      assignedTo:   null,
      followUpDate: null,
      isContacted:  false,

      // Product
      product: formData.product || null,
      price:   formData.price   || null,

      // Customer details
      name:        formData.name,
      company:     formData.company,
      gstNumber:   formData.gstNumber   || null,
      industry:    formData.industry    || null,
      designation: formData.designation || null,
      department:  formData.department  || null,
      phone:       formData.phone,
      email:       formData.email,         // single email field
      state:       formData.state         || null,
      city:        formData.city          || null,
      message:     formData.message       || null,

      // Tracking
      tracking: {
        ip:            ip,
        deviceType:    formData._deviceType    || null,
        referrer:      formData._referrerUrl   || null,
        pageUrl:       formData._pageUrl       || null,
        trafficSource: formData._trafficSource || null,
        searchKeyword: formData._searchKeyword || null,
        utmSource:     formData._trafficSource || null,
        utmMedium:     formData._utmMedium     || null,
        utmCampaign:   formData._utmCampaign   || null,
        userAgent:     formData._userAgent     || null,
      },

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dbResult = await db.collection('productPriceEnquiries').insertOne(dbDoc);
    dbInsertedId   = dbResult.insertedId;
    console.log('[PriceEnquiry] Saved to DB:', dbInsertedId);

  } catch (dbError) {
    // DB failure is logged but does NOT block the email.
    // You still receive the lead even if MongoDB is down.
    console.error('[PriceEnquiry] DB save failed:', dbError);
  }

  // ── 9. Send Email ──
  try {
    const emailHtml = buildEmailHtml(formData, ip, submittedAt);
    const emailText = buildPlainText(formData, ip, submittedAt);
    const subject   = `[Price Enquiry] ${formData.product || 'New Lead'} — ${ip}`;

    await transporter.sendMail({
      from:    `"Being India Website" <${process.env.EMAIL_USER}>`,
      to:      process.env.COMPANY_EMAIL,
      replyTo: formData.email, // Reply in Gmail opens the customer's email directly
      subject,
      text:    emailText,
      html:    emailHtml,
    });

    console.log('[PriceEnquiry] Email sent for:', formData.product);

  } catch (emailError) {
    console.error('[PriceEnquiry] Email failed:', emailError);
    return NextResponse.json(
      { error: 'Failed to send confirmation email. Please try again.' },
      { status: 500 }
    );
  }

  // ── 10. Success ──
  return NextResponse.json(
    { success: true, insertedId: dbInsertedId ? dbInsertedId.toString() : null },
    { status: 200 }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK ALL OTHER HTTP METHODS
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}