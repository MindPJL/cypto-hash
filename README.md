# Cryptocurrency Dashboard

A professional cryptocurrency data visualization dashboard that displays real-time prices and historical trends with an elegant line chart interface.

## Features

- **Real-time Cryptocurrency Data**: Fetches up-to-date price data from CoinGecko API
- **Interactive Line Chart**: Smooth line chart with gradient fill showing price movements
- **Time Range Navigation**: Select different time periods (7d, 14d, 30d, 90d, 180d, 1y)
- **Historical Data Browsing**: Navigate through time with left/right controls
- **Volume Indicator**: Shows trading volume with color-coded bars
- **Cryptocurrency List**: Scrollable list of top cryptocurrencies with search functionality
- **Favorites Management**: Save your favorite cryptocurrencies for quick access
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Professional trading platform appearance
- **Supabase Integration**: Stores historical data in Supabase database

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Tremor UI
- **Data Visualization**: Custom SVG charts
- **API Integration**: CoinGecko API
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Icons**: Remix Icons

## Setup Instructions

1. Clone the repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/crypto-dashboard.git
   cd crypto-dashboard
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ezebdwwslffdmbjpmmga.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project can be deployed to Netlify or Vercel for hosting.

## License

MIT
