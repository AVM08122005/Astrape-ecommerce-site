import dbConnect from "@/lib/mongoose";
import RequestModel from "@/models/Request";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { itemId, vendorEmail, vendorId, date, time, expectedGuests, message } = body;

    if (!itemId || !vendorEmail || !date || !time) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    const record = await RequestModel.create({ itemId, vendorEmail, vendorId, date, time, expectedGuests, message });

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const mail = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: vendorEmail || process.env.DEMO_INBOX || process.env.EMAIL_USER,
      subject: `New quote request for item ${itemId}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Item ID:</strong> ${itemId}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Expected Guests:</strong> ${expectedGuests || 0}</p>
        <p><strong>Message:</strong> ${message || ''}</p>
        <p>View item: <a href="${siteUrl}/items/${itemId}">${siteUrl}/items/${itemId}</a></p>
      `
    };

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mail);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Email error', e);
    }

    return new Response(JSON.stringify({ message: 'Request saved', request: record }), { status: 201 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('POST /api/requests error:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}


