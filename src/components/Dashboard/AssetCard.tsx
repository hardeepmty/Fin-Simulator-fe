
import React from 'react';
import { Asset } from '@/context/SimulationContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: Asset;
  onBuy: (assetId: string) => void;
  onSell: (assetId: string) => void;
  disabled?: boolean;
  context?: "dashboard" | "marketplace";  // New prop
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onBuy, onSell, disabled = false, context = "marketplace" }) => {
  const isOwned = context === "dashboard"; 
    return (
    <Card className="p-6 flex flex-col h-full backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-muted">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
        <Badge
          variant="outline"
          className="absolute top-2 right-2 backdrop-blur-md bg-background/60 border border-border/50"
        >
          {asset.type}
        </Badge>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-1">{asset.name}</h3>
        
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="outline" className="flex items-center bg-fin-success/10 text-fin-success border-fin-success/20">
            <TrendingUp size={12} className="mr-1" />
            {asset.dailyReturn} VC daily
          </Badge>
          <Badge variant="outline" className="flex items-center bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Award size={12} className="mr-1" />
            {asset.statusPoints} SP
          </Badge>
        </div>
        
        <div className="mb-4">
          <div className="text-2xl font-bold">{formatCurrency(asset.price)}</div>
        </div>
      </div>

      {isOwned ? (
        <Button
          variant="outline"
          onClick={() => onSell(asset.id)}
          disabled={disabled}
          className="w-full"
        >
          Sell Asset
        </Button>
      ) : (
        <Button
          variant="default"
          onClick={() => onBuy(asset.id)}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        >
          Purchase Asset
        </Button>
      )}
    </Card>
  );
};

export default AssetCard;
