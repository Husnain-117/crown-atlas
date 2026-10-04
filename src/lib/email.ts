import { Resend } from 'resend'
import type { ReactElement } from 'react'
import { CONTACT } from '@/lib/constants/contact'
import { captureOperationalError } from '@/lib/observability'

/** Website notifications go to the business inboxes and the owner's private copy. */
export const LEAD_NOTIFICATION_EMAIL = CONTACT.email.display
export const ADMIN_EMAILS: string[] = [
  LEAD_NOTIFICATION_EMAIL,
  'reza@crowncoastalhomes.com',
  'djelveh.m@googlemail.com',
]

// Resend sends website mail; Purelymail hosts the receiving mailboxes.
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  `Crown Coastal Homes <${CONTACT.email.display}>`

let resendClient: Resend | null = null

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY is not configured')
    throw new Error('Email service is not configured — RESEND_API_KEY missing')
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

interface SendEmailBaseParams {
  to: string | string[]
  subject: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string
    contentType?: string
  }>
}

export type SendEmailParams = SendEmailBaseParams & (
  | { html: string; react?: never }
  | { html?: never; react: ReactElement }
)

/**
 * Send an email using Resend.
 * Logs success/failure with full error details.
 */
export async function sendEmail({ to, subject, html, react, text, replyTo, attachments }: SendEmailParams) {
  try {
    const toAddresses = (Array.isArray(to) ? to : [to])
      .map(email => typeof email === 'string' ? email.trim() : '')
      .filter(Boolean)

    if (toAddresses.length === 0) {
      console.warn('[email] ⚠️ No valid recipient email addresses provided. Skipping send.');
      return { success: false, error: 'No valid recipients' }
    }

    // Never silently redirect customer confirmations or drop notification recipients.
    const isSandbox = FROM_EMAIL.includes('onboarding@resend.dev')
    if (isSandbox) {
      throw new Error('Configure a verified RESEND_FROM_EMAIL before sending website mail')
    }
    const finalTo = toAddresses

    console.log(`[email] Sending "${subject}" → ${finalTo.join(', ')}`)
    console.log(`[email] FROM: ${FROM_EMAIL}`)

    const payload: any = {
      from: FROM_EMAIL,
      to: finalTo,
      subject,
    }

    if (html) payload.html = html
    if (react) payload.react = react
    if (text) payload.text = text
    if (attachments?.length) payload.attachments = attachments

    payload.replyTo = replyTo || CONTACT.email.display

    const result = await getResendClient().emails.send(payload)

    if ((result as any).error) {
      console.error('[email] Resend returned error:', (result as any).error)
      captureOperationalError((result as any).error, 'email.resend', {
        recipientCount: finalTo.length,
        sandbox: isSandbox,
      })
      return { success: false, error: (result as any).error }
    }

    console.log('[email] Sent successfully. ID:', (result as any).data?.id || result)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('[email] Exception while sending:', error?.message || error)
    captureOperationalError(error, 'email.send', {
      configured: Boolean(process.env.RESEND_API_KEY),
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

/**
 * Send a website form notification to all configured lead inboxes.
 */
export async function notifyLeadInbox({
  subject,
  html,
  replyTo,
}: {
  subject: string
  html: string
  replyTo?: string
}) {
  return sendEmail({ to: ADMIN_EMAILS, subject, html, replyTo })
}
