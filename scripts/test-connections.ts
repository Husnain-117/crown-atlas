/**
 * scripts/test-connections.ts
 *
 * Standalone CLI that exercises every external service used by the platform
 * and prints a colour-coded report.  Uses raw drivers (no Cloud SQL Connector)
 * so it also works from a developer laptop.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/test-connections.ts
 *
 * Or via the npm script:
 *   npm run test:connections
 *
 * The script exits with code 0 when all configured services pass and code 1
 * when any critical or non-skip test fails.
 *
 * Env vars are loaded from .env.local automatically (falls back to .env).
 */

// Load env FIRST before any imports that read process.env at module init time
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: false });
dotenv.config({ path: path.resolve(process.cwd(), ".env"),       override: false });

import {
  runAllConnectionTests,
  type TestResult,
  type ConnectionTestReport,
  type OverallHealth,
  type TestStatus,
} from "../src/lib/connection-test-runner";

// ─────────────────────────────────────────────────────────────────────────────
// Terminal colour helpers (ANSI — work in Node, PowerShell, WSL, macOS)
// ─────────────────────────────────────────────────────────────────────────────

const NO_COLOUR = process.env.NO_COLOR === "1" || process.env.NO_COLOR === "true";

const c = {
  reset:   (s: string) => NO_COLOUR ? s : `\x1b[0m${s}\x1b[0m`,
  bold:    (s: string) => NO_COLOUR ? s : `\x1b[1m${s}\x1b[0m`,
  dim:     (s: string) => NO_COLOUR ? s : `\x1b[2m${s}\x1b[0m`,
  green:   (s: string) => NO_COLOUR ? s : `\x1b[32m${s}\x1b[0m`,
  yellow:  (s: string) => NO_COLOUR ? s : `\x1b[33m${s}\x1b[0m`,
  red:     (s: string) => NO_COLOUR ? s : `\x1b[31m${s}\x1b[0m`,
  cyan:    (s: string) => NO_COLOUR ? s : `\x1b[36m${s}\x1b[0m`,
  magenta: (s: string) => NO_COLOUR ? s : `\x1b[35m${s}\x1b[0m`,
  blue:    (s: string) => NO_COLOUR ? s : `\x1b[34m${s}\x1b[0m`,
  white:   (s: string) => NO_COLOUR ? s : `\x1b[97m${s}\x1b[0m`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Status icons & formatting
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<TestStatus, string> = {
  pass: "✅",
  fail: "❌",
  warn: "⚠️ ",
  skip: "⏭️ ",
};

const STATUS_LABEL: Record<TestStatus, (s: string) => string> = {
  pass: (s) => c.green(s),
  fail: (s) => c.red(s),
  warn: (s) => c.yellow(s),
  skip: (s) => c.dim(s),
};

const OVERALL_ICON: Record<OverallHealth, string> = {
  healthy:  "🟢",
  degraded: "🟡",
  critical: "🔴",
};

const CATEGORY_LABEL: Record<TestResult["category"], string> = {
  redis:       "Redis       ",
  postgresql:  "PostgreSQL  ",
  email:       "Email (SMTP)",
  environment: "Environment ",
};

function hr(char = "─", width = 70): string {
  return c.dim(char.repeat(width));
}

function padRight(s: string, n: number): string {
  // Account for unicode width of emoji (approx)
  const visible = s.replace(/\x1b\[[0-9;]*m/g, "");
  return s + " ".repeat(Math.max(0, n - visible.length));
}

function formatLatency(ms: number): string {
  if (ms < 10)   return c.green(`${ms}ms`);
  if (ms < 500)  return c.green(`${ms}ms`);
  if (ms < 2000) return c.yellow(`${ms}ms`);
  return c.red(`${ms}ms`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────────────────────

function renderReport(report: ConnectionTestReport): void {
  const { timestamp, environment, overall, summary, tests, durationMs } = report;

  console.log();
  console.log(c.bold(c.white("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")));
  console.log(c.bold(c.cyan("  Crown Coastal Homes — Connection Test Suite")));
  console.log(c.bold(c.white("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")));
  console.log(`  ${c.dim("Ran:")}     ${timestamp}`);
  console.log(`  ${c.dim("Env:")}     ${environment}`);
  console.log(`  ${c.dim("Total:")}   ${durationMs}ms wall clock`);
  console.log();

  // Group tests by category
  const groups = new Map<string, TestResult[]>();
  for (const t of tests) {
    const cat = t.category;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(t);
  }

  for (const [cat, catTests] of groups) {
    const catLabel = CATEGORY_LABEL[cat as TestResult["category"]] ?? cat.padEnd(12);
    const allPass  = catTests.every((t) => t.status === "pass" || t.status === "skip");
    const anyFail  = catTests.some((t) => t.status === "fail");
    const catIcon  = anyFail ? "❌" : allPass ? "✅" : "⚠️ ";

    console.log(hr());
    console.log(
      `  ${catIcon}  ${c.bold(catLabel)}`
    );
    console.log();

    for (const test of catTests) {
      const icon    = STATUS_ICON[test.status];
      const label   = STATUS_LABEL[test.status](test.status.toUpperCase().padEnd(4));
      const latency = test.status !== "skip" ? ` ${formatLatency(test.latencyMs)}` : "";
      const name    = padRight(test.name, 44);

      console.log(`    ${icon}  ${label}  ${c.white(name)}${latency}`);
      console.log(`          ${c.dim(test.message)}`);

      // Show structured data for failures and warnings
      if ((test.status === "fail" || test.status === "warn") && test.data) {
        for (const [key, val] of Object.entries(test.data)) {
          if (val !== null && val !== undefined && val !== "") {
            const valStr = typeof val === "object" ? JSON.stringify(val, null, 2) : String(val);
            const preview = valStr.length > 80 ? valStr.slice(0, 77) + "…" : valStr;
            console.log(`          ${c.dim(`  ${key}:`)} ${preview}`);
          }
        }
      }
      console.log();
    }
  }

  // ── Summary bar ──────────────────────────────────────────────────────────
  console.log(hr("━"));
  const overallIcon  = OVERALL_ICON[overall];
  const overallColor =
    overall === "healthy"  ? c.green :
    overall === "degraded" ? c.yellow :
                             c.red;

  console.log(
    `  ${overallIcon}  Overall: ${c.bold(overallColor(overall.toUpperCase()))}` +
    `   ${c.green(`✅ ${summary.pass} passed`)}` +
    (summary.fail ? `  ${c.red(`❌ ${summary.fail} failed`)}` : "") +
    (summary.warn ? `  ${c.yellow(`⚠️  ${summary.warn} warned`)}` : "") +
    (summary.skip ? `  ${c.dim(`⏭️  ${summary.skip} skipped`)}` : "")
  );
  console.log(hr("━"));
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(c.dim("\nRunning connection tests…"));

  let report: ConnectionTestReport;
  try {
    report = await runAllConnectionTests();
  } catch (err) {
    console.error(c.red("\nFatal error in connection test runner:"));
    console.error(err);
    process.exit(1);
  }

  renderReport(report);

  // If any non-skip test failed → exit 1 for CI / scripting
  const hasFail = report.tests.some((t) => t.status === "fail");
  process.exit(hasFail ? 1 : 0);
}

main().catch((err) => {
  console.error(c.red("\nUnhandled error:"), err);
  process.exit(1);
});
