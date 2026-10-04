import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const tracesSampleRate = Number(
  process.env.SENTRY_TRACES_SAMPLE_RATE ||
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ||
    (process.env.NODE_ENV === "development" ? "1.0" : "0.1")
);

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate,
    enableLogs: true,
    sendDefaultPii: false,
  });
}