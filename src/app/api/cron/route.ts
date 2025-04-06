import { NextResponse } from 'next/server';
import { fetchCryptoData, fetchHistoricalData } from '@/lib/crypto';

// This route can be called by a CRON job to collect data at regular intervals
export async function GET() {
  try {
    console.log('Starting scheduled data collection...');
    
    // Fetch current prices for top cryptocurrencies
    const cryptoData = await fetchCryptoData(20);
    console.log(`Collected data for ${cryptoData.length} cryptocurrencies`);
    
    // Fetch historical data for top 5 cryptocurrencies
    const topCoins = cryptoData.slice(0, 5);
    
    for (const coin of topCoins) {
      console.log(`Collecting historical data for ${coin.name}...`);
      await fetchHistoricalData(coin.id, 30); // 30 days of historical data
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data collection completed successfully!',
      timestamp: new Date().toISOString(),
      coinsCollected: cryptoData.length
    });
  } catch (error) {
    console.error('Error in data collection:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to collect data' 
    }, { status: 500 });
  }
}
