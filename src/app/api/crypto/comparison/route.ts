import { NextResponse } from 'next/server';
import { fetchComparisonData } from '@/lib/crypto';

// GET /api/crypto/comparison - Get comparison data for multiple coins
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coinsParam = searchParams.get('coins');
    const days = searchParams.get('days') ? parseInt(searchParams.get('days') as string) : 7;
    
    if (!coinsParam) {
      return NextResponse.json({ error: 'coins parameter is required' }, { status: 400 });
    }
    
    const coinIds = coinsParam.split(',');
    const data = await fetchComparisonData(coinIds, days);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison data' }, { status: 500 });
  }
}
