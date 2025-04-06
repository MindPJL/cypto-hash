# Crypto Dashboard

This project implements a cryptocurrency data visualization dashboard that displays real-time prices and historical trends.

## Features

- **Real-time Crypto Data**: Fetches and displays current cryptocurrency prices and market data
- **Historical Charts**: Shows price trends over customizable time periods (24h, 7d, 30d, 90d, 1y)
- **Coin Comparison**: Compare multiple cryptocurrencies in both absolute price and percentage change views
- **Market Overview**: Summary statistics and distribution charts for top cryptocurrencies
- **Data Storage**: Stores data in Supabase for persistence and real-time updates

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tremor UI components
- **Backend**: Next.js API routes
- **Data Storage**: Supabase
- **API Integration**: CoinGecko API for cryptocurrency data

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000/overview](http://localhost:3000/overview) in your browser to view the dashboard.

## Data Collection

The application collects cryptocurrency data in two ways:

1. **On-demand**: Data is fetched when users visit the dashboard
2. **Scheduled**: A cron job endpoint at `/api/cron` can be called to collect data at regular intervals

## Project Structure

- `/src/app/overview`: Main dashboard page
- `/src/components/crypto`: Crypto dashboard components
- `/src/lib/crypto.ts`: Utility functions for fetching and processing crypto data
- `/src/lib/supabase.ts`: Supabase client configuration
- `/src/app/api/crypto`: API routes for serving crypto data

## Database Schema

The project uses two main tables in Supabase:

1. **crypto_prices**: Stores current cryptocurrency prices and market data
2. **historical_prices**: Stores historical price data for different time periods

## Future Improvements

- Implement Supabase Realtime for live price updates
- Add user authentication for personalized watchlists
- Implement more advanced technical indicators and analysis
- Add data export functionality
- Expand to include more cryptocurrencies and market data
