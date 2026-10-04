import { NextResponse } from "next/server";
import { z } from "zod";

import { escapeCorporateInquiryHtml } from "@/lib/corporate-inquiry";
import { notifyLeadInbox } from "@/lib/email";

const inquirySchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  hrContactName: z.string().trim().min(2).max(160),
  hrEmail: z.string().trim().email().max(254),
  hrPhone: z.string().trim().max(60).optional().default(""),
  numberOfEmployees: z.string().trim().max(40).optional().default(""),
  relocationTimeline: z.string().trim().max(80).optional().default(""),
  destinationMarkets: z.string().trim().max(300).optional().default(""),
  serviceType: z.string().trim().max(80).optional().default(""),
  additionalNotes: z.string().trim().max(4000).optional().default(""),
  pageUrl: z.string().trim().url().max(1000).optional(),
  website: z.string().max(0).optional().default(""),
  __top: z.coerce.number().nonnegative().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    if (typeof body.website === "string" && body.website.length > 0) {
      return NextResponse.json({ success: true });
    }

    const parsed = inquirySchema.safeParse({
      ...body,
      hrEmail: body.hrEmail || body.email,
      hrPhone: body.hrPhone || body.phone,
      numberOfEmployees: body.numberOfEmployees || body.employeeRange,
      destinationMarkets: body.destinationMarkets || body.destinationCities,
      additionalNotes: body.additionalNotes || body.message,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please check the required fields and try again." },
        { status: 400 },
      );
    }

    if (parsed.data.__top !== undefined && parsed.data.__top < 750) {
      return NextResponse.json({ success: true }, { status: 202 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Inquiry service is temporarily unavailable." },
        { status: 503 },
      );
    }

    const payload = parsed.data;
    const result = await notifyLeadInbox({
      replyTo: payload.hrEmail,
      subject: `Corporate relocation inquiry: ${singleLine(payload.companyName)}`,
      html: `
        <h2>New Corporate Relocation Inquiry</h2>
        <p><strong>Company:</strong> ${escapeCorporateInquiryHtml(payload.companyName)}</p>
        <p><strong>HR contact:</strong> ${escapeCorporateInquiryHtml(payload.hrContactName)}</p>
        <p><strong>Email:</strong> ${escapeCorporateInquiryHtml(payload.hrEmail)}</p>
        <p><strong>Phone:</strong> ${escapeCorporateInquiryHtml(payload.hrPhone || "Not provided")}</p>
        <p><strong>Employees:</strong> ${escapeCorporateInquiryHtml(payload.numberOfEmployees || "Not provided")}</p>
        <p><strong>Timeline:</strong> ${escapeCorporateInquiryHtml(payload.relocationTimeline || "Not provided")}</p>
        <p><strong>Destination markets:</strong> ${escapeCorporateInquiryHtml(payload.destinationMarkets || "Not provided")}</p>
        <p><strong>Service:</strong> ${escapeCorporateInquiryHtml(payload.serviceType || "Not provided")}</p>
        <p><strong>Page:</strong> ${escapeCorporateInquiryHtml(payload.pageUrl || "Not provided")}</p>
        <h3>Additional notes</h3>
        <p>${escapeCorporateInquiryHtml(payload.additionalNotes || "None").replace(/\n/g, "<br/>")}</p>
      `,
    });

    if (!result.success) {
      console.error("[corporate-inquiry] Notification failed", result.error);
      return NextResponse.json(
        { success: false, error: "We could not send the inquiry. Please call or email us directly." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[corporate-inquiry] Unexpected error", error);
    return NextResponse.json(
      { success: false, error: "Unable to process the inquiry." },
      { status: 500 },
    );
  }
}

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}
