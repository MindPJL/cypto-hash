'use client';

import { 
  Card, 
  Table, 
  TableHead, 
  TableHeaderCell, 
  TableBody, 
  TableRow, 
  TableCell,
  Badge,
  Text,
  Flex,
  Button
} from '@tremor/react';
import { CryptoData } from '@/lib/crypto';
import Image from 'next/image';
import { RiStarFill } from '@remixicon/react';

interface FavoritesListProps {
  data: CryptoData[];
  isLoading: boolean;
  favorites: string[];
  onToggleFavorite: (coinId: string) => void;
  onSelectCoin: (coinId: string) => void;
}

export function FavoritesList({ 
  data, 
  isLoading, 
  favorites,
  onToggleFavorite,
  onSelectCoin
}: FavoritesListProps) {
  // Filter data to only show favorites
  const favoriteCoins = data.filter(coin => favorites.includes(coin.id));

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
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        </div>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="p-6">
        <Text>Add cryptocurrencies to your favorites to see them here.</Text>
      </Card>
    );
  }

  if (favoriteCoins.length === 0) {
    return (
      <Card className="p-6">
        <Text>Loading your favorite cryptocurrencies...</Text>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-10"></TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Price</TableHeaderCell>
            <TableHeaderCell>24h Change</TableHeaderCell>
            <TableHeaderCell>Market Cap</TableHeaderCell>
            <TableHeaderCell>Volume (24h)</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {favoriteCoins.map((coin) => (
            <TableRow 
              key={coin.id} 
              className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => onSelectCoin(coin.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="light"
                  size="xs"
                  className="p-1"
                  onClick={() => onToggleFavorite(coin.id)}
                >
                  <RiStarFill className="text-yellow-500 h-5 w-5" />
                </Button>
              </TableCell>
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
                  <Text className="font-medium">{coin.name}</Text>
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
                <Text>{formatLargeNumber(coin.total_volume)}</Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
