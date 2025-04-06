'use client';

import { Button, Card, Title } from '@tremor/react';

interface TimeRangeSelectorProps {
  selectedTimeRange: number;
  onTimeRangeChange: (days: number) => void;
}

export function TimeRangeSelector({ 
  selectedTimeRange, 
  onTimeRangeChange 
}: TimeRangeSelectorProps) {
  const timeRanges = [
    { label: '24h', value: 1 },
    { label: '7d', value: 7 },
    { label: '30d', value: 30 },
    { label: '90d', value: 90 },
    { label: '1y', value: 365 },
  ];

  return (
    <Card className="p-4">
      <Title className="mb-4">Time Range</Title>
      <div className="flex flex-wrap gap-2">
        {timeRanges.map((range) => (
          <Button
            key={range.value}
            variant={selectedTimeRange === range.value ? 'primary' : 'secondary'}
            onClick={() => onTimeRangeChange(range.value)}
            size="xs"
          >
            {range.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
