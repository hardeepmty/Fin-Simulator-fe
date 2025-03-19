import React, { useState } from "react";
import { Stock } from "@/context/SimulationContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatChange } from "@/utils/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockCardProps {
  stock: Stock;
  onBuy: (stockId: string, quantity: number) => void;
  onSell: (stockId: string, quantity: number) => void;
  disabled?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onBuy, onSell, disabled = false }) => {
  const [quantity, setQuantity] = useState(1);
  const changeFormat = formatChange(stock.change);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full border border-border shadow-lg rounded-xl bg-muted/50">
      {/* Stock Information */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{stock.name}</h3>
            <div className="text-sm text-muted-foreground">{stock.symbol}</div>
          </div>
          <div className={`flex items-center ${changeFormat.className}`}>
            {stock.change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            <span>{changeFormat.text}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-2xl font-bold">{formatCurrency(stock.price)}</div>
          {stock.quantity > 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              Owned: {stock.quantity} shares ({formatCurrency(stock.price * stock.quantity)})
            </div>
          )}
        </div>
      </div>

      {/* Quantity Input & Buttons */}
      <div className="mt-auto">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1/3">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full p-2 border border-input rounded-md bg-background text-center"
            />
          </div>
          <div className="w-2/3 flex space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => onBuy(stock.id, quantity)}
              disabled={disabled}
              className="w-full"
            >
              Buy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSell(stock.id, quantity)}
              disabled={disabled || stock.quantity === 0}
              className="w-full"
            >
              Sell
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StockCard;
