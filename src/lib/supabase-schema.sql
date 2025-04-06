-- Create table for storing current cryptocurrency prices
CREATE TABLE IF NOT EXISTS crypto_prices (
  id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  current_price FLOAT NOT NULL,
  market_cap BIGINT NOT NULL,
  market_cap_rank INTEGER NOT NULL,
  total_volume BIGINT NOT NULL,
  price_change_percentage_24h FLOAT,
  price_change_percentage_7d FLOAT,
  price_change_percentage_30d FLOAT,
  image TEXT,
  last_updated TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (id, timestamp)
);

-- Create table for storing historical price data
CREATE TABLE IF NOT EXISTS historical_prices (
  id SERIAL PRIMARY KEY,
  coin_id TEXT NOT NULL,
  days INTEGER NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_crypto_prices_timestamp ON crypto_prices (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_market_cap_rank ON crypto_prices (market_cap_rank);
CREATE INDEX IF NOT EXISTS idx_historical_prices_coin_id ON historical_prices (coin_id);
CREATE INDEX IF NOT EXISTS idx_historical_prices_timestamp ON historical_prices (timestamp DESC);

-- Enable Row Level Security
ALTER TABLE crypto_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON crypto_prices FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON historical_prices FOR SELECT USING (true);

-- Create policies for authenticated users to insert data
CREATE POLICY "Allow authenticated insert" ON crypto_prices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON historical_prices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
