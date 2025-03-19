import React, { useEffect, useState } from "react";
import { useSimulation } from "@/context/SimulationContext";
import Header from "@/components/Layout/Header";
import Navigation from "@/components/Layout/Navigation";
import AssetCard from "@/components/Dashboard/AssetCard";
import { formatCurrency } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { Gem } from "lucide-react";
import axios from "axios";

const Marketplace = () => {
  const { user } = useSimulation();
  const { toast } = useToast();
  const [collectibles, setCollectibles] = useState([]);

  useEffect(() => {
    const fetchCollectibles = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/collectible/collectibles");
        const collectiblesWithImages = response.data.map((item) => ({
          ...item,
          imageUrl: `https://picsum.photos/400/300?random=${item.name}`,
        }));
        setCollectibles(collectiblesWithImages);
      } catch (error) {
        console.error("Error fetching collectibles:", error);
      }
    };

    fetchCollectibles();
  }, []);

  const handleBuyAsset = async (collectibleId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in to purchase assets.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/collectible/buy-collectible",
        { collectibleId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Asset purchased",
        description: `Successfully bought ${response.data.user.ownedCollectibles.slice(-1)[0].name}`,
      });

      //fetchUserData(); // Refresh user data
    } catch (error) {
      console.error("Error buying asset:", error);
      toast({
        title: "Purchase failed",
        description: error.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Group collectibles by type
  const collectiblesByType = collectibles.reduce((acc, collectible) => {
    if (!acc[collectible.type]) acc[collectible.type] = [];
    acc[collectible.type].push(collectible);
    return acc;
  }, {} as Record<string, typeof collectibles>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />

      <main className="pt-24 pb-20 md:pb-8 md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Asset Marketplace</h1>
            <p className="text-muted-foreground">
              Purchase high-value assets that provide passive income and status
            </p>
          </div>

          <div className="mb-6 p-6 bg-gradient-to-r from-fin-blue/5 to-fin-light-blue/5 rounded-xl border border-fin-blue/10">
            <div className="flex items-start md:items-center flex-col md:flex-row">
              <div className="mr-6 mb-4 md:mb-0">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-fin-blue/10 text-fin-blue">
                  <Gem size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Assets & Collectibles</h2>
                <p className="text-muted-foreground">
                  Luxury assets provide multiple benefits: daily passive income, status points, and can be sold later in the market.
                  Higher-value assets offer greater percentage returns and status boosts.
                </p>
              </div>
            </div>
          </div>

          {/* Asset categories */}
          {Object.entries(collectiblesByType).map(([type, typeCollectibles]) => (
            <section key={type} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{type}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {typeCollectibles.map((collectible) => (
                  <AssetCard
                    key={collectible._id}
                    asset={{
                      id: collectible._id,
                      name: collectible.name,
                      price: collectible.price,
                      type: collectible.type,
                      dailyReturn: collectible.dailyReturn,
                      statusPoints: collectible.statusPoints,
                      imageUrl: collectible.imageUrl
                    }}
                    onBuy={() => handleBuyAsset(collectible._id)}
                    context="marketplace"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
