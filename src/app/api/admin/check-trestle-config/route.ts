import { NextResponse } from 'next/server';
import { authorizeServerRequest } from '@/lib/server-route-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;

  const config = {
    hasApiId: !!process.env.TRESTLE_API_ID,
    hasApiPassword: !!process.env.TRESTLE_API_PASSWORD,
    hasBaseUrl: !!process.env.TRESTLE_BASE_URL,
    hasOAuthUrl: !!process.env.TRESTLE_OAUTH_URL,
    baseUrl: process.env.TRESTLE_BASE_URL || 'https://api-trestle.corelogic.com/trestle',
    oauthUrl: process.env.TRESTLE_OAUTH_URL || 'https://api-trestle.corelogic.com/trestle/oidc/connect/token',
    apiId: process.env.TRESTLE_API_ID ? '***SET***' : '***MISSING***',
    apiPassword: process.env.TRESTLE_API_PASSWORD ? '***SET***' : '***MISSING***',
  };

  // Try to test the connection
  let testResult = 'Not tested';
  try {
    if (config.hasApiId && config.hasApiPassword) {
      const { TrestleApiService } = await import('@/lib/trestle-service');
      const trestleService = new TrestleApiService({
        apiId: process.env.TRESTLE_API_ID!,
        apiPassword: process.env.TRESTLE_API_PASSWORD!,
        baseUrl: process.env.TRESTLE_BASE_URL || 'https://api-trestle.corelogic.com/trestle',
        oauthUrl: process.env.TRESTLE_OAUTH_URL || 'https://api-trestle.corelogic.com/trestle/oidc/connect/token'
      });
      
      const isConnected = await trestleService.testConnection();
      testResult = isConnected ? '✅ Connected' : '❌ Connection failed';
    } else {
      testResult = '❌ Cannot test - missing credentials';
    }
  } catch (error: any) {
    testResult = `❌ Error: ${error.message}`;
  }

  return NextResponse.json({
    config,
    testResult,
    recommendation: !config.hasApiId || !config.hasApiPassword 
      ? 'Add TRESTLE_API_ID and TRESTLE_API_PASSWORD to your .env.local file'
      : testResult.includes('✅') 
        ? 'Credentials configured correctly'
        : 'Check if credentials are valid and API is accessible'
  });
}
