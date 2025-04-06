'use client';

import { CryptoData } from '@/lib/crypto';
import { RiSearchLine, RiStarFill, RiStarLine } from '@remixicon/react';
import { Badge, Card, Text, TextInput } from '@tremor/react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { MarketOverviewChart } from './MarketOverviewChart';

export function CryptoOverview() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Fetch crypto data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/crypto?limit=50');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up polling for real-time updates (every 60 seconds)
    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('cryptoFavorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('cryptoFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  // Toggle favorite status for a coin
  const toggleFavorite = (coinId: string) => {
    setFavorites(prev => {
      if (prev.includes(coinId)) {
        return prev.filter(id => id !== coinId);
      } else {
        return [...prev, coinId];
      }
    });
  };

  // Handle coin selection
  const handleSelectCoin = (coinId: string) => {
    setSelectedCoinId(coinId);
  };

  // Get the selected coin data
  const selectedCoin = useMemo(() => {
    return cryptoData.find(coin => coin.id === selectedCoinId) || null;
  }, [cryptoData, selectedCoinId]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Filter cryptocurrencies based on search query and favorites
  const filteredCryptoData = useMemo(() => {
    let filtered = cryptoData;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(coin =>
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query)
      );
    }

    // Apply favorites filter
    if (showOnlyFavorites) {
      filtered = filtered.filter(coin => favorites.includes(coin.id));
    }

    return filtered;
  }, [cryptoData, searchQuery, showOnlyFavorites, favorites]);

  // Get visible data based on current visible count
  const visibleData = useMemo(() => {
    return filteredCryptoData.slice(0, visibleCount);
  }, [filteredCryptoData, visibleCount]);

  // Load more cryptocurrencies
  const loadMore = () => {
    setVisibleCount(prevCount => Math.min(prevCount + 10, filteredCryptoData.length));
  };

  // Render chart area
  const renderChartArea = () => {
    if (!selectedCoin) return (
      <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Text>Select a cryptocurrency to view chart</Text>
      </div>
    );

    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          {selectedCoin.image && (
            <img
              src={selectedCoin.image}
              alt={selectedCoin.name}
              className="w-8 h-8"
            />
          )}
          <div>
            <Text className="text-xl font-bold">{selectedCoin.name}</Text>
            <Text className="text-gray-500">{selectedCoin.symbol.toUpperCase()}</Text>
          </div>
          <div className="ml-auto">
            <Text className="text-2xl font-bold">{formatCurrency(selectedCoin.current_price)}</Text>
            <Badge color={selectedCoin.price_change_percentage_24h >= 0 ? 'emerald' : 'red'}>
              {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
              {selectedCoin.price_change_percentage_24h.toFixed(2)}%
            </Badge>
          </div>
        </div>

        <div className="h-64">
          <MarketOverviewChart selectedCoinId={selectedCoinId} allCoins={cryptoData} />
        </div>
      </Card>
    );
  };

  // Render crypto list
  const renderCryptoList = () => {
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
        <div className="mb-4 space-y-2">
          <TextInput
            icon={RiSearchLine}
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="favorites-toggle"
                checked={showOnlyFavorites}
                onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="favorites-toggle" className="text-sm font-medium">
                Show only favorites
              </label>
            </div>

            <div className="text-xs text-gray-500">
              {favorites.length} favorites
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {visibleData.map((coin) => (
            <div
              key={coin.id}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedCoinId === coin.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              onClick={() => handleSelectCoin(coin.id)}
            >
              <div className="flex items-center">
                <button
                  className="mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(coin.id);
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

          {visibleCount < filteredCryptoData.length && (
            <button
              className="w-full py-2 text-center text-sm text-blue-500 hover:text-blue-700"
              onClick={loadMore}
            >
              Load more ({visibleCount} of {filteredCryptoData.length})
            </button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-[#151924] rounded-lg border border-[#2d3748] overflow-hidden h-[600px]">
          {renderChartArea()}
        </div>
      </div>

      <div className="lg:col-span-1 h-[600px]">
        {renderCryptoList()}
      </div>
    </div>
  );
}
