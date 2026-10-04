import assert from 'node:assert/strict';
import { isServerRequestAuthorized } from '../server-route-auth';

function requestWith(headers: HeadersInit = {}): Request {
  return new Request('https://example.test/api/internal', { headers });
}

const noSecret = isServerRequestAuthorized(requestWith(), 'admin', {});
assert.equal(noSecret.configured, false);
assert.equal(noSecret.authorized, false);

const adminEnvironment = {
  ADMIN_API_SECRET: 'admin-secret',
  CRON_SECRET: 'cron-secret',
  ADMIN_BASIC_USERNAME: 'admin',
  ADMIN_BASIC_PASSWORD: 'basic-password',
};

assert.equal(
  isServerRequestAuthorized(
    requestWith({ Authorization: 'Bearer admin-secret' }),
    'admin',
    adminEnvironment,
  ).authorized,
  true,
);

assert.equal(
  isServerRequestAuthorized(
    requestWith({ 'x-admin-key': 'cron-secret' }),
    'admin',
    adminEnvironment,
  ).authorized,
  true,
);

assert.equal(
  isServerRequestAuthorized(
    requestWith({ Authorization: 'Bearer admin-secret' }),
    'cron',
    adminEnvironment,
  ).authorized,
  false,
);

assert.equal(
  isServerRequestAuthorized(
    requestWith({ Authorization: `Basic ${btoa('admin:basic-password')}` }),
    'admin',
    adminEnvironment,
  ).authorized,
  true,
);

assert.equal(
  isServerRequestAuthorized(
    requestWith({ 'x-cron-secret': 'cron-secret' }),
    'cron',
    adminEnvironment,
  ).authorized,
  true,
);

assert.equal(
  isServerRequestAuthorized(
    requestWith({ Authorization: 'Bearer wrong-secret' }),
    'admin',
    adminEnvironment,
  ).authorized,
  false,
);

console.log('serverRouteAuth: all assertions passed');
