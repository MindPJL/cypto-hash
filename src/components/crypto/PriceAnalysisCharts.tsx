'use client';

import {
  AreaChart,
  BarChart,
  Card,
  Legend,
  LineChart,
  ProgressBar,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Title
} from '@tremor/react';
import { useEffect, useState } from 'react';

interface PriceAnalysisChartsProps {
  coinId: string;
  timeRange: number;
  coinName: string;
}

interface ChartData {
  date: string;
  price: number;
  volume?: number;
  marketCap?: number;
}

export function PriceAnalysisCharts({
  coinId,
  timeRange,
  coinName
}: PriceAnalysisChartsProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // Fetch historical data for the selected coin
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/crypto/historical?coinId=${coinId}&days=${timeRange}`);

        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }

        const data = await response.json();

        if (data && data.prices) {
          // Format data for the chart
          const formattedData = data.prices.map((priceItem: [number, number], index: number) => {
            const date = new Date(priceItem[0]);
            const volumeItem = data.total_volumes[index];
            const marketCapItem = data.market_caps[index];

            return {
              date: date.toLocaleDateString(),
              price: priceItem[1],
              volume: volumeItem ? volumeItem[1] : 0,
              marketCap: marketCapItem ? marketCapItem[1] : 0
            };
          });

          setChartData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch comparison data (Bitcoin and Ethereum)
    const fetchComparisonData = async () => {
      try {
        const comparisonCoins = ['bitcoin', 'ethereum'];
        if (!comparisonCoins.includes(coinId)) {
          comparisonCoins.push(coinId);
        }

        const response = await fetch(`/api/crypto/comparison?coins=${comparisonCoins.join(',')}&days=${timeRange}`);

        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }

        const data = await response.json();

        // Process data for comparison chart
        if (data) {
          // Find the coin with the most data points
          let maxDataPoints = 0;
          let coinWithMostData = '';

          for (const coinId of comparisonCoins) {
            if (data[coinId] && data[coinId].prices && data[coinId].prices.length > maxDataPoints) {
              maxDataPoints = data[coinId].prices.length;
              coinWithMostData = coinId;
            }
          }

          if (coinWithMostData && maxDataPoints > 0) {
            // Create normalized data for percentage change comparison
            const normalizedData: any[] = [];

            // Get initial values for each coin
            const initialValues: Record<string, number> = {};
            for (const coinId of comparisonCoins) {
              if (data[coinId] && data[coinId].prices && data[coinId].prices.length > 0) {
                initialValues[coinId] = data[coinId].prices[0][1];
              }
            }

            // Use the timestamps from the coin with most data points as reference
            data[coinWithMostData].prices.forEach((pricePoint: [number, number]) => {
              const timestamp = pricePoint[0];
              const date = new Date(timestamp).toLocaleDateString();

              const dataPoint: any = { date };

              // Add normalized price data for each coin at this timestamp
              for (const coinId of comparisonCoins) {
                if (data[coinId] && data[coinId].prices && initialValues[coinId]) {
                  // Find the closest timestamp in this coin's data
                  const closestPrice = findClosestPrice(data[coinId].prices, timestamp);
                  if (closestPrice !== null) {
                    const percentChange = ((closestPrice - initialValues[coinId]) / initialValues[coinId]) * 100;
                    dataPoint[coinId] = percentChange;
                  }
                }
              }

              normalizedData.push(dataPoint);
            });

            setComparisonData(normalizedData);
          }
        }
      } catch (error) {
        console.error('Error fetching comparison data:', error);
        setComparisonData([]);
      }
    };

    if (coinId) {
      fetchHistoricalData();
      fetchComparisonData();
    }
  }, [coinId, timeRange]);

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

  // Format large numbers (billions, millions)
  const formatLargeNumber = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else {
      return formatCurrency(value);
    }
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Title>Loading chart data...</Title>
        <ProgressBar value={60} className="mt-4" />
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <Title>No chart data available</Title>
        <Text>Unable to load historical data for this cryptocurrency.</Text>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <TabGroup>
        <TabList>
          <Tab>Price</Tab>
          <Tab>Volume</Tab>
          <Tab>Comparison</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <div className="mt-4">
              <Title>Price History</Title>
              <Text className="mb-4">
                Historical price data for {coinName} over the selected time period.
              </Text>
              <AreaChart
                className="h-80"
                data={chartData}
                index="date"
                categories={["price"]}
                colors={["blue"]}
                valueFormatter={value => formatCurrency(value)}
                showLegend={false}
                showGridLines={true}
                showAnimation={true}
                curveType="natural"
              />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-4">
              <Title>Trading Volume</Title>
              <Text className="mb-4">
                Historical trading volume for {coinName} over the selected time period.
              </Text>
              <BarChart
                className="h-80"
                data={chartData}
                index="date"
                categories={["volume"]}
                colors={["indigo"]}
                valueFormatter={value => formatLargeNumber(value)}
                showLegend={false}
                showGridLines={true}
                showAnimation={true}
              />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-4">
              <Title>Performance Comparison</Title>
              <Text className="mb-4">
                Comparing {coinName}&apos;s performance against Bitcoin and Ethereum (normalized to show percentage change).
              </Text>
              {comparisonData.length > 0 ? (
                <>
                  <LineChart
                    className="h-80"
                    data={comparisonData}
                    index="date"
                    categories={['bitcoin', 'ethereum', coinId].filter(id => comparisonData[0][id] !== undefined)}
                    colors={["amber", "emerald", "blue"]}
                    valueFormatter={value => formatPercentage(value)}
                    showLegend={false}
                    showGridLines={true}
                    showAnimation={true}
                    curveType="natural"
                  />
                  <div className="mt-4">
                    <Legend
                      categories={[
                        'Bitcoin',
                        'Ethereum',
                        coinName
                      ]}
                      colors={["amber", "emerald", "blue"]}
                    />
                  </div>
                </>
              ) : (
                <Text>No comparison data available.</Text>
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  );
}
