import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/neighborhood?lat={lat}&lng={lng}&zip={zip}
 * Aggregates Walk Score, transit score, bike score, and school ratings
 * for a given location. Caches aggressively (24h) since neighborhood data changes rarely.
 */

interface School {
  name: string;
  level: string;
  rating: number;
  type: string;
  dist: number;
}

interface NeighborhoodData {
  walkScore: number | null;
  walkDesc: string | null;
  transitScore: number | null;
  bikeScore: number | null;
  schools: School[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zip = searchParams.get('zip');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lng' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid lat/lng values' },
        { status: 400 }
      );
    }

    // Fetch Walk Score data
    let walkData: any = {};
    const walkScoreKey = process.env.WALKSCORE_API_KEY;
    
    if (walkScoreKey) {
      try {
        const walkRes = await fetch(
          `https://api.walkscore.com/score?format=json&lat=${latitude}&lon=${longitude}&wsapikey=${walkScoreKey}`,
          { next: { revalidate: 86400 } } // 24 hour cache
        );
        
        if (walkRes.ok) {
          walkData = await walkRes.json();
        }
      } catch (error) {
        console.error('Walk Score API error:', error);
        // Continue with partial data
      }
    }

    // Fetch GreatSchools data
    let schoolsData: any[] = [];
    const greatSchoolsKey = process.env.GREATSCHOOLS_API_KEY;
    
    if (greatSchoolsKey && zip) {
      try {
        const schoolRes = await fetch(
          `https://api.greatschools.org/schools/nearby?key=${greatSchoolsKey}&zip=${zip}&limit=5&levelCode=e,m,h`,
          { next: { revalidate: 86400 } }
        );
        
        if (schoolRes.ok) {
          const schoolJson = await schoolRes.json();
          schoolsData = schoolJson.schools || [];
        }
      } catch (error) {
        console.error('GreatSchools API error:', error);
        // Continue with partial data
      }
    }

    // Build response payload
    const payload: NeighborhoodData = {
      walkScore: walkData.walkscore ?? null,
      walkDesc: walkData.description ?? null,
      transitScore: walkData.transit?.score ?? null,
      bikeScore: walkData.bike?.score ?? null,
      schools: schoolsData.map((s: any) => ({
        name: s.name || 'Unknown School',
        level: s.levelCode || 'unknown',
        rating: s.rating || 0,
        type: s.type || 'public',
        dist: s.distance || 0,
      })),
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error fetching neighborhood data:', error);
    
    // Return partial data on error (graceful degradation)
    return NextResponse.json(
      {
        walkScore: null,
        walkDesc: null,
        transitScore: null,
        bikeScore: null,
        schools: [],
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=300' },
      }
    );
  }
}
