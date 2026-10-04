/**
 * Empty stub for Next.js polyfill module when targeting modern browsers only.
 * Used via webpack alias to drop ~12 KiB legacy polyfills (Array.at, Object.hasOwn, etc.)
 * in builds that target Chrome 92+, Safari 15.4+, etc.
 */
export {};
