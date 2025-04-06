import { fetchCryptoData, fetchHistoricalData } from '../lib/crypto';

async function collectData() {
  try {
    console.log('Starting data collection...');
    
    // Fetch current prices for top cryptocurrencies
    const cryptoData = await fetchCryptoData(20);
    console.log(`Collected data for ${cryptoData.length} cryptocurrencies`);
    
    // Fetch historical data for top 5 cryptocurrencies
    const topCoins = cryptoData.slice(0, 5);
    
    for (const coin of topCoins) {
      console.log(`Collecting historical data for ${coin.name}...`);
      await fetchHistoricalData(coin.id, 30); // 30 days of historical data
    }
    
    console.log('Data collection completed successfully!');
  } catch (error) {
    console.error('Error collecting data:', error);
  }
}

// Run the data collection
collectData();
