
import React from 'react';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import LeaderboardCard, { LeaderboardUser } from '@/components/Leaderboard/LeaderboardCard';
import { useSimulation } from '@/context/SimulationContext';
import { Trophy, TrendingUp, Gem, Users, Award, Medal } from 'lucide-react';

// Mock data for demonstration
const wealthLeaders: LeaderboardUser[] = [
  { id: '1', name: 'Alex Morgan', score: 2345000, rank: 1, change: 'up', badge: 'Billionaire' },
  { id: '2', name: 'Sam Wilson', score: 1567000, rank: 2, change: 'same', badge: 'Millionaire' },
  { id: '3', name: 'Taylor Swift', score: 987000, rank: 3, change: 'up', badge: 'Investor' },
  { id: '4', name: 'Jamie Lee', score: 764500, rank: 4, change: 'down' },
  { id: '5', name: 'Robin Banks', score: 634200, rank: 5, change: 'up' },
];

const stockLeaders: LeaderboardUser[] = [
  { id: '3', name: 'Taylor Swift', score: 156, rank: 1, change: 'up', badge: 'Market Master' },
  { id: '5', name: 'Robin Banks', score: 132, rank: 2, change: 'up', badge: 'Stock Pro' },
  { id: '2', name: 'Sam Wilson', score: 98, rank: 3, change: 'down', badge: 'Trader' },
  { id: '1', name: 'Alex Morgan', score: 87, rank: 4, change: 'down' },
  { id: '6', name: 'Jordan Lee', score: 65, rank: 5, change: 'up' },
];

const assetLeaders: LeaderboardUser[] = [
  { id: '1', name: 'Alex Morgan', score: 28, rank: 1, change: 'same', badge: 'Collector' },
  { id: '4', name: 'Jamie Lee', score: 22, rank: 2, change: 'up', badge: 'Investor' },
  { id: '7', name: 'Casey Kim', score: 19, rank: 3, change: 'up', badge: 'Enthusiast' },
  { id: '8', name: 'Riley Johnson', score: 14, rank: 4, change: 'same' },
  { id: '2', name: 'Sam Wilson', score: 12, rank: 5, change: 'down' },
];

const Leaderboards: React.FC = () => {
  const { player } = useSimulation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1">
        <Navigation />
        
        <main className="flex-1 p-6 pt-24 animate-fade-up">
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
                  <p className="text-3xl font-bold">1,457</p>
                </div>
              </div>
              
              <div className="glass-panel p-6 rounded-xl flex items-center card-hover-effect animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="bg-green-500/10 p-3 rounded-full mr-4">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Rank</h3>
                  <p className="text-3xl font-bold">#42</p>
                </div>
              </div>
              
              <div className="glass-panel p-6 rounded-xl flex items-center card-hover-effect animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="bg-purple-500/10 p-3 rounded-full mr-4">
                  <Gem className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Net Worth</h3>
                  <p className="text-3xl font-bold">${player.balance.toLocaleString()}</p>
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
