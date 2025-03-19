import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSimulation } from "@/context/SimulationContext";
import Header from "@/components/Layout/Header";
import Navigation from "@/components/Layout/Navigation";
import { useNavigate } from "react-router-dom";
import PortfolioSummary from "@/components/Dashboard/PortfolioSummary";
import StockCard from "@/components/Dashboard/StockCard";
import AssetCard from "@/components/Dashboard/AssetCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, TrendingUp } from "lucide-react";

// Define Stock type for API response
interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  previousClose: number;
}

const Dashboard = () => {
  const { user, assets, bettingEvents, buyStock, sellStock, buyAsset, sellAsset, virtualCurrency } = useSimulation();
  const { toast } = useToast();
  const [topStocks, setTopStocks] = useState<Stock[]>([]);
  const [userStocks, setUserStocks] = useState(user?.stocks || []); 
  const navigate = useNavigate() ;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); 
    }
  }, [navigate]);
  
  // Fetch Top Performing Stocks
  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/stocks/top-companies");
        setTopStocks(res.data); // Store API response in state
      } catch (error) {
        console.error("Error fetching top stocks:", error);
      }
    };

    fetchTopStocks();
  }, []);

  // Convert user.stocks to StockCard format
  const ownedStocks = user?.stocks
    ? user.stocks
        .filter((stock) => stock.shares > 0)
        .map((stock) => ({
          id: stock._id,
          name: stock.symbol,
          symbol: stock.symbol,
          price: stock.purchasePrice,
          change: 0,
          quantity: stock.shares,
        }))
    : [];

    const ownedAssets = user?.assets
    ? user.assets
        .map((asset) => ({
          id: asset._id,
          name: asset.name,
          category: asset.category,
          price: asset.price,
          dailyReturn: asset.dailyReturn,
          statusPoints: asset.statusPoints,
          purchaseDate: asset.purchaseDate
        }))
    : [];

    console.log(ownedAssets)
    
  const recentEvents = bettingEvents.slice(0, 3);

  // Handle Sell Stock API
const handleSellStock = async (stockId: string, quantity: number) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You need to log in to sell stocks.",
        variant: "destructive",
      });
      return;
    }

    // Call the sell stock API
    const res = await axios.post(
      "http://localhost:8000/api/stockex/sell-stock",
      { symbol: stockId, amount: quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data) {
      toast({
        title: "Stock Sold",
        description: `Successfully sold ${quantity} shares of ${stockId}.`,
      });

      // Update stocks in UI
      const updatedUser = res.data.user;
      setUserStocks(updatedUser.stocks);
    }
  } catch (error: any) {
    console.error("Error selling stock:", error);
    toast({
      title: "Sell Failed",
      description: error.response?.data?.error || "Transaction failed. Please try again.",
      variant: "destructive",
    });
  }
};


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />

      <main className="pt-24 pb-20 md:pb-8 md:pl-64 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your portfolio and monitor your investments</p>
          </div>

          {/* Portfolio Summary */}
          <section className="mb-8 animate-fade-in">
            <PortfolioSummary />
          </section>

          {/* Top Performing Stocks (Fetched from API) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-fin-blue" />
                Top Performing Stocks
              </h2>
            </div>

            {topStocks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topStocks.slice(0,4).map((stock) => (
                  <div key={stock.symbol} className="h-full flex">
                    <StockCard
                      stock={{
                        id: stock.symbol,
                        name: stock.name,
                        symbol: stock.symbol,
                        price: stock.currentPrice,
                        change: stock.change,
                        quantity: 0, // Default as these are market stocks, not user-owned
                      }}
                      onBuy={() => {}}
                      onSell={() => {}}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">Loading top stocks...</p>
            )}
          </section>


          {/* My Assets (Owned Stocks & Assets) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Assets</h2>
            </div>

            {ownedStocks.length > 0 || ownedAssets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Owned Stocks */}
                {ownedStocks.map((stock) => (
                  <StockCard key={stock.id} stock={stock} onBuy={buyStock} onSell={() => handleSellStock(stock.symbol, stock.quantity)} />
                ))}

                {/* Owned Assets */}
                {ownedAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onBuy={buyAsset} onSell={sellAsset} context="dashboard"/>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50 text-center py-12">
                <p className="text-muted-foreground mb-2">You don't own any assets or stocks yet</p>
                <p>Visit the Marketplace to purchase assets</p>
              </Card>
            )}
          </section>

          {/* Upcoming Events */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-fin-blue" />
                Upcoming Betting Events
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentEvents.map((event) => (
                <Card key={event.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={event.type === "Sports" ? "default" : "outline"}>{event.type}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(event.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                  <div className="text-sm">
                    <div className="font-medium mb-1">Betting options:</div>
                    <ul className="space-y-1">
                      {event.options.map((option) => (
                        <li key={option.id} className="flex justify-between">
                          <span>{option.name}</span>
                          <span className="font-medium">{option.odds}x</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 text-sm font-medium">Pool: {formatCurrency(event.totalPool)}</div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
