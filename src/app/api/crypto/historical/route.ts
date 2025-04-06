import { NextResponse } from 'next/server';
import { fetchHistoricalData } from '@/lib/crypto';

// GET /api/crypto/historical - Get historical data for a specific coin
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get('coinId');
    const days = searchParams.get('days') ? parseInt(searchParams.get('days') as string) : 7;
    
    if (!coinId) {
      return NextResponse.json({ error: 'coinId parameter is required' }, { status: 400 });
    }
    
    const data = await fetchHistoricalData(coinId, days);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}
