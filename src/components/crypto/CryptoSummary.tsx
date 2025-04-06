'use client';

import { 
  Card, 
  Title, 
  Text, 
  Table, 
  TableHead, 
  TableHeaderCell, 
  TableBody, 
  TableRow, 
  TableCell,
  Badge,
  Metric,
  Grid,
  Flex,
  ProgressBar,
  DonutChart
} from '@tremor/react';
import { CryptoData } from '@/lib/crypto';
import Image from 'next/image';

interface CryptoSummaryProps {
  data: CryptoData[];
  isLoading: boolean;
  onCoinSelection: (coinId: string) => void;
  selectedCoins: string[];
}

export function CryptoSummary({ 
  data, 
  isLoading, 
  onCoinSelection, 
  selectedCoins 
}: CryptoSummaryProps) {
  // Calculate total market cap for the donut chart
  const totalMarketCap = data.reduce((sum, coin) => sum + coin.market_cap, 0);
  
  // Format market cap data for the donut chart
  const marketCapData = data.slice(0, 5).map(coin => ({
    name: coin.name,
    value: coin.market_cap,
  }));

  // Format price change data for the summary cards
  const topGainers = [...data]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 3);
    
  const topLosers = [...data]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 3);

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
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        <Card className="p-4">
          <Title>Market Overview</Title>
          <Flex className="mt-4">
            <Text>Total Market Cap (Top 10)</Text>
            <Metric>{formatLargeNumber(totalMarketCap)}</Metric>
          </Flex>
        </Card>
        
        <Card className="p-4">
          <Title>Top Gainers (24h)</Title>
          <div className="mt-4 space-y-2">
            {topGainers.map(coin => (
              <Flex key={coin.id} justifyContent="between" alignItems="center">
                <Text>{coin.name}</Text>
                <Badge color="emerald">+{coin.price_change_percentage_24h.toFixed(2)}%</Badge>
              </Flex>
            ))}
          </div>
        </Card>
        
        <Card className="p-4">
          <Title>Top Losers (24h)</Title>
          <div className="mt-4 space-y-2">
            {topLosers.map(coin => (
              <Flex key={coin.id} justifyContent="between" alignItems="center">
                <Text>{coin.name}</Text>
                <Badge color="red">{coin.price_change_percentage_24h.toFixed(2)}%</Badge>
              </Flex>
            ))}
          </div>
        </Card>
      </Grid>
      
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card className="p-4">
          <Title>Market Cap Distribution</Title>
          <DonutChart
            className="mt-6"
            data={marketCapData}
            category="value"
            index="name"
            valueFormatter={formatLargeNumber}
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
          />
        </Card>
        
        <Card className="p-4">
          <Title>Top Cryptocurrencies</Title>
          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Price</TableHeaderCell>
                <TableHeaderCell>24h Change</TableHeaderCell>
                <TableHeaderCell>Market Cap</TableHeaderCell>
                <TableHeaderCell>Compare</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((coin) => (
                <TableRow key={coin.id}>
                  <TableCell>
                    <Flex alignItems="center">
                      {coin.image && (
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={24}
                          height={24}
                          className="mr-2"
                        />
                      )}
                      <Text>{coin.name}</Text>
                      <Text className="ml-2 text-gray-500">{coin.symbol.toUpperCase()}</Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Text>{formatCurrency(coin.current_price)}</Text>
                  </TableCell>
                  <TableCell>
                    <Badge color={coin.price_change_percentage_24h >= 0 ? 'emerald' : 'red'}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Text>{formatLargeNumber(coin.market_cap)}</Text>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      color={selectedCoins.includes(coin.id) ? 'blue' : 'gray'}
                      className="cursor-pointer"
                      onClick={() => onCoinSelection(coin.id)}
                    >
                      {selectedCoins.includes(coin.id) ? 'Selected' : 'Select'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Grid>
    </div>
  );
}
