'use client';

import { useState } from 'react';
import { CryptoData } from '@/lib/crypto';
import Image from 'next/image';
import { TextInput, Card, Badge } from '@tremor/react';
import { RiSearchLine, RiStarFill, RiStarLine } from '@remixicon/react';

interface CompactCryptoListProps {
  data: CryptoData[];
  isLoading: boolean;
  favorites: string[];
  onToggleFavorite: (coinId: string) => void;
  onSelectCoin: (coinId: string) => void;
  selectedCoinId: string;
}

export function CompactCryptoList({
  data,
  isLoading,
  favorites,
  onToggleFavorite,
  onSelectCoin,
  selectedCoinId
}: CompactCryptoListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Filter cryptocurrencies based on search query
  const filteredData = data.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get visible data
  const visibleData = filteredData.slice(0, visibleCount);

  // Load more items
  const loadMore = () => {
    setVisibleCount(prevCount => Math.min(prevCount + 10, filteredData.length));
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <TextInput
          icon={RiSearchLine}
          placeholder="Search cryptocurrencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
        {visibleData.map((coin) => (
          <div 
            key={coin.id}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
              selectedCoinId === coin.id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
            onClick={() => onSelectCoin(coin.id)}
          >
            <div className="flex items-center">
              <button
                className="mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(coin.id);
                }}
              >
                {favorites.includes(coin.id) ? (
                  <RiStarFill className="text-yellow-500 h-4 w-4" />
                ) : (
                  <RiStarLine className="h-4 w-4" />
                )}
              </button>
              
              <div className="flex items-center">
                {coin.image && (
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                )}
                <div>
                  <div className="font-medium">{coin.name}</div>
                  <div className="text-xs text-gray-500">{coin.symbol.toUpperCase()}</div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">{formatCurrency(coin.current_price)}</div>
              <Badge color={coin.price_change_percentage_24h >= 0 ? 'emerald' : 'red'} size="xs">
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </Badge>
            </div>
          </div>
        ))}
        
        {visibleCount < filteredData.length && (
          <button 
            className="w-full py-2 text-center text-sm text-blue-500 hover:text-blue-700"
            onClick={loadMore}
          >
            Load more ({visibleCount} of {filteredData.length})
          </button>
        )}
      </div>
    </Card>
  );
}
