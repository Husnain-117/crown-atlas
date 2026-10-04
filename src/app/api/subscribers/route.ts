import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { z } from 'zod';
import { sendEmail, notifyLeadInbox } from '@/lib/email';
import { ApiAuthMiddleware } from '@/lib/api-auth-middleware';
import { escapeContactHtml } from '@/lib/contact-inquiry';



export const dynamic = 'force-dynamic';

// Email subscriber interface
export interface EmailSubscriber {
  _id?: string;
  email: string;
  subscribedAt: Date;
  source: string;  // Where they subscribed from (footer, blog, etc.)
  status: 'active' | 'unsubscribed';
  ip?: string;
  userAgent?: string;
  city?: string;
  unsubscribeToken: string;
  updatedAt: Date;
}

// Validation schema
const SubscribeSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(254),
  source: z.string().trim().min(1).max(80).optional().default('footer'),
  city: z.string().trim().max(160).optional(),
  company: z.string().max(200).optional().default(''),
});

// POST - Subscribe a new email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body?.company === 'string' && body.company.trim()) {
      return NextResponse.json({ success: true }, { status: 202 });
    }
    const validatedData = SubscribeSchema.parse(body);
    
    const db = await getMongoDb();
    const collection = db.collection<EmailSubscriber>('email_subscribers');

    // Check if email already exists
    const existingSubscriber = await collection.findOne({ 
      email: validatedData.email.toLowerCase() 
    });

    if (existingSubscriber) {
      const unsubscribeToken = existingSubscriber.unsubscribeToken || crypto.randomUUID();

      // If already subscribed and active, return success
      if (existingSubscriber.status === 'active') {
        if (!existingSubscriber.unsubscribeToken) {
          await collection.updateOne(
            { _id: existingSubscriber._id },
            { $set: { unsubscribeToken, updatedAt: new Date() } },
          );
        }
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed!',
          alreadySubscribed: true,
        });
      }
      
      // If previously unsubscribed, reactivate
      await collection.updateOne(
        { email: validatedData.email.toLowerCase() },
        { 
          $set: { 
            status: 'active',
            updatedAt: new Date(),
            source: validatedData.source,
            unsubscribeToken,
          } 
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Welcome back! You have been re-subscribed.',
        resubscribed: true,
      });
    }

    // Create new subscriber
    const subscriber: Omit<EmailSubscriber, '_id'> = {
      email: validatedData.email.toLowerCase(),
      subscribedAt: new Date(),
      source: validatedData.source,
      status: 'active',
      city: validatedData.city,
      unsubscribeToken: crypto.randomUUID(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      updatedAt: new Date(),
    };

    await collection.insertOne(subscriber as EmailSubscriber);

    // Notify ALL admins about new subscriber
    const subscribedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const notification = await notifyLeadInbox({
      subject: `New Newsletter Subscriber — Crown Coastal Homes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #C5A46D, #D4B574); padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">New Newsletter Subscriber</h2>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
            <p style="font-size: 16px;"><strong>Email:</strong> ${escapeContactHtml(validatedData.email)}</p>
            <p style="font-size: 16px;"><strong>Source:</strong> ${escapeContactHtml(validatedData.source)}</p>
            <p style="font-size: 16px;"><strong>City:</strong> ${escapeContactHtml(validatedData.city || 'N/A')}</p>
            <p style="font-size: 16px;"><strong>Date (PST):</strong> ${escapeContactHtml(subscribedAt)}</p>
          </div>
        </div>
      `,
    });
    if (!notification.success) {
      console.error('Failed to send subscriber lead inbox notification:', notification.error);
      return NextResponse.json(
        { success: false, error: 'The subscription was saved, but the notification could not be delivered.' },
        { status: 502 },
      );
    }

    // Send welcome confirmation to subscriber
    const confirmation = await sendEmail({
      to: validatedData.email,
      subject: 'You\'re subscribed to Crown Coastal Homes!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #C5A46D, #D4B574); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Crown Coastal Homes!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Thank you for subscribing to our newsletter!</p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">You'll receive updates on the latest luxury property listings and California coastal real estate insights.</p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Best regards,<br><strong>The Crown Coastal Homes Team</strong></p>
            <p style="font-size: 12px; line-height: 1.5; color: #777; margin-top: 24px;">
              <a href="https://crowncoastalhomes.com/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}" style="color:#555;">Unsubscribe from market emails</a><br>
              Crown Coastal Homes, 702 Broadway, San Diego, CA 92101
            </p>
          </div>
        </div>
      `,
    });
    if (!confirmation.success) {
      console.error('Failed to send subscriber welcome email:', confirmation.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing!',
      subscribed: true,
    });

  } catch (error: any) {
    console.error('Subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Invalid email address',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to subscribe. Please try again.',
      },
      { status: 500 }
    );
  }
}

// GET - Get all subscribers (for admin purposes)
export async function GET(request: NextRequest) {
  const auth = await ApiAuthMiddleware.requireAuth(request, true);
  if (auth.error) return auth.error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');
    const status = searchParams.get('status') || 'active';

    const db = await getMongoDb();
    const collection = db.collection<EmailSubscriber>('email_subscribers');

    // Build query
    const query: any = {};
    if (status !== 'all') {
      query.status = status;
    }

    // Fetch subscribers
    const subscribers = await collection
      .find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const total = await collection.countDocuments(query);
    const activeCount = await collection.countDocuments({ status: 'active' });

    return NextResponse.json({
      success: true,
      data: subscribers,
      total,
      activeCount,
      limit,
      skip,
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch subscribers',
      },
      { status: 500 }
    );
  }
}

