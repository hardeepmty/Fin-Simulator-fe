// src/pages/GamesHub.tsx
import React from 'react';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { useGames } from '@/context/GamesContext';
import CrashGame from '@/components/Games/CrashGame';
import SlotsGame from '@/components/Games/SlotsGame';
import { Dice5, CircleDollarSign, Table } from 'lucide-react';

const GamesHub: React.FC = () => {
  const { activeGame, setActiveGame } = useGames();

  const games = [
    { id: 'crash', name: 'Crash', icon: <CircleDollarSign className="w-6 h-6" />, component: <CrashGame /> },
   // { id: 'slots', name: 'Slots', icon: <SlotMachine className="w-6 h-6" />, component: <SlotsGame /> },
    { id: 'dice', name: 'Dice', icon: <Dice5 className="w-6 h-6" />, component: <div>Dice Game Coming Soon</div> },
    //{ id: 'roulette', name: 'Roulette', icon: <Roulette className="w-6 h-6" />, component: <div>Roulette Coming Soon</div> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Header />
      
      <div className="flex flex-1">
        <Navigation />
        
        <main className="flex-1 p-6 pt-24">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-white">Games</h1>
            
            {!activeGame ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    className="bg-gray-900 rounded-lg p-6 text-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition h-48"
                  >
                    <div className="bg-blue-600 p-3 rounded-full mb-3">
                      {game.icon}
                    </div>
                    <h2 className="text-xl font-bold">{game.name}</h2>
                    <p className="text-gray-400 mt-2">Click to play</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => setActiveGame(null)}
                  className="mb-4 flex items-center text-gray-400 hover:text-white"
                >
                  ← Back to all games
                </button>
                {games.find(g => g.id === activeGame)?.component}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GamesHub;