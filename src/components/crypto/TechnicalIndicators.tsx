'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Grid, 
  Flex,
  Metric,
  Badge,
  ProgressBar
} from '@tremor/react';

interface TechnicalIndicatorsProps {
  coinId: string;
  coinName: string;
  currentPrice: number;
}

interface IndicatorData {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  description: string;
}

interface PriceLevel {
  name: string;
  price: number;
  type: 'support' | 'resistance';
}

export function TechnicalIndicators({ 
  coinId, 
  coinName,
  currentPrice
}: TechnicalIndicatorsProps) {
  const [indicators, setIndicators] = useState<IndicatorData[]>([]);
  const [priceLevels, setPriceLevels] = useState<PriceLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is a simplified mock implementation of technical indicators
    // In a real app, you would calculate these based on historical price data
    // or fetch them from a specialized API
    const calculateIndicators = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Generate mock RSI (Relative Strength Index)
        const rsiValue = Math.floor(Math.random() * 100);
        const rsiSignal = rsiValue > 70 ? 'sell' : rsiValue < 30 ? 'buy' : 'neutral';
        
        // Generate mock MACD (Moving Average Convergence Divergence)
        const macdValue = (Math.random() * 2 - 1).toFixed(2);
        const macdSignal = parseFloat(macdValue) > 0.5 ? 'buy' : parseFloat(macdValue) < -0.5 ? 'sell' : 'neutral';
        
        // Generate mock Bollinger Bands
        const bollingerValue = Math.random();
        const bollingerSignal = bollingerValue > 0.8 ? 'sell' : bollingerValue < 0.2 ? 'buy' : 'neutral';
        
        // Generate mock Moving Averages
        const maValue = (Math.random() * 0.1 + 0.95) * currentPrice;
        const maSignal = maValue > currentPrice ? 'sell' : 'buy';
        
        // Set the indicators
        setIndicators([
          {
            name: 'RSI (14)',
            value: rsiValue,
            signal: rsiSignal,
            description: 'Measures the speed and change of price movements. Values over 70 indicate overbought conditions, while values under 30 indicate oversold conditions.'
          },
          {
            name: 'MACD',
            value: parseFloat(macdValue),
            signal: macdSignal,
            description: 'Shows the relationship between two moving averages of a security\'s price. A positive MACD indicates upward momentum.'
          },
          {
            name: 'Bollinger Bands',
            value: bollingerValue,
            signal: bollingerSignal,
            description: 'Measures volatility. Price near the upper band may indicate overbought conditions, while price near the lower band may indicate oversold conditions.'
          },
          {
            name: 'MA (50)',
            value: maValue,
            signal: maSignal,
            description: '50-day moving average. When price is above MA, it may indicate an uptrend; when below, it may indicate a downtrend.'
          }
        ]);
        
        // Generate mock support and resistance levels
        const supportLevel1 = currentPrice * 0.9;
        const supportLevel2 = currentPrice * 0.8;
        const resistanceLevel1 = currentPrice * 1.1;
        const resistanceLevel2 = currentPrice * 1.2;
        
        setPriceLevels([
          { name: 'Support 1', price: supportLevel1, type: 'support' },
          { name: 'Support 2', price: supportLevel2, type: 'support' },
          { name: 'Resistance 1', price: resistanceLevel1, type: 'resistance' },
          { name: 'Resistance 2', price: resistanceLevel2, type: 'resistance' }
        ]);
        
        setIsLoading(false);
      }, 1000);
    };
    
    calculateIndicators();
  }, [coinId, currentPrice]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <Title>Loading technical indicators...</Title>
        <ProgressBar value={60} className="mt-4" />
      </Card>
    );
  }

  // Generate buy/sell signal summary
  const buySignals = indicators.filter(i => i.signal === 'buy').length;
  const sellSignals = indicators.filter(i => i.signal === 'sell').length;
  const neutralSignals = indicators.filter(i => i.signal === 'neutral').length;
  
  let overallSignal: 'buy' | 'sell' | 'neutral' = 'neutral';
  if (buySignals > sellSignals && buySignals > neutralSignals) {
    overallSignal = 'buy';
  } else if (sellSignals > buySignals && sellSignals > neutralSignals) {
    overallSignal = 'sell';
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Title>Technical Analysis</Title>
        <Text className="mb-4">
          Technical indicators for {coinName} based on recent price action.
        </Text>
        
        <Flex justifyContent="start" alignItems="center" className="mb-4">
          <Text>Overall Signal:</Text>
          <Badge 
            color={overallSignal === 'buy' ? 'emerald' : overallSignal === 'sell' ? 'red' : 'gray'}
            className="ml-2"
          >
            {overallSignal.toUpperCase()}
          </Badge>
          <Text className="ml-4 text-sm text-gray-500">
            ({buySignals} buy, {sellSignals} sell, {neutralSignals} neutral)
          </Text>
        </Flex>
        
        <Grid numItems={1} numItemsSm={2} className="gap-4">
          {indicators.map((indicator) => (
            <Card key={indicator.name} decoration="top" decorationColor={
              indicator.signal === 'buy' ? 'emerald' : 
              indicator.signal === 'sell' ? 'red' : 'gray'
            }>
              <Flex justifyContent="between" alignItems="center">
                <Title>{indicator.name}</Title>
                <Badge 
                  color={
                    indicator.signal === 'buy' ? 'emerald' : 
                    indicator.signal === 'sell' ? 'red' : 'gray'
                  }
                >
                  {indicator.signal.toUpperCase()}
                </Badge>
              </Flex>
              <Metric>
                {indicator.name === 'RSI (14)' ? `${indicator.value.toFixed(1)}` : 
                 indicator.name === 'Bollinger Bands' ? `${(indicator.value * 100).toFixed(1)}%` :
                 indicator.name === 'MACD' ? `${indicator.value}` :
                 formatCurrency(indicator.value)}
              </Metric>
              <Text className="mt-2 text-sm text-gray-500">{indicator.description}</Text>
            </Card>
          ))}
        </Grid>
      </Card>
      
      <Card className="p-4">
        <Title>Support & Resistance Levels</Title>
        <Text className="mb-4">
          Key price levels to watch for {coinName}.
        </Text>
        
        <div className="space-y-4">
          {priceLevels
            .sort((a, b) => b.price - a.price)
            .map((level) => (
              <div key={level.name} className="relative">
                <Flex justifyContent="between" alignItems="center">
                  <Text>{level.name}</Text>
                  <Text className="font-medium">
                    {formatCurrency(level.price)}
                  </Text>
                  <Badge 
                    color={level.type === 'resistance' ? 'red' : 'emerald'}
                    size="xs"
                  >
                    {level.type.toUpperCase()}
                  </Badge>
                </Flex>
                <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 mt-1">
                  <div 
                    className={`h-full ${level.type === 'resistance' ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, 
                        level.type === 'resistance' 
                          ? 100 - ((level.price - currentPrice) / level.price * 100)
                          : 100 - ((currentPrice - level.price) / level.price * 100)
                      ))}%` 
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
        
        <div className="mt-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          <Text className="text-sm text-gray-500">
            <strong>Note:</strong> These indicators are for informational purposes only and should not be considered as financial advice. Always do your own research before making investment decisions.
          </Text>
        </div>
      </Card>
    </div>
  );
}
