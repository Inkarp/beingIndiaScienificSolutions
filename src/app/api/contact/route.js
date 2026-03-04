import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import clientPromise from "../../library/mongodb";

export const runtime = "nodejs";

const COMPANY_EMAIL = process.env.COMPANY_EMAIL;

/* ================= EMAIL TRANSPORT ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= HELPERS ================= */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:8px;color:#94a3b8;width:40%;">${escapeHtml(label)}</td>
      <td style="padding:8px;color:#f8fafc;">${escapeHtml(value)}</td>
    </tr>
  `;
}

/* ================= POST ================= */

export async function POST(request) {
  try {
    const formData = await request.json();

    const {
      name,
      company,
      industry,
      designation,
      department,
      email,
      // officialEmail,
      phone,
      typeOfCustomer,
      purchasePlan,
      state,
      city,
      message,
      ipAddress,
      referrer,
      source,
      deviceType,
      keyword,
      timestamp,
    } = formData;

    /* ================= VALIDATION ================= */

    if (
      !name ||
      !company ||
      !industry ||
      !designation ||
      !department ||
      !email ||
      // !officialEmail ||
      !phone ||
      !typeOfCustomer ||
      !purchasePlan ||
      !state ||
      !city
    ) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Phone must be 10 digits" },
        { status: 400 }
      );
    }

    if (!COMPANY_EMAIL || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: "Email environment variables not configured" },
        { status: 500 }
      );
    }

    /* ================= SAVE TO DATABASE ================= */

    const client = await clientPromise;
    const db = client.db("BeingDB");

    const dbResult = await db.collection("contactEnquiries").insertOne({
      name,
      company,
      industry,
      designation,
      department,
      email,
      // officialEmail,
      phone,
      typeOfCustomer,
      purchasePlan,
      state,
      city,
      message,
      ipAddress,
      referrer,
      source,
      deviceType,
      keyword,
      timestamp: timestamp || new Date(),
      createdAt: new Date(),
      status: "New",
    });

    /* ================= MAIL TEMPLATE ================= */

    const mailOptions = {
      from: `"Website Enquiry" <${process.env.EMAIL_USER}>`,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `New Enquiry | ${name} | ${company}`,
      html: `
        <div style="font-family:Arial;max-width:650px;margin:auto;background:#0f172a;padding:30px;border-radius:16px;">
          
          <h2 style="color:#f97316;margin-bottom:20px;">
            New Website Enquiry
          </h2>

          <table style="width:100%;background:#020617;border-radius:10px;border-collapse:collapse;">
            ${row("Name", name)}
            ${row("Company", company)}
            ${row("Industry", industry)}
            ${row("Designation", designation)}
            ${row("Department", department)}
            ${row("Personal Email", email)}
       
            ${row("Phone", `+91 ${phone}`)}
            ${row("Type of Customer", typeOfCustomer)}
            ${row("Purchase Plan", purchasePlan)}
            ${row("Country", "India")}
            ${row("State", state)}
            ${row("City", city)}

           ${row("IP Address", ipAddress || "N/A")}
           ${row("Referrer", referrer || "N/A")}
           ${row("Source", source || "N/A")}
           ${row("Device Type", deviceType || "N/A")}
           ${row("Keyword", keyword || "N/A")}
            ${row("Timestamp", new Date(timestamp).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))}  
          
      })}
          </table>

          <div style="margin-top:20px;background:#1e293b;padding:15px;border-radius:10px;">
            <h4 style="color:#ffffff;margin-bottom:8px;">Message</h4>
            <p style="color:#cbd5e1;line-height:1.6;">
              ${(escapeHtml(message || "No message")).replace(/\n/g, "<br/>")}
            </p>
          </div>

        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, id: dbResult.insertedId },
      { status: 200 }
    );

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}