import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSimulation } from "@/context/SimulationContext";
import Header from "@/components/Layout/Header";
import Navigation from "@/components/Layout/Navigation";
import StockCard from "@/components/Dashboard/StockCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

// Define Stock interface with full details
interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

const Investments = () => {
  const { buyStock, sellStock, virtualCurrency } = useSimulation();
  const [topStocks, setTopStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedStock, setSearchedStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [userVCBalance, setUserVCBalance] = useState(virtualCurrency); 
  const [userStocks, setUserStocks] = useState<{ symbol: string; shares: number; purchasePrice: number }[]>([]); 
  const { toast } = useToast();

  // Fetch Top Performing Stocks when the page loads
  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/stocks/top-companies");
        setTopStocks(res.data);
      } catch (error) {
        console.error("Error fetching top stocks:", error);
      }
    };

    fetchTopStocks();
  }, []);

  // Fetch Stock Quote when user clicks the search button
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
  
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/stocks/quote?symbol=${searchTerm.toUpperCase()}`);
  
      // ✅ Check if stock is not found (404)
      if (res.status === 404) {
        setSearchedStock(null);
        toast({
          title: "Stock Not Found",
          description: `No stock found for symbol "${searchTerm.toUpperCase()}"`,
          variant: "destructive",
        });
        return;
      }
  
      if (res.data) {
        setSearchedStock({
          symbol: searchTerm.toUpperCase(),
          name: searchTerm.toUpperCase(),
          currentPrice: res.data.c,
          change: res.data.d,
          percentChange: res.data.dp,
          high: res.data.h,
          low: res.data.l,
          open: res.data.o,
          previousClose: res.data.pc,
          timestamp: res.data.t,
        });
      } else {
        setSearchedStock(null);
      }
    } catch (error: any) {
      console.error("Error fetching stock:", error);
      setSearchedStock(null);
  
      // ✅ Also handle 404 error from catch block
      if (error.response?.status === 404) {
        toast({
          title: "Stock Not Found",
          description: `No stock found for symbol "${searchTerm.toUpperCase()}"`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Market Overview Stats
  const gainersCount = topStocks.filter((stock) => stock.change > 0).length;
  const losersCount = topStocks.filter((stock) => stock.change < 0).length;

  // Handle Buy/Sell
  const handleBuyStock = async (stockId: string, quantity: number) => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to log in to buy stocks.",
          variant: "destructive",
        });
        return;
      }

      // Call the buy stock API
      const res = await axios.post(
        "http://localhost:8000/api/stockex/buy-stock",
        {
          symbol: stockId,
          amount: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Send auth token
        }
      );

      // If purchase is successful, update the UI
      if (res.data) {
        toast({
          title: "Stock Purchased",
          description: `Successfully bought ${quantity} shares of ${stockId}.`,
        });

        // Update VC balance and user's stocks
        const updatedUser = res.data.user;
        setUserVCBalance(updatedUser.vcBalance);
        setUserStocks(updatedUser.stocks);

        // Update stocks list
        setTopStocks((prevStocks) =>
          prevStocks.map((stock) =>
            stock.symbol === stockId ? { ...stock } : stock
          )
        );
      }
    } catch (error: any) {
      console.error("Error buying stock:", error);

      toast({
        title: "Purchase Failed",
        description: error.response?.data?.error || "Transaction failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSellStock = (stockId: string, quantity: number) => {
    const stock = searchedStock || topStocks.find((s) => s.symbol === stockId);
    if (!stock) return;

    sellStock(stockId, quantity);
    toast({
      title: "Stock sold",
      description: `Successfully sold ${quantity} shares of ${stock.symbol}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />

      <main className="pt-24 pb-20 md:pb-8 md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Stock Investments</h1>
            <p className="text-muted-foreground">Manage your stock portfolio and monitor market trends</p>
          </div>

          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-fin-blue/5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Market Gainers</div>
                  <div className="text-2xl font-bold">{gainersCount} Stocks</div>
                </div>
                <div className="p-2 rounded-full bg-fin-blue/10">
                  <TrendingUp className="h-5 w-5 text-fin-blue" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-fin-error/5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Market Losers</div>
                  <div className="text-2xl font-bold">{losersCount} Stocks</div>
                </div>
                <div className="p-2 rounded-full bg-fin-error/10">
                  <TrendingDown className="h-5 w-5 text-fin-error" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Fetch Stock */}
          <div className="mb-6 flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search stock by symbol..."
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Stocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedStock ? (
              <StockCard
                key={searchedStock.symbol}
                stock={{
                  id: searchedStock.symbol,
                  name: searchedStock.name,
                  symbol: searchedStock.symbol,
                  price: searchedStock.currentPrice,
                  change: searchedStock.change,
                  percentChange: searchedStock.percentChange,
                  high: searchedStock.high,
                  low: searchedStock.low,
                  previousClose: searchedStock.previousClose,
                  quantity: 0,
                }}
                onBuy={handleBuyStock}
                onSell={handleSellStock}
              />
            ) : (
              topStocks.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  stock={{
                    id: stock.symbol,
                    name: stock.name,
                    symbol: stock.symbol,
                    price: stock.currentPrice,
                    change: stock.change,
                    percentChange: stock.percentChange,
                    high: stock.high,
                    low: stock.low,
                    previousClose: stock.previousClose,
                    quantity: 0,
                  }}
                  onBuy={handleBuyStock}
                  onSell={handleSellStock}
                />
              ))
            )}

            {/* {searchedStock === null && <p className="col-span-full text-center py-6">No stock found</p>} */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Investments;
