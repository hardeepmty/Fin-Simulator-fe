
import React, { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Landmark, DollarSign, AlertCircle, ArrowDownUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const Loans = () => {
  const { virtualCurrency, assets, stocks, incrementVirtualCurrency,user } = useSimulation();
  const { toast } = useToast();
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [loanTerm, setLoanTerm] = useState<number>(7);
  
  const stocksValue = user?.stocks?.reduce(
    (total, stock) => total + stock.shares * stock.purchasePrice,
    0
  ) || 0;
  
  console.log("userStocks:", user.stocks);  // Calculate total asset value for collateral
  //const stocksValue = stocks.reduce((total, stock) => total + (stock.price * stock.quantity), 0);
  const assetsValue = assets.filter(asset => asset.owned).reduce((total, asset) => total + asset.price, 0);
  const totalCollateralValue = stocksValue + assetsValue;
  const maxLoanAmount = Math.floor(totalCollateralValue * 0.6); // 60% of collateral value
  
  // Calculate loan details
  const interestRate = 5 + (loanAmount / maxLoanAmount) * 10; // 5-15% based on loan size
  const interestAmount = loanAmount * (interestRate / 100) * (loanTerm / 30); // monthly interest
  const totalRepayment = loanAmount + interestAmount;
  
  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setLoanAmount(Math.min(value, maxLoanAmount));
    } else {
      setLoanAmount(0);
    }
  };
  
  const handleLoanTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoanTerm(parseInt(e.target.value));
  };
  
  const handleTakeLoan = () => {
    if (loanAmount <= 0) {
      toast({
        title: "Invalid loan amount",
        description: "Please enter a valid loan amount",
        variant: "destructive"
      });
      return;
    }
    
    if (loanAmount > maxLoanAmount) {
      toast({
        title: "Insufficient collateral",
        description: `Your maximum loan amount is ${formatCurrency(maxLoanAmount)}`,
        variant: "destructive"
      });
      return;
    }
    
    incrementVirtualCurrency(loanAmount);
    
    toast({
      title: "Loan approved",
      description: `${formatCurrency(loanAmount)} has been added to your account`,
    });
    
    // Reset form
    setLoanAmount(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      
      <main className="pt-24 pb-20 md:pb-8 md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Loan Center</h1>
            <p className="text-muted-foreground">Apply for loans using your assets as collateral</p>
          </div>
          
          <div className="mb-8 p-6 backdrop-blur-md bg-gradient-to-r from-fin-blue/5 to-fin-light-blue/5 rounded-xl border border-fin-blue/10">
            <div className="flex items-start md:items-center flex-col md:flex-row">
              <div className="mr-6 mb-4 md:mb-0">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-fin-blue/10 text-fin-blue">
                  <Landmark size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">How Loans Work</h2>
                <p className="text-muted-foreground">
                  Leverage your existing assets and stocks as collateral to secure loans. If you're unable to repay, 
                  your assets will be automatically liquidated to cover the debt. The maximum loan amount is 60% of your collateral value.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loan Application Form */}
            <div className="md:col-span-2">
              <Card className="p-6 backdrop-blur-sm border border-border/50">
                <h2 className="text-xl font-semibold mb-4">Apply for a Loan</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium">Loan Amount</label>
                    <span className="text-sm text-muted-foreground">
                      Max: {formatCurrency(maxLoanAmount)}
                    </span>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="number"
                      min="0"
                      max={maxLoanAmount}
                      value={loanAmount}
                      onChange={handleLoanAmountChange}
                      className="w-full pl-9 pr-4 py-2 border border-input rounded-md bg-background/60 backdrop-blur-sm"
                      placeholder="Enter loan amount"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Loan Term</label>
                  <select
                    value={loanTerm}
                    onChange={handleLoanTermChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background/60 backdrop-blur-sm"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
                
                <div className="bg-muted/30 backdrop-blur-sm p-4 rounded-md mb-6 border border-border/50">
                  <h3 className="font-medium mb-3">Loan Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span className="font-medium">{interestRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Amount:</span>
                      <span className="font-medium">{formatCurrency(interestAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Repayment:</span>
                      <span className="font-medium">{formatCurrency(totalRepayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collateral Required:</span>
                      <span className="font-medium">{formatCurrency(loanAmount * (10/6))}</span>
                    </div>
                  </div>
                </div>
                
                {totalCollateralValue === 0 && (
                  <div className="flex items-start p-4 mb-6 rounded-md bg-fin-error/5 text-fin-error border border-fin-error/20">
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">No Collateral Available</h4>
                      <p className="text-sm mt-1">
                        You need to own stocks or assets to use as collateral for a loan.
                        Visit the Marketplace or Investments page to acquire assets.
                      </p>
                    </div>
                  </div>
                )}
                
                <Button
                  className={cn(
                    "w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                    (loanAmount <= 0 || loanAmount > maxLoanAmount || totalCollateralValue === 0) && "opacity-50"
                  )}
                  disabled={loanAmount <= 0 || loanAmount > maxLoanAmount || totalCollateralValue === 0}
                  onClick={handleTakeLoan}
                >
                  Apply for Loan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </div>
            
            {/* Collateral Overview */}
            <div>
              <Card className="p-6 backdrop-blur-sm border border-border/50">
                <h2 className="text-lg font-semibold mb-4">Your Collateral</h2>
                
                <div className="space-y-4">
                  {/* Stocks Value */}
                  <div className="bg-muted/30 backdrop-blur-sm p-3 rounded-md border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Stocks Value</span>
                      <Badge variant={stocksValue > 0 ? "default" : "outline"}>
                        {formatCurrency(stocksValue)}
                      </Badge>
                    </div>

                    {user?.stocks?.length > 0 ? (
                      <ul className="text-sm space-y-1.5">
                        {user.stocks.map((stock) => (
                          <li key={stock._id} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {stock.symbol} ({stock.shares} shares)
                            </span>
                            <span>{formatCurrency(stock.shares * stock.purchasePrice)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No stocks owned</p>
                    )}
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 mt-4 backdrop-blur-sm border border-border/50 bg-background/60">
                <h2 className="text-lg font-semibold mb-2">Active Loans</h2>
                <p className="text-sm text-muted-foreground">
                  You don't have any active loans at the moment.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Loans;
