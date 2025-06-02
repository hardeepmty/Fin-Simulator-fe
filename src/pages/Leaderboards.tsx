import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import LeaderboardCard, { LeaderboardUser } from '@/components/Leaderboard/LeaderboardCard';
import { useSimulation } from '@/context/SimulationContext';
import { Trophy, TrendingUp, Gem, Users, Award, Medal } from 'lucide-react';
import { GET_LEADS} from '../api/leaderboard';

const Leaderboards: React.FC = () => {
  const { user, virtualCurrency } = useSimulation();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(GET_LEADS);
        const data = response.data.data;
        setLeaderboardData(data || []);
        
        // Find current user's rank
        if (user) {
          const userIndex = data.findIndex((u: any) => u._id === user._id);
          setUserRank(userIndex >= 0 ? userIndex + 1 : 0);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  // Safe calculation functions with defaults
  const calculateStocksValue = (stocks?: any[]) => {
    return (stocks || []).reduce((total, stock) => {
      return total + ((stock?.shares || 0) * (stock?.purchasePrice || 0));
    }, 0);
  };

  const calculateAssetsValue = (assets?: any[]) => {
    return (assets || []).reduce((total, asset) => {
      return total + (asset?.price || 0);
    }, 0);
  };

  // Transform API data to match frontend format
  const transformLeaderboardData = (type: 'wealth' | 'stocks' | 'assets'): LeaderboardUser[] => {
    if (!leaderboardData || !leaderboardData.length) return [];
    
    return leaderboardData
      .map(user => ({
        ...user,
        totalWealth: (user.vcBalance || 0) + 
                     calculateStocksValue(user.stocks) + 
                     calculateAssetsValue(user.assets),
        stocksValue: calculateStocksValue(user.stocks),
        assetsValue: calculateAssetsValue(user.assets)
      }))
      .sort((a, b) => {
        if (type === 'wealth') return b.totalWealth - a.totalWealth;
        if (type === 'stocks') return b.stocksValue - a.stocksValue;
        return b.assetsValue - a.assetsValue;
      })
      .map((user, index) => ({
        id: user._id,
        name: user.name || 'Anonymous',
        score: type === 'wealth' ? user.totalWealth : 
               type === 'stocks' ? user.stocksValue : 
               user.assetsValue,
        rank: index + 1,
        change: 'same',
        badge: user.role || 'Player',
      }))
      .slice(0, 5);
  };

  // Get top users for each category
  const wealthLeaders = transformLeaderboardData('wealth');
  const stockLeaders = transformLeaderboardData('stocks');
  const assetLeaders = transformLeaderboardData('assets');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <Navigation />
          <main className="flex-1 p-6 pt-24">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Loading leaderboard...</h1>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1">
        <Navigation />
        
        <main className="flex-1 p-6 pt-24 animate-fade-up ml-60">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center">
              <Trophy className="mr-2 h-6 w-6 text-amber-500 animate-pulse-subtle" />
              Leaderboards
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="glass-panel p-6 rounded-xl flex items-center card-hover-effect animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Total Players</h3>
                  <p className="text-3xl font-bold">{leaderboardData.length.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="glass-panel p-6 rounded-xl flex items-center card-hover-effect animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="bg-green-500/10 p-3 rounded-full mr-4">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Rank</h3>
                  <p className="text-3xl font-bold">{userRank > 0 ? `#${userRank}` : 'Unranked'}</p>
                </div>
              </div>
              
              <div className="glass-panel p-6 rounded-xl flex items-center card-hover-effect animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="bg-purple-500/10 p-3 rounded-full mr-4">
                  <Gem className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Net Worth</h3>
                  <p className="text-3xl font-bold">${virtualCurrency.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LeaderboardCard 
                title="Wealth Leaders" 
                icon={<Award className="mr-2 h-5 w-5 text-amber-500" />}
                users={wealthLeaders} 
                className="lg:col-span-1 animate-fade-in card-hover-effect"
                style={{ animationDelay: '400ms' }}
              />
              
              <LeaderboardCard 
                title="Stock Market Kings" 
                icon={<TrendingUp className="mr-2 h-5 w-5 text-green-500" />}
                users={stockLeaders} 
                className="lg:col-span-1 animate-fade-in card-hover-effect"
                style={{ animationDelay: '500ms' }}
              />
              
              <LeaderboardCard 
                title="Top Asset Collectors" 
                icon={<Medal className="mr-2 h-5 w-5 text-purple-500" />}
                users={assetLeaders} 
                className="lg:col-span-1 animate-fade-in card-hover-effect"
                style={{ animationDelay: '600ms' }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboards;