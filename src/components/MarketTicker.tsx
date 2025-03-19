import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockData = [
  { symbol: 'BTC', price: 52000, change: 2.5 },
  { symbol: 'ETH', price: 2800, change: -1.2 },
  { symbol: 'AAPL', price: 175, change: 0.8 },
  { symbol: 'TSLA', price: 780, change: -2.1 },
  { symbol: 'GOOGL', price: 2800, change: 1.5 },
  { symbol: 'BTC', price: 52000, change: 2.5 },
  { symbol: 'ETH', price: 2800, change: -1.2 },
  { symbol: 'AAPL', price: 175, change: 0.8 },
  { symbol: 'TSLA', price: 780, change: -2.1 },
  { symbol: 'GOOGL', price: 2800, change: 1.5 },
  { symbol: 'BTC', price: 52000, change: 2.5 },
  { symbol: 'ETH', price: 2800, change: -1.2 },
  { symbol: 'AAPL', price: 175, change: 0.8 },
  { symbol: 'TSLA', price: 780, change: -2.1 },
  { symbol: 'GOOGL', price: 2800, change: 1.5 },
  { symbol: 'BTC', price: 52000, change: 2.5 },
  { symbol: 'ETH', price: 2800, change: -1.2 },
  { symbol: 'AAPL', price: 175, change: 0.8 },
  { symbol: 'TSLA', price: 780, change: -2.1 },
  { symbol: 'GOOGL', price: 2800, change: 1.5 },
];

const MarketTicker = () => {
  const [data, setData] = useState(mockData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) =>
        prevData.map((item) => ({
          ...item,
          price: item.price * (1 + (Math.random() - 0.5) * 0.002),
          change: item.change + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-black py-2 border-b border-gray-700">
      <div className="flex space-x-8 whitespace-nowrap animate-marquee">
        {data.map((item) => (
          <div key={item.symbol} className="flex items-center space-x-2 text-sm text-white px-4">
            <span className="font-semibold">{item.symbol}</span>
            <span className="text-gray-300">${item.price.toFixed(2)}</span>
            <span className={`flex items-center ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(item.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>
        {`
          @keyframes marquee {
            from { transform: translateX(20%); }
            to { transform: translateX(-100%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 30s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default MarketTicker;
