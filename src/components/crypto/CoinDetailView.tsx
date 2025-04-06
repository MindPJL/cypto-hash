'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Flex,
  Metric,
  Badge,
  Button,
  Select,
  SelectItem,
  Grid
} from '@tremor/react';
import { CryptoData } from '@/lib/crypto';
import Image from 'next/image';
import { RiArrowLeftLine, RiStarFill, RiStarLine } from '@remixicon/react';
import { PriceAnalysisCharts } from './PriceAnalysisCharts';
import { TechnicalIndicators } from './TechnicalIndicators';

interface CoinDetailViewProps {
  coinId: string;
  onClose: () => void;
  onToggleFavorite: (coinId: string) => void;
  favorites: string[];
  allCoins: CryptoData[];
}



export function CoinDetailView({ 
  coinId, 
  onClose, 
  onToggleFavorite,
  favorites,
  allCoins
}: CoinDetailViewProps) {
  const [timeRange, setTimeRange] = useState<number>(7);

  const [coinData, setCoinData] = useState<CryptoData | null>(null);

  // Find the coin data from the allCoins array
  useEffect(() => {
    const coin = allCoins.find(c => c.id === coinId);
    if (coin) {
      setCoinData(coin);
    }
  }, [coinId, allCoins]);



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

  if (!coinData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Flex justifyContent="between" alignItems="center" className="mb-6">
          <Flex alignItems="center" className="gap-2">
            <Button 
              variant="light" 
              icon={RiArrowLeftLine} 
              onClick={onClose}
              className="mr-2"
            >
              Back
            </Button>
            {coinData.image && (
              <Image
                src={coinData.image}
                alt={coinData.name}
                width={32}
                height={32}
                className="mr-2"
              />
            )}
            <Title>{coinData.name}</Title>
            <Text className="text-gray-500">({coinData.symbol.toUpperCase()})</Text>
          </Flex>
          <Button
            variant="light"
            size="xs"
            className="p-1"
            onClick={() => onToggleFavorite(coinId)}
          >
            {favorites.includes(coinId) ? (
              <RiStarFill className="text-yellow-500 h-5 w-5" />
            ) : (
              <RiStarLine className="h-5 w-5" />
            )}
          </Button>
        </Flex>

        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mb-6">
          <Card decoration="top" decorationColor="blue">
            <Text>Current Price</Text>
            <Metric>{formatCurrency(coinData.current_price)}</Metric>
          </Card>
          
          <Card decoration="top" decorationColor={coinData.price_change_percentage_24h >= 0 ? 'emerald' : 'red'}>
            <Text>24h Change</Text>
            <Metric>
              <Badge color={coinData.price_change_percentage_24h >= 0 ? 'emerald' : 'red'}>
                {coinData.price_change_percentage_24h >= 0 ? '+' : ''}
                {coinData.price_change_percentage_24h.toFixed(2)}%
              </Badge>
            </Metric>
          </Card>
          
          <Card decoration="top" decorationColor="indigo">
            <Text>Volume (24h)</Text>
            <Metric>{formatLargeNumber(coinData.total_volume)}</Metric>
          </Card>
          
          <Card decoration="top" decorationColor="amber">
            <Text>Market Cap</Text>
            <Metric>{formatLargeNumber(coinData.market_cap)}</Metric>
          </Card>
        </Grid>

        <Flex justifyContent="between" alignItems="center" className="mb-4">
          <Title>Price Chart</Title>
          <Select 
            value={timeRange.toString()} 
            onValueChange={(value) => setTimeRange(parseInt(value))}
            className="max-w-xs"
          >
            <SelectItem value="1">24 Hours</SelectItem>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
            <SelectItem value="365">1 Year</SelectItem>
          </Select>
        </Flex>

        <PriceAnalysisCharts 
          coinId={coinId} 
          timeRange={timeRange} 
          coinName={coinData.name} 
        />
      </Card>

      <Card className="p-4">
        <Title className="mb-4">About {coinData.name}</Title>
        <Text>
          {coinData.name} is currently ranked #{coinData.market_cap_rank} by market cap.
          The current price is {formatCurrency(coinData.current_price)} with a 24-hour trading volume of {formatLargeNumber(coinData.total_volume)}.
          {coinData.price_change_percentage_24h >= 0 
            ? ` The price has increased by ${coinData.price_change_percentage_24h.toFixed(2)}% in the last 24 hours.`
            : ` The price has decreased by ${Math.abs(coinData.price_change_percentage_24h).toFixed(2)}% in the last 24 hours.`
          }
        </Text>
      </Card>
      
      <TechnicalIndicators 
        coinId={coinId}
        coinName={coinData.name}
        currentPrice={coinData.current_price}
      />
    </div>
  );
}
