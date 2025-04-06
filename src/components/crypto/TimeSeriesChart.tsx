'use client';

import { useState, useEffect } from 'react';
import { Card } from '@tremor/react';

interface TimeSeriesChartProps {
  className?: string;
  selectedCoinId?: string | null;
  allCoins: any[];
}

export function TimeSeriesChart({ className = '', selectedCoinId, allCoins }: TimeSeriesChartProps) {
  const [activeTab, setActiveTab] = useState<'line' | 'area' | 'candlestick' | 'comparison'>('line');
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [hoverPoint, setHoverPoint] = useState<{index: number, x: number, y: number} | null>(null);
  
  // Get the selected coin data
  const selectedCoin = selectedCoinId ? allCoins.find(coin => coin.id === selectedCoinId) : null;
  
  // Fetch chart data when a coin is selected
  useEffect(() => {
    if (!selectedCoin) return;
    
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // Create mock data for now
        const mockData = [];
        const today = new Date();
        const basePrice = selectedCoin.current_price;
        const volatility = basePrice * 0.15; // 15% volatility
        
        // Generate 30 days of data
        for (let i = 30; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          // Create a somewhat realistic price movement
          const noise = Math.sin(i / 5) * (Math.random() - 0.5) * volatility;
          const trend = (i / 30) * volatility * (Math.random() > 0.5 ? 1 : -1);
          const price = basePrice + noise + trend;
          
          mockData.push({
            date,
            price: Math.max(price, basePrice * 0.7),
            sma20: i < 25 ? basePrice * (0.95 + Math.random() * 0.1) : null,
            sma50: i < 15 ? basePrice * (0.9 + Math.random() * 0.2) : null
          });
        }
        
        setChartData(mockData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChartData();
  }, [selectedCoin]);

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex justify-center items-center h-60">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            Loading chart data...
          </div>
        </div>
      </Card>
    );
  }

  // Handle mouse movement on chart
  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (chartData.length === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xPercent = x / rect.width;
    const index = Math.min(Math.floor(xPercent * chartData.length), chartData.length - 1);
    
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    const xPos = (index / (chartData.length - 1)) * 100;
    const yPos = 100 - ((chartData[index].price - minPrice) / priceRange) * 100;
    
    setHoverPoint({ index, x: xPos, y: yPos });
  };

  const handleMouseLeave = () => {
    setHoverPoint(null);
  };

  return (
    <Card className={`p-4 ${className}`}>
      {/* Chart tabs */}
      <div className="flex space-x-4 mb-4 border-b border-gray-700">
        <button
          className={`px-4 py-1 text-sm ${activeTab === 'line' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('line')}
        >
          Line
        </button>
        <button
          className={`px-4 py-1 text-sm ${activeTab === 'area' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('area')}
        >
          Area
        </button>
        <button
          className={`px-4 py-1 text-sm ${activeTab === 'candlestick' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('candlestick')}
        >
          Candlestick
        </button>
        <button
          className={`px-4 py-1 text-sm ${activeTab === 'comparison' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab('comparison')}
        >
          Comparison
        </button>
      </div>
      
      {selectedCoin ? (
        <div className="w-full h-full relative">
          {/* Chart title */}
          <div className="text-sm font-medium text-gray-400 mb-2">
            Currently Viewing: {selectedCoin.symbol.toUpperCase()}
          </div>
          
          {/* Chart subtitle */}
          <div className="text-lg font-medium text-gray-300 mb-4">
            {selectedCoin.symbol.toUpperCase()} Price Chart
          </div>
          
          {/* Chart legend - centered at the top */}
          <div className="flex items-center justify-center gap-8 text-xs mb-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-gray-400">{selectedCoin.symbol.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-orange-400"></div>
              <span className="text-gray-400">20-day SMA</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-purple-500"></div>
              <span className="text-gray-400">14-day RSI</span>
            </div>
          </div>
          
          {/* Chart container */}
          <div className="h-80 w-full bg-gray-900 dark:bg-gray-900 rounded-lg border border-gray-700 dark:border-gray-700 relative">
            {/* Y-axis labels (left) */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-2 text-xs text-gray-400">
              {chartData.length > 0 && [0, 1, 2, 3, 4].map(i => {
                const prices = chartData.map(d => d.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                const value = max - ((max - min) * i / 4);
                return (
                  <div key={i} className="text-right pr-2">
                    {value.toFixed(2)}
                  </div>
                );
              })}
            </div>
            
            {/* Y-axis labels (right) */}
            <div className="absolute right-0 top-0 bottom-0 w-12 flex flex-col justify-between py-2 text-xs text-gray-400">
              {[0, 25, 50, 75, 100].map(value => (
                <div key={value} className="text-left pl-2">
                  {value}
                </div>
              ))}
            </div>
            
            {/* Chart area */}
            <div className="absolute left-12 right-12 top-2 bottom-6">
              {/* Grid lines */}
              <div className="absolute inset-0">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="absolute w-full border-t border-gray-700" style={{ top: `${i * 25}%` }} />
                ))}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <div key={i} className="absolute h-full border-l border-gray-700" style={{ left: `${i * 10}%` }} />
                ))}
              </div>
              
              {/* SVG Chart */}
              {chartData.length > 0 && (
                <svg 
                  className="w-full h-full" 
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                >
                  {/* Main price line */}
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
                  
                  {/* 20-day SMA */}
                  <polyline
                    points={chartData.filter(d => d.sma20).map((d, i) => {
                      const prices = chartData.map(p => p.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      const x = (i / (chartData.length - 1)) * 100;
                      const y = 100 - ((d.sma20 - min) / (max - min)) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  
                  {/* Hover detection area */}
                  <rect 
                    width="100%" 
                    height="100%" 
                    fill="transparent"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  />
                  
                  {/* Tooltip */}
                  {hoverPoint && (
                    <>
                      {/* Vertical line */}
                      <line 
                        x1={hoverPoint.x} 
                        y1="0" 
                        x2={hoverPoint.x} 
                        y2="100" 
                        stroke="#6b7280" 
                        strokeWidth="0.5"
                        strokeDasharray="2,1"
                      />
                      
                      {/* Data point */}
                      <circle 
                        cx={hoverPoint.x} 
                        cy={hoverPoint.y} 
                        r="2"
                        fill="white"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                      />
                      
                      {/* Tooltip box */}
                      <g transform={`translate(${hoverPoint.x < 50 ? hoverPoint.x + 5 : hoverPoint.x - 105}, ${hoverPoint.y < 50 ? hoverPoint.y + 5 : hoverPoint.y - 55})`}>
                        <rect 
                          width="100" 
                          height="50" 
                          rx="3"
                          fill="rgba(17, 24, 39, 0.9)"
                          stroke="#374151"
                          strokeWidth="1"
                        />
                        <text x="5" y="15" fill="white" fontSize="10" fontWeight="bold">
                          {chartData[hoverPoint.index].date.toLocaleDateString()}
                        </text>
                        <text x="5" y="30" fill="white" fontSize="10">
                          {selectedCoin.symbol.toUpperCase()}: ${chartData[hoverPoint.index].price.toFixed(2)}
                        </text>
                        {chartData[hoverPoint.index].sma20 && (
                          <text x="5" y="42" fill="#f97316" fontSize="10">
                            20-SMA: ${chartData[hoverPoint.index].sma20.toFixed(2)}
                          </text>
                        )}

                      </g>
                    </>
                  )}
                </svg>
              )}
            </div>
            
            {/* X-axis labels */}
            <div className="absolute left-12 right-12 bottom-0 flex justify-between text-xs text-gray-400">
              {chartData.length > 0 && [0, 1, 2, 3, 4].map(i => {
                const index = Math.floor(i * (chartData.length - 1) / 4);
                return (
                  <div key={i} className="transform -rotate-45 origin-top-left text-[8px]">
                    {chartData[index].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Chart will appear when you select a cryptocurrency
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
