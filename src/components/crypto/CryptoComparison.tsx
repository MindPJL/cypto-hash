'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  LineChart,
  ProgressBar,
  Flex,
  Badge,
  Legend
} from '@tremor/react';

interface CryptoComparisonProps {
  coinIds: string[];
  timeRange: number;
  isLoading: boolean;
}

interface ComparisonData {
  date: string;
  [key: string]: string | number;
}

export function CryptoComparison({ 
  coinIds, 
  timeRange, 
  isLoading 
}: CryptoComparisonProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [coinNames, setCoinNames] = useState<Record<string, string>>({});
  const [normalizedData, setNormalizedData] = useState<ComparisonData[]>([]);
  const [viewMode, setViewMode] = useState<'absolute' | 'normalized'>('absolute');

  // Fetch comparison data for the selected coins
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!coinIds || coinIds.length === 0) return;
      
      try {
        setIsChartLoading(true);
        const response = await fetch(`/api/crypto/comparison?coins=${coinIds.join(',')}&days=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }
        
        const data = await response.json();
        
        // Get coin names from the API
        const namesResponse = await fetch('/api/crypto?limit=20');
        if (namesResponse.ok) {
          const coinsData = await namesResponse.json();
          const namesMap: Record<string, string> = {};
          
          coinsData.forEach((coin: any) => {
            if (coinIds.includes(coin.id)) {
              namesMap[coin.id] = coin.name;
            }
          });
          
          setCoinNames(namesMap);
        }
        
        // Process data for chart
        if (data) {
          // Find the coin with the most data points
          let maxDataPoints = 0;
          let coinWithMostData = '';
          
          for (const coinId of coinIds) {
            if (data[coinId] && data[coinId].prices && data[coinId].prices.length > maxDataPoints) {
              maxDataPoints = data[coinId].prices.length;
              coinWithMostData = coinId;
            }
          }
          
          if (coinWithMostData && maxDataPoints > 0) {
            // Create a map of dates to make merging easier
            const mergedData: ComparisonData[] = [];
            const normalizedData: ComparisonData[] = [];
            
            // Use the timestamps from the coin with most data points as reference
            data[coinWithMostData].prices.forEach((pricePoint: [number, number]) => {
              const timestamp = pricePoint[0];
              const date = new Date(timestamp).toLocaleDateString();
              
              const dataPoint: ComparisonData = { date };
              // Will populate normalized data separately
              
              // Add price data for each coin at this timestamp
              for (const coinId of coinIds) {
                if (data[coinId] && data[coinId].prices) {
                  // Find the closest timestamp in this coin's data
                  const closestPrice = findClosestPrice(data[coinId].prices, timestamp);
                  if (closestPrice !== null) {
                    dataPoint[coinId] = closestPrice;
                  }
                }
              }
              
              mergedData.push(dataPoint);
            });
            
            // Calculate normalized values (percentage change from first data point)
            if (mergedData.length > 0) {
              const initialValues: Record<string, number> = {};
              
              // Get initial values for each coin
              for (const coinId of coinIds) {
                if (mergedData[0][coinId] !== undefined) {
                  initialValues[coinId] = mergedData[0][coinId] as number;
                }
              }
              
              // Calculate percentage changes
              mergedData.forEach((dataPoint) => {
                const normalizedPoint: ComparisonData = { date: dataPoint.date };
                
                for (const coinId of coinIds) {
                  if (dataPoint[coinId] !== undefined && initialValues[coinId]) {
                    const currentPrice = dataPoint[coinId] as number;
                    const initialPrice = initialValues[coinId];
                    const percentChange = ((currentPrice - initialPrice) / initialPrice) * 100;
                    normalizedPoint[coinId] = percentChange;
                  }
                }
                
                normalizedData.push(normalizedPoint);
              });
            }
            
            setComparisonData(mergedData);
            setNormalizedData(normalizedData);
          }
        }
      } catch (error) {
        console.error('Error fetching comparison data:', error);
        setComparisonData([]);
        setNormalizedData([]);
      } finally {
        setIsChartLoading(false);
      }
    };
    
    fetchComparisonData();
  }, [coinIds, timeRange]);

  // Helper function to find the closest price point by timestamp
  const findClosestPrice = (prices: [number, number][], targetTimestamp: number): number | null => {
    if (!prices || prices.length === 0) return null;
    
    let closestPrice = null;
    let smallestDiff = Infinity;
    
    for (const pricePoint of prices) {
      const timestamp = pricePoint[0];
      const diff = Math.abs(timestamp - targetTimestamp);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestPrice = pricePoint[1];
      }
    }
    
    return closestPrice;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Generate colors for each coin
  const getColorForCoin = (index: number) => {
    const colors = ['blue', 'emerald', 'amber', 'rose', 'indigo', 'cyan'];
    return colors[index % colors.length];
  };

  if (isLoading || isChartLoading) {
    return (
      <Card className="p-6">
        <Title>Loading comparison data...</Title>
        <ProgressBar value={60} className="mt-4" />
      </Card>
    );
  }

  if (coinIds.length === 0) {
    return (
      <Card className="p-6">
        <Title>No coins selected for comparison</Title>
        <Text className="mt-2">Please select coins from the Overview tab to compare them.</Text>
      </Card>
    );
  }

  const chartData = viewMode === 'absolute' ? comparisonData : normalizedData;
  const valueFormatter = viewMode === 'absolute' 
    ? (value: number) => formatCurrency(value)
    : (value: number) => formatPercentage(value);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Flex justifyContent="between" alignItems="center">
          <Title>Coin Comparison</Title>
          <Flex className="gap-2">
            <Badge 
              color={viewMode === 'absolute' ? 'blue' : 'gray'}
              className="cursor-pointer"
              onClick={() => setViewMode('absolute')}
            >
              Absolute Price
            </Badge>
            <Badge 
              color={viewMode === 'normalized' ? 'blue' : 'gray'}
              className="cursor-pointer"
              onClick={() => setViewMode('normalized')}
            >
              % Change
            </Badge>
          </Flex>
        </Flex>
        
        <Text className="mt-2">
          {viewMode === 'absolute' 
            ? 'Comparing absolute prices of selected cryptocurrencies.' 
            : 'Comparing percentage change from the beginning of the time period.'}
        </Text>
        
        <div className="mt-4">
          <Flex justifyContent="start" className="gap-2">
            {coinIds.map((coinId, index) => (
              <Badge key={coinId} color={getColorForCoin(index) as any}>
                {coinNames[coinId] || coinId}
              </Badge>
            ))}
          </Flex>
        </div>
        
        {chartData.length > 0 ? (
          <LineChart
            className="h-80 mt-6"
            data={chartData}
            index="date"
            categories={coinIds}
            colors={coinIds.map((_, index) => getColorForCoin(index) as any)}
            valueFormatter={valueFormatter}
            showLegend={false}
            showGridLines={false}
            showAnimation={true}
            curveType="natural"
          />
        ) : (
          <Text className="mt-6">No comparison data available for the selected coins and time range.</Text>
        )}
        
        <div className="mt-6">
          <Legend
            categories={coinIds.map(id => coinNames[id] || id)}
            colors={coinIds.map((_, index) => getColorForCoin(index) as any)}
          />
        </div>
      </Card>
      
      <Card className="p-4">
        <Title>Performance Analysis</Title>
        <Text className="mt-2">
          This chart allows you to compare the performance of multiple cryptocurrencies over time.
          {viewMode === 'normalized' 
            ? ' The normalized view shows percentage change, making it easier to compare relative performance regardless of price differences.'
            : ' The absolute view shows actual prices, which can be useful for comparing market values.'}
        </Text>
        
        {chartData.length > 0 && (
          <div className="mt-4 space-y-2">
            {coinIds.map((coinId) => {
              const firstValue = chartData[0][coinId] as number;
              const lastValue = chartData[chartData.length - 1][coinId] as number;
              const change = viewMode === 'absolute'
                ? ((lastValue - firstValue) / firstValue) * 100
                : lastValue - firstValue;
              
              return (
                <Flex key={coinId} justifyContent="between" alignItems="center">
                  <Text>{coinNames[coinId] || coinId}</Text>
                  <Badge color={change >= 0 ? 'emerald' : 'red'}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                  </Badge>
                </Flex>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
