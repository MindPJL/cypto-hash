import { NextResponse } from 'next/server';
import { fetchCryptoData } from '@/lib/crypto';

// GET /api/crypto - Get current crypto prices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    
    const data = await fetchCryptoData(limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto data' }, { status: 500 });
  }
}
