import { CryptoData } from '@/lib/crypto';
import React, { useEffect, useState, useCallback } from 'react';

interface ExactChartProps {
  selectedCoinId: string;
  allCoins: CryptoData[];
  className?: string;
}

interface ChartDataPoint {
  date: string;
  price: number;
}

export function ExactChart({ selectedCoinId, allCoins, className = '' }: ExactChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  // Hover functionality removed

  // Find the selected coin from allCoins
  const selectedCoin = allCoins.find(coin => coin.id === selectedCoinId) || allCoins[0];

  const generateMockData = useCallback(() => {
    const mockData: ChartDataPoint[] = [];
    const basePrice = selectedCoin ? selectedCoin.current_price : 50000;
    const today = new Date();

    // Generate 30 days of data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Format date as "Mar 09" format
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit'
      });

      // Generate a price with some randomness but following a trend
      let priceChange = (Math.random() - 0.5) * 0.05;
      if (i % 7 === 0) priceChange = Math.random() * 0.08 - 0.04; // Bigger changes every week

      const prevPrice = mockData.length > 0 ? mockData[mockData.length - 1].price : basePrice;
      const price = prevPrice * (1 + priceChange);

      mockData.push({
        date: formattedDate,
        price: Math.max(price, basePrice * 0.7)
      });
    }

    setChartData(mockData);
  }, [selectedCoin]);

  useEffect(() => {
    if (selectedCoin) {
      generateMockData();
    }
  }, [selectedCoin, generateMockData]);

  // Mouse event handlers removed since hover functionality is no longer needed

  if (!selectedCoin || chartData.length === 0) {
    return <div className={`h-80 flex items-center justify-center ${className}`}>Loading chart...</div>;
  }

  // Calculate min and max for y-axis
  const prices = chartData.map(d => d.price);
  const minPrice = Math.floor(Math.min(...prices) * 0.95);
  const maxPrice = Math.ceil(Math.max(...prices) * 1.05);

  // Generate price labels for y-axis (5 labels)
  const priceLabels = [];
  const priceStep = (maxPrice - minPrice) / 4;
  for (let i = 0; i <= 4; i++) {
    priceLabels.push(maxPrice - i * priceStep);
  }

  // No formatting function needed as we're using direct formatting in the JSX

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <h2 className="text-xl text-gray-300 text-center mb-4">{selectedCoin.name} Price Chart</h2>

      {/* Chart legend */}
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-blue-500"></div>
          <span className="text-gray-400">{selectedCoin.symbol.toUpperCase()}</span>
        </div>
      </div>

      <div className="relative h-96">
        {/* Y-axis labels (left - prices) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[8px] text-gray-400">
          {priceLabels.map((price, i) => {
            // Format price to be much slimmer
            let formattedPrice = '';
            if (price >= 1000) {
              formattedPrice = (price / 1000).toFixed(1) + 'k';
            } else if (price >= 1) {
              formattedPrice = price.toFixed(2);
            } else {
              formattedPrice = price.toFixed(4);
            }
            return (
              <div key={i} className="pl-1">
                {formattedPrice}
              </div>
            );
          })}
        </div>

        {/* Y-axis labels (right - RSI) */}
        <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-400">
          <div>0</div>
          <div>25</div>
          <div>50</div>
          <div>75</div>
          <div>100</div>
        </div>

        {/* Chart area */}
        <div className="absolute left-16 right-8 top-0 bottom-6 bg-gray-900">
          {/* Grid lines */}
          <div className="w-full h-full grid grid-cols-6 grid-rows-4">
            {Array(24).fill(0).map((_, i) => (
              <div key={i} className="border-gray-700 border-t border-l"></div>
            ))}
          </div>

          {/* Chart SVG */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            // Mouse event handlers removed
          >
            {/* Main price line with dots */}
            <g>
              {/* Line */}
              <polyline
                points={chartData.map((d, i) => {
                  const prices = chartData.map(p => p.price);
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 100 - ((d.price - min) / (max - min)) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1"
              />

              {/* Dots at each data point removed */}
            </g>

            {/* Hover indicator removed */}
          </svg>
        </div>

        {/* X-axis labels (dates) */}
        <div className="absolute left-16 right-8 bottom-0 h-6 flex justify-between text-xs text-gray-400">
          {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
            <div key={i} className="transform -rotate-45 origin-top-left text-[8px]">
              {d.date}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
