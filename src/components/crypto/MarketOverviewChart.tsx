'use client';

import { useState, useEffect, ReactElement } from 'react';
import { ProgressBar } from '@tremor/react';

interface MarketOverviewChartProps {
  className?: string;
  selectedCoinId?: string | null;
  allCoins: any[];
}

interface CandlestickData {
  timestamp: number;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

type TimeRange = '7d' | '14d' | '30d' | '90d' | '180d' | '1y';

export function MarketOverviewChart({ className = '', selectedCoinId, allCoins }: MarketOverviewChartProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [allChartData, setAllChartData] = useState<CandlestickData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [viewIndex, setViewIndex] = useState(0);
  
  // Get the selected coin data
  const selectedCoin = selectedCoinId ? allCoins.find(coin => coin.id === selectedCoinId) : null;
  
  // Fetch chart data when a coin is selected
  useEffect(() => {
    if (!selectedCoin) return;
    
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // Fetch 30-day historical data with hourly intervals
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/market_chart?vs_currency=usd&days=30&interval=hourly`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        
        const data = await response.json();
        
        // Format the data for candlestick chart
        // Group hourly data into daily candles
        const dailyData: { [key: string]: CandlestickData } = {};
        
        // Process price and volume data
        data.prices.forEach((priceData: [number, number], index: number) => {
          const [timestamp, price] = priceData;
          const date = new Date(timestamp);
          const dateKey = date.toISOString().split('T')[0]; // Use date as key (YYYY-MM-DD)
          
          // Get volume data if available
          let volume = 0;
          if (data.total_volumes && data.total_volumes[index]) {
            volume = data.total_volumes[index][1];
          }
          
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
              timestamp,
              date,
              open: price,
              high: price,
              low: price,
              close: price,
              volume
            };
          } else {
            // Update high and low
            dailyData[dateKey].high = Math.max(dailyData[dateKey].high, price);
            dailyData[dateKey].low = Math.min(dailyData[dateKey].low, price);
            // Last price of the day becomes close
            dailyData[dateKey].close = price;
            // Accumulate volume
            dailyData[dateKey].volume = (dailyData[dateKey].volume || 0) + volume;
          }
        });
        
        // Convert to array and sort by date
        const candlestickData = Object.values(dailyData).sort((a, b) => a.timestamp - b.timestamp);
        setAllChartData(candlestickData);
        
        // Set initial view to most recent data
        updateVisibleData(candlestickData, 0);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Create mock candlestick data for fallback
        const mockData: CandlestickData[] = [];
        const today = new Date();
        const basePrice = selectedCoin.current_price;
        const volatility = basePrice * 0.15; // 15% volatility
        
        // Generate 30 days of daily candles
        for (let i = 30; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0); // Start of day
          const timestamp = date.getTime();
          
          // Create a somewhat realistic price movement
          const dayVolatility = volatility * (0.5 + Math.random());
          const trend = (i / 30) * volatility * (Math.random() > 0.5 ? 1 : -1);
          
          // Generate OHLC data
          const open = basePrice + trend + (Math.random() - 0.5) * dayVolatility;
          const close = open + (Math.random() - 0.5) * dayVolatility;
          const high = Math.max(open, close) + Math.random() * dayVolatility * 0.5;
          const low = Math.min(open, close) - Math.random() * dayVolatility * 0.5;
          const volume = Math.random() * basePrice * 100000; // Mock volume data
          
          mockData.push({
            date,
            timestamp,
            open,
            high,
            low,
            close,
            volume
          });
        }
        
        setAllChartData(mockData);
        updateVisibleData(mockData, 0);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChartData();
  }, [selectedCoin]);
  
  // Update visible data based on time range and view index
  const updateVisibleData = (data: CandlestickData[], index: number) => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }
    
    // Determine how many days to show based on time range
    let daysToShow = 30;
    switch (timeRange) {
      case '7d': daysToShow = 7; break;
      case '14d': daysToShow = 14; break;
      case '30d': daysToShow = 30; break;
      case '90d': daysToShow = 90; break;
      case '180d': daysToShow = 180; break;
      case '1y': daysToShow = 365; break;
      default: daysToShow = 30;
    }
    
    // Ensure we don't try to show more days than we have data for
    daysToShow = Math.min(daysToShow, data.length);
    
    // Calculate the maximum possible index
    const maxIndex = Math.max(0, data.length - daysToShow);
    const safeIndex = Math.min(index, maxIndex);
    
    // Get the visible slice of data
    const visibleData = data.slice(safeIndex, Math.min(safeIndex + daysToShow, data.length));
    setChartData(visibleData);
    setViewIndex(safeIndex);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    updateVisibleData(allChartData, viewIndex);
  };
  
  // Handle sliding the view
  const handleSlide = (direction: 'left' | 'right') => {
    if (!allChartData || allChartData.length === 0 || !chartData || chartData.length === 0) {
      return;
    }
    
    const step = Math.max(1, Math.floor(chartData.length / 5)); // Move by 20% of visible range
    let newIndex = viewIndex;
    
    if (direction === 'left') {
      // Move back in time (increase index)
      newIndex = Math.min(allChartData.length - chartData.length, viewIndex + step);
    } else {
      // Move forward in time (decrease index)
      newIndex = Math.max(0, viewIndex - step);
    }
    
    updateVisibleData(allChartData, newIndex);
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <ProgressBar value={60} className="mt-4" />
      </div>
    );
  }

  return (
    <div className={`${className} w-full`}>
      <div className="h-[400px] w-full">
        {selectedCoin ? (
          <div className="w-full h-full">
            <div className="flex items-center justify-between gap-2 mb-2 px-4 pt-2">
              <div className="flex items-center">
                {selectedCoin.image && (
                  <img
                    src={selectedCoin.image}
                    alt={selectedCoin.name}
                    className="w-6 h-6 mr-2"
                  />
                )}
                <div className="text-xl font-bold text-white">
                  {selectedCoin.symbol.toUpperCase()}
                </div>
                <div className="ml-2 text-gray-300 font-medium">
                  {selectedCoin.current_price >= 1000 
                    ? `$${selectedCoin.current_price.toLocaleString(undefined, {maximumFractionDigits: 0})}` 
                    : selectedCoin.current_price >= 1 
                      ? `$${selectedCoin.current_price.toLocaleString(undefined, {maximumFractionDigits: 2})}` 
                      : `$${selectedCoin.current_price.toLocaleString(undefined, {maximumFractionDigits: 4})}`
                  }
                </div>
                <div className={`ml-2 text-xs px-1.5 py-0.5 rounded ${selectedCoin.price_change_percentage_24h >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                  {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}{selectedCoin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="w-full h-[calc(100%-40px)]">
              <div className="flex justify-between items-center px-4">
                <p className="text-2xl font-bold text-white">
                  {selectedCoin.current_price >= 1000 
                    ? `$${selectedCoin.current_price.toLocaleString(undefined, {maximumFractionDigits: 0})}` 
                    : selectedCoin.current_price >= 1 
                      ? `$${selectedCoin.current_price.toLocaleString(undefined, {maximumFractionDigits: 2})}` 
                      : `$${selectedCoin.current_price.toLocaleString(undefined, {maximumFractionDigits: 4})}`
                  }
                </p>
                
                <div className="flex items-center space-x-2">
                  {/* Time range buttons */}
                  <div className="flex bg-[#2d3748] rounded-md p-1 text-xs">
                    {(['7d', '14d', '30d', '90d', '180d', '1y'] as TimeRange[]).map((range) => (
                      <button
                        key={range}
                        className={`px-2 py-1 rounded ${timeRange === range ? 'bg-[#4a5568] text-white' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => handleTimeRangeChange(range)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                  
                  {/* Navigation buttons */}
                  <div className="flex space-x-1">
                    <button 
                      className="bg-[#2d3748] hover:bg-[#4a5568] text-white px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleSlide('left')}
                      disabled={!allChartData || allChartData.length === 0 || viewIndex >= allChartData.length - chartData.length}
                    >
                      ←
                    </button>
                    <button 
                      className="bg-[#2d3748] hover:bg-[#4a5568] text-white px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleSlide('right')}
                      disabled={!allChartData || allChartData.length === 0 || viewIndex <= 0}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
              
              {chartData.length > 0 ? (
                <div className="w-full h-[520px] relative">
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    {(() => {
                      // Calculate min and max for scaling
                      const highPrices = chartData.map(d => d.high);
                      const lowPrices = chartData.map(d => d.low);
                      const minPrice = Math.min(...lowPrices) * 0.995; // Add a small buffer
                      const maxPrice = Math.max(...highPrices) * 1.005;
                      const priceRange = maxPrice - minPrice;
                      
                      // Calculate volume scaling
                      const volumes = chartData.map(d => d.volume || 0);
                      const maxVolume = Math.max(...volumes, 1);
                      
                      // Create price labels for y-axis
                      const priceLabels: ReactElement[] = [];
                      for (let i = 0; i <= 4; i++) {
                        const y = i * 25;
                        const price = maxPrice - (priceRange * (y / 100));
                        
                        // Format price based on its magnitude
                        let formattedPrice;
                        if (price >= 1000) {
                          formattedPrice = `$${price.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
                        } else if (price >= 1) {
                          formattedPrice = `$${price.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
                        } else {
                          formattedPrice = `$${price.toLocaleString(undefined, {maximumFractionDigits: 4})}`;
                        }
                        
                        priceLabels.push(
                          <text 
                            key={`price-${i}`}
                            x="1" 
                            y={y} 
                            fontSize="2.5"
                            fontFamily="sans-serif"
                            fontWeight="300"
                            fill="#a0aec0"
                            dominantBaseline="middle"
                          >
                            {formattedPrice}
                          </text>
                        );
                      }
                      
                      // Create date labels for x-axis
                      const dateLabels: ReactElement[] = [];
                      if (chartData.length > 0) {
                        // Show first, middle, and last date
                        const positions = [0, Math.floor(chartData.length / 2), chartData.length - 1];
                        positions.forEach((pos, i) => {
                          if (pos < chartData.length) {
                            const x = (pos / (chartData.length - 1)) * 100;
                            const date = chartData[pos].date;
                            dateLabels.push(
                              <text 
                                key={`date-${i}`}
                                x={x} 
                                y="99" 
                                fontSize="2.5"
                                fontFamily="sans-serif"
                                fontWeight="300"
                                fill="#a0aec0"
                                textAnchor="middle"
                              >
                                {date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                              </text>
                            );
                          }
                        });
                      }
                      
                      // Create horizontal grid lines
                      const gridLines: ReactElement[] = [];
                      for (let i = 1; i < 5; i++) {
                        const y = i * 20;
                        gridLines.push(
                          <line 
                            key={`grid-${i}`}
                            x1="3" 
                            y1={y} 
                            x2="100" 
                            y2={y} 
                            stroke="#2d3748" 
                            strokeWidth="0.3" 
                          />
                        );
                      }
                      
                      // Create vertical grid lines
                      for (let i = 1; i < 5; i++) {
                        const x = i * 20;
                        gridLines.push(
                          <line 
                            key={`grid-v-${i}`}
                            x1={x} 
                            y1="0" 
                            x2={x} 
                            y2="95" 
                            stroke="#2d3748" 
                            strokeWidth="0.3" 
                          />
                        );
                      }
                      
                      // Create volume bars
                      const volumeBars = chartData.map((candle, i) => {
                        const x = (i / (chartData.length - 1)) * 100;
                        const barWidth = 100 / chartData.length / 2; // Thinner volume bars
                        
                        // Calculate volume bar height (max 20% of chart height)
                        const volume = candle.volume || 0;
                        const volumeHeight = (volume / maxVolume) * 10; // Max 10% of chart height for volume
                        
                        // Determine if bullish or bearish
                        const isBullish = candle.close >= candle.open;
                        const color = isBullish ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                        
                        return (
                          <rect 
                            key={`volume-${i}`}
                            x={x - barWidth / 2}
                            y={95 - volumeHeight}
                            width={barWidth}
                            height={volumeHeight}
                            fill={color}
                          />
                        );
                      });
                      
                      // Create line chart path
                      let linePath = '';
                      let areaPath = '';
                      
                      // Generate the path for the line
                      chartData.forEach((dataPoint, i) => {
                        const x = (i / (chartData.length - 1)) * 100;
                        // Use close price for the line chart
                        const y = 85 - ((dataPoint.close - minPrice) / priceRange) * 85;
                        
                        if (i === 0) {
                          linePath += `M ${x} ${y}`;
                          areaPath += `M ${x} ${y}`;
                        } else {
                          linePath += ` L ${x} ${y}`;
                          areaPath += ` L ${x} ${y}`;
                        }
                      });
                      
                      // Complete the area path by extending to the bottom
                      if (chartData.length > 0) {
                        const lastX = 100;
                        areaPath += ` L ${lastX} 85 L 0 85 Z`;
                      }
                      
                      // Create data points for the line
                      const dataPoints = chartData.map((dataPoint, i) => {
                        const x = (i / (chartData.length - 1)) * 100;
                        const y = 85 - ((dataPoint.close - minPrice) / priceRange) * 85;
                        
                        // Only show every 7th point to avoid clutter
                        if (i % 7 === 0 || i === chartData.length - 1) {
                          return (
                            <circle
                              key={`point-${i}`}
                              cx={x}
                              cy={y}
                              r="0.5"
                              fill="#3b82f6"
                              stroke="#1e40af"
                              strokeWidth="0.1"
                            />
                          );
                        }
                        return null;
                      }).filter(Boolean);
                      
                      // Determine line color based on price trend
                      const firstPrice = chartData.length > 0 ? chartData[0].close : 0;
                      const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
                      const isPriceUp = lastPrice >= firstPrice;
                      const lineColor = isPriceUp ? '#10b981' : '#ef4444';
                      const areaColor = isPriceUp ? 'url(#greenGradient)' : 'url(#redGradient)';
                      
                      // Line and area elements
                      const lineElement = (
                        <path
                          d={linePath}
                          fill="none"
                          stroke={lineColor}
                          strokeWidth="0.6"
                          strokeLinejoin="round"
                        />
                      );
                      
                      const areaElement = (
                        <path
                          d={areaPath}
                          fill={areaColor}
                          opacity="0.15"
                        />
                      );
                      
                      // Reference line removed as requested
                      
                      // Add y-axis line
                      const yAxis = (
                        <line 
                          x1="3" 
                          y1="0" 
                          x2="3" 
                          y2="95" 
                          stroke="#4a5568" 
                          strokeWidth="0.4" 
                        />
                      );
                      
                      // Add x-axis line
                      const xAxis = (
                        <line 
                          x1="3" 
                          y1="95" 
                          x2="100" 
                          y2="95" 
                          stroke="#4a5568" 
                          strokeWidth="0.4" 
                        />
                      );
                      
                      return (
                        <>
                          {/* Gradient definitions */}
                          <defs>
                            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                            </linearGradient>
                            <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                          
                          {/* Background grid */}
                          {gridLines}
                          
                          {/* Axes */}
                          {yAxis}
                          {xAxis}
                          
                          {/* Price labels */}
                          {priceLabels}
                          
                          {/* Date labels */}
                          {dateLabels}
                          
                          {/* Volume bars */}
                          {volumeBars}
                          
                          {/* Area fill under the line */}
                          {areaElement}
                          
                          {/* Line chart */}
                          {lineElement}
                          
                          {/* Data points */}
                          {dataPoints}
                          

                        </>
                      );
                    })()}
                  </svg>
                </div>
              ) : (
                <div className="h-[320px] flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chart will appear when you select a cryptocurrency
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


