'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  AreaChart,
  Grid,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Select,
  SelectItem,
  Flex,
  Metric,
  Badge,
  ProgressBar
} from '@tremor/react';
import { CryptoData } from '@/lib/crypto';

interface CryptoPriceChartsProps {
  data: CryptoData[];
  isLoading: boolean;
  timeRange: number;
}

interface ChartData {
  date: string;
  price: number;
}

export function CryptoPriceCharts({ 
  data, 
  isLoading, 
  timeRange 
}: CryptoPriceChartsProps) {
  const [selectedCoin, setSelectedCoin] = useState<string>('bitcoin');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [selectedCoinData, setSelectedCoinData] = useState<CryptoData | null>(null);

  // Fetch historical data for the selected coin
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!selectedCoin) return;
      
      try {
        setIsChartLoading(true);
        const response = await fetch(`/api/crypto/historical?coinId=${selectedCoin}&days=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const data = await response.json();
        
        if (data && data.prices) {
          // Format data for the chart
          const formattedData = data.prices.map((item: [number, number]) => {
            const date = new Date(item[0]);
            return {
              date: date.toLocaleDateString(),
              price: item[1],
            };
          });
          
          setChartData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setChartData([]);
      } finally {
        setIsChartLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [selectedCoin, timeRange]);

  // Update selected coin data when data or selected coin changes
  useEffect(() => {
    if (data && data.length > 0) {
      const coinData = data.find(coin => coin.id === selectedCoin);
      setSelectedCoinData(coinData || null);
    }
  }, [data, selectedCoin]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format date is handled by Tremor chart component

  if (isLoading) {
    return (
      <Card className="p-6">
        <Title>Loading crypto data...</Title>
        <ProgressBar value={60} className="mt-4" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <Title>No crypto data available</Title>
        <Text>Please try again later.</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Flex>
          <Title>Price Chart</Title>
          <Select 
            value={selectedCoin} 
            onValueChange={setSelectedCoin}
            className="max-w-xs"
          >
            {data.map((coin) => (
              <SelectItem key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol.toUpperCase()})
              </SelectItem>
            ))}
          </Select>
        </Flex>

        {selectedCoinData && (
          <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mt-4">
            <Card decoration="top" decorationColor="blue">
              <Text>Current Price</Text>
              <Metric>{formatCurrency(selectedCoinData.current_price)}</Metric>
            </Card>
            
            <Card decoration="top" decorationColor={selectedCoinData.price_change_percentage_24h >= 0 ? 'emerald' : 'red'}>
              <Text>24h Change</Text>
              <Metric>
                <Badge color={selectedCoinData.price_change_percentage_24h >= 0 ? 'emerald' : 'red'}>
                  {selectedCoinData.price_change_percentage_24h >= 0 ? '+' : ''}
                  {selectedCoinData.price_change_percentage_24h.toFixed(2)}%
                </Badge>
              </Metric>
            </Card>
            
            <Card decoration="top" decorationColor="indigo">
              <Text>Volume (24h)</Text>
              <Metric>{formatCurrency(selectedCoinData.total_volume)}</Metric>
            </Card>
            
            <Card decoration="top" decorationColor="amber">
              <Text>Market Cap</Text>
              <Metric>{formatCurrency(selectedCoinData.market_cap)}</Metric>
            </Card>
          </Grid>
        )}

        {isChartLoading ? (
          <div className="mt-6">
            <Text>Loading chart data...</Text>
            <ProgressBar value={60} className="mt-2" />
          </div>
        ) : chartData.length > 0 ? (
          <AreaChart
            className="h-80 mt-6"
            data={chartData}
            index="date"
            categories={["price"]}
            colors={["blue"]}
            valueFormatter={value => formatCurrency(value)}
            showLegend={false}
            showGridLines={false}
            showAnimation={true}
            curveType="natural"
          />
        ) : (
          <Text className="mt-6">No historical data available for this time range.</Text>
        )}
      </Card>
      
      <TabGroup>
        <TabList>
          <Tab>Price</Tab>
          <Tab>Volume</Tab>
          <Tab>Market Cap</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Card className="mt-4">
              <Title>Price Analysis</Title>
              <Text className="mt-2">
                This chart shows the price movement of {selectedCoinData?.name} over the selected time period.
                {selectedCoinData && selectedCoinData.price_change_percentage_24h >= 0 
                  ? ' The price has been trending upward in the last 24 hours.'
                  : ' The price has been trending downward in the last 24 hours.'
                }
              </Text>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-4">
              <Title>Volume Analysis</Title>
              <Text className="mt-2">
                Trading volume indicates market activity and liquidity. 
                {selectedCoinData && ` ${selectedCoinData.name} has a 24-hour trading volume of ${formatCurrency(selectedCoinData.total_volume)}.`}
              </Text>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card className="mt-4">
              <Title>Market Cap Analysis</Title>
              <Text className="mt-2">
                Market capitalization represents the total value of all coins in circulation.
                {selectedCoinData && ` ${selectedCoinData.name} has a market cap of ${formatCurrency(selectedCoinData.market_cap)}.`}
              </Text>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
