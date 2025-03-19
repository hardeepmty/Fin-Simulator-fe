
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSimulation } from '@/context/SimulationContext';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { CreditCard, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PortfolioSummary: React.FC = () => {
  const { virtualCurrency, socialStatus, stocks, assets } = useSimulation();
  
  // Calculate total portfolio value
  const stocksValue = stocks.reduce((total, stock) => total + (stock.price * stock.quantity), 0);
  const assetsValue = assets.filter(asset => asset.owned).reduce((total, asset) => total + asset.price, 0);
  const totalValue = virtualCurrency + stocksValue + assetsValue;
  
  // Calculate daily earnings
  const dailyEarnings = assets
    .filter(asset => asset.owned)
    .reduce((total, asset) => total + (asset.price * (asset.dailyReturn / 100)), 0);
  
  // Stats data
  const stats = [
    {
      name: 'Total Portfolio',
      value: formatCurrency(totalValue),
      icon: BarChart3,
      color: 'text-fin-blue',
      bgColor: 'bg-gradient-to-br from-fin-blue/10 to-fin-blue/5',
      borderColor: 'border-fin-blue/20',
    },
    {
      name: 'Daily Earnings',
      value: formatCurrency(dailyEarnings),
      change: '+2.5%',
      icon: TrendingUp,
      color: 'text-fin-success',
      bgColor: 'bg-gradient-to-br from-fin-success/10 to-fin-success/5', 
      borderColor: 'border-fin-success/20',
    },
    {
      name: 'Available Cash',
      value: formatCurrency(virtualCurrency),
      icon: CreditCard,
      color: 'text-indigo-500',
      bgColor: 'bg-gradient-to-br from-indigo-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/20',
    },
    {
      name: 'Status Points',
      value: formatNumber(socialStatus),
      icon: Award,
      color: 'text-amber-500',
      bgColor: 'bg-gradient-to-br from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.name} 
          className={cn(
            "flex flex-col justify-between p-6 backdrop-blur-sm border",
            stat.bgColor,
            stat.borderColor,
            "hover:shadow-md transition-all duration-300"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">{stat.name}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <Badge variant="outline" className={cn("mt-1 bg-fin-success/10 text-fin-success", stat.color)}>
                  {stat.change}
                </Badge>
              )}
            </div>
            <div className={cn("p-2.5 rounded-full", stat.bgColor)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PortfolioSummary;
