import axios from 'axios';
import { supabase } from './supabase';

// Define types for our crypto data
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
  image: string;
  last_updated: string;
}

export interface HistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// Function to fetch current crypto data from CoinGecko
export async function fetchCryptoData(limit = 10): Promise<CryptoData[]> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d,30d`
    );
    
    // Store data in Supabase
    await storeCryptoData(response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    
    // If API fails, try to get data from Supabase
    const { data, error: supabaseError } = await supabase
      .from('crypto_prices')
      .select('*')
      .order('market_cap_rank', { ascending: true })
      .limit(limit);
      
    if (supabaseError) {
      console.error('Error fetching from Supabase:', supabaseError);
      return [];
    }
    
    return data as CryptoData[];
  }
}

// Function to store crypto data in Supabase
async function storeCryptoData(data: CryptoData[]) {
  try {
    const formattedData = data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      total_volume: coin.total_volume,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      price_change_percentage_7d: coin.price_change_percentage_7d,
      price_change_percentage_30d: coin.price_change_percentage_30d,
      image: coin.image,
      last_updated: coin.last_updated,
      timestamp: new Date().toISOString(),
    }));

    const { error } = await supabase.from('crypto_prices').upsert(formattedData, {
      onConflict: 'id,timestamp',
    });

    if (error) {
      console.error('Error storing data in Supabase:', error);
    }
  } catch (error) {
    console.error('Error in storeCryptoData:', error);
  }
}

// Function to fetch historical data for a specific coin
export async function fetchHistoricalData(
  coinId: string,
  days: number = 7
): Promise<HistoricalData | null> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    
    // Store historical data in Supabase
    await storeHistoricalData(coinId, response.data, days);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching historical data for ${coinId}:`, error);
    
    // If API fails, try to get data from Supabase
    const { data, error: supabaseError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('coin_id', coinId)
      .eq('days', days)
      .order('timestamp', { ascending: false })
      .limit(1);
      
    if (supabaseError || !data || data.length === 0) {
      console.error('Error fetching historical data from Supabase:', supabaseError);
      return null;
    }
    
    return JSON.parse(data[0].data) as HistoricalData;
  }
}

// Function to store historical data in Supabase
async function storeHistoricalData(
  coinId: string,
  data: HistoricalData,
  days: number
) {
  try {
    const { error } = await supabase.from('historical_prices').insert({
      coin_id: coinId,
      days: days,
      data: JSON.stringify(data),
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Error storing historical data in Supabase:', error);
    }
  } catch (error) {
    console.error('Error in storeHistoricalData:', error);
  }
}

// Function to get comparison data for multiple coins
export async function fetchComparisonData(
  coinIds: string[],
  days: number = 7
): Promise<Record<string, HistoricalData | null>> {
  const result: Record<string, HistoricalData | null> = {};
  
  for (const coinId of coinIds) {
    result[coinId] = await fetchHistoricalData(coinId, days);
  }
  
  return result;
}
