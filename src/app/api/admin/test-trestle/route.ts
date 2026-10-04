import { NextResponse } from 'next/server';
import { authorizeServerRequest } from '@/lib/server-route-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;

  try {
    console.log('Testing Trestle API connection...');
    
    // First test: Get token
    const tokenUrl = process.env.TRESTLE_OAUTH_URL || 'https://api-trestle.corelogic.com/trestle/oidc/connect/token';
    const apiId = process.env.TRESTLE_API_ID;
    const apiPassword = process.env.TRESTLE_API_PASSWORD;
    
    console.log('Environment check:');
    console.log('- TRESTLE_API_ID exists:', !!apiId);
    console.log('- TRESTLE_API_PASSWORD exists:', !!apiPassword);
    console.log('- Token URL:', tokenUrl);
    
    if (!apiId || !apiPassword) {
      return NextResponse.json({
        error: 'Missing credentials',
        details: {
          hasApiId: !!apiId,
          hasApiPassword: !!apiPassword,
          tokenUrl
        }
      });
    }
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiId,
        client_secret: apiPassword,
        scope: 'api',
      }),
    });
    
    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      console.error('Trestle token request failed:', tokenResponse.status);
      return NextResponse.json({
        error: 'Failed to get token',
        status: tokenResponse.status,
        statusText: tokenResponse.statusText
      });
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Token received successfully');
    
    // Second test: Make a simple API call
    const baseUrl = process.env.TRESTLE_BASE_URL || 'https://api-trestle.corelogic.com/trestle';
    const testUrl = `${baseUrl}/odata/Property?$top=1&$select=ListingKey`;
    
    console.log('Testing API call to:', testUrl);
    
    const apiResponse = await fetch(testUrl, {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      },
    });
    
    console.log('API response status:', apiResponse.status);
    
    if (!apiResponse.ok) {
      console.error('Trestle API request failed:', apiResponse.status);
      return NextResponse.json({
        error: 'API call failed',
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        url: testUrl
      });
    }
    
    const apiData = await apiResponse.json();
    console.log('API call successful');
    
    return NextResponse.json({
      success: true,
      token: {
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      },
      api: {
        hasData: apiData.value && apiData.value.length > 0,
        count: apiData.value?.length || 0,
        sampleProperty: apiData.value?.[0]?.ListingKey || null
      }
    });
    
  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
