import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const FORECAST_SERVICE_URL = process.env.FORECAST_SERVICE_URL || 'http://127.0.0.1:8000';

// Fallback centroid coordinate lookup for key clusters if microservice is offline
const CLUSTER_COORDS = {
  '873cf2882ffffff': { lat: 22.6482, lng: 88.4408, name: 'Dum Dum / North 24 Parganas' },
  '873cf2c6cffffff': { lat: 22.5814, lng: 88.4228, name: 'Salt Lake Sector V' },
  '873cf2c69ffffff': { lat: 22.5731, lng: 88.4649, name: 'New Town Action Area I' },
  '873cf2d5dffffff': { lat: 22.5910, lng: 88.3145, name: 'Howrah Central' },
  '873cf2c73ffffff': { lat: 22.5006, lng: 88.3567, name: 'South Kolkata (Gariahat)' },
  '873cf2890ffffff': { lat: 22.6189, lng: 88.4107, name: 'Kestopur / Baguiati' },
  '873cf2885ffffff': { lat: 22.6927, lng: 88.4528, name: 'Madhyamgram' },
  '873cf28abffffff': { lat: 22.7066, lng: 88.5009, name: 'Barasat' },
  '873cf2851ffffff': { lat: 22.8304, lng: 88.6454, name: 'Habra Corridor' }
};

// Generates regular hexagon vertices around a centroid if boundary is not provided
function generateHexagonVertices(lat, lng, radiusKm = 1.22) {
  const dLat = radiusKm / 111.0;
  const dLng = radiusKm / (111.0 * Math.cos(lat * (Math.PI / 180)));
  const vertices = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + (Math.PI / 6);
    vertices.push([
      lat + dLat * Math.sin(angle),
      lng + dLng * Math.cos(angle)
    ]);
  }
  return vertices;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get('serviceId') || '';
  const targetDate = searchParams.get('targetDate') || '';
  const h3Index = searchParams.get('h3Index') || '';

  // 1. Attempt to fetch from independent FastAPI Python service
  try {
    const params = new URLSearchParams();
    if (serviceId) params.set('serviceId', serviceId);
    if (targetDate) params.set('targetDate', targetDate);
    if (h3Index) params.set('h3Index', h3Index);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${FORECAST_SERVICE_URL}/forecast?${params.toString()}`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, source: 'fastapi_ml_service', ...data });
    }
  } catch (err) {
    console.warn('FastAPI forecast service warning:', err.message);
  }

  // 2. Resilient Database Fallback: Read directly from Neon DemandForecast using raw SQL
  try {
    let sqlQuery = `
      SELECT 
        df.id::text,
        df."h3Index",
        df."serviceId"::text,
        s.name AS "serviceName",
        df."forecastDate"::text,
        df."timeSlot",
        df."predictedDemand",
        df.confidence,
        df."lowerBound",
        df."upperBound",
        df."modelVersion"
      FROM "DemandForecast" df
      JOIN "Service" s ON df."serviceId" = s.id
      WHERE 1=1
    `;
    const sqlParams = [];
    if (serviceId) {
      sqlParams.push(serviceId);
      sqlQuery += ` AND df."serviceId" = $${sqlParams.length}::uuid`;
    }
    if (h3Index) {
      sqlParams.push(h3Index);
      sqlQuery += ` AND df."h3Index" = $${sqlParams.length}`;
    }
    if (targetDate) {
      sqlParams.push(targetDate);
      sqlQuery += ` AND df."forecastDate" = $${sqlParams.length}::date`;
    }
    sqlQuery += ` ORDER BY df."predictedDemand" DESC, df."forecastDate" ASC LIMIT 200;`;

    const rawRows = await prisma.$queryRawUnsafe(sqlQuery, ...sqlParams);

    // Augment with spatial boundary coordinates
    const enriched = (rawRows || []).map((f) => {
      const cluster = CLUSTER_COORDS[f.h3Index] || { lat: 22.5726, lng: 88.3639, name: 'Urban Cluster' };
      const boundary = generateHexagonVertices(cluster.lat, cluster.lng);

      const pred = Number(f.predictedDemand) || 0;
      let demandLevel = 'LOW';
      if (pred >= 8.0) demandLevel = 'SURGE';
      else if (pred >= 5.0) demandLevel = 'HIGH';
      else if (pred >= 2.5) demandLevel = 'MODERATE';

      return {
        id: f.id,
        h3Index: f.h3Index,
        serviceId: f.serviceId,
        serviceName: f.serviceName || 'Home Service',
        forecastDate: f.forecastDate,
        timeSlot: f.timeSlot,
        predictedDemand: Math.round(pred * 100) / 100,
        confidence: f.confidence ? Math.round(Number(f.confidence) * 1000) / 1000 : 0.85,
        lowerBound: f.lowerBound ? Math.round(Number(f.lowerBound) * 100) / 100 : Math.max(0, pred - 1.5),
        upperBound: f.upperBound ? Math.round(Number(f.upperBound) * 100) / 100 : pred + 1.5,
        demandLevel,
        latitude: cluster.lat,
        longitude: cluster.lng,
        clusterName: cluster.name,
        boundary
      };
    });

    return NextResponse.json({
      success: true,
      source: 'neon_database_fallback',
      count: enriched.length,
      horizonDays: 7,
      modelVersion: 'v1.0.0',
      data: enriched
    });
  } catch (dbErr) {
    console.error('Error in database fallback for demand forecasts:', dbErr);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve demand forecasts' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'run';

    if (action === 'train') {
      const res = await fetch(`${FORECAST_SERVICE_URL}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return NextResponse.json({ success: true, action: 'train', data });
    }

    if (action === 'run') {
      const res = await fetch(`${FORECAST_SERVICE_URL}/forecast/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return NextResponse.json({ success: true, action: 'run', data });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Action failed: ${err.message}` },
      { status: 500 }
    );
  }
}
