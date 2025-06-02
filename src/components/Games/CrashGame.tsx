// src/components/Games/CrashGame.tsx
import React, { useState, useEffect } from 'react';
import { useGames } from '@/context/GamesContext';

const CrashGame: React.FC = () => {
  const { 
    crashMultiplier, 
    isCrashRunning, 
    playCrash, 
    currentBet, 
    setCurrentBet,
    crashHistory
  } = useGames();
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [hasCashedOut, setHasCashedOut] = useState(false);

  useEffect(() => {
    if (isCrashRunning && !hasCashedOut && crashMultiplier >= autoCashout) {
      setHasCashedOut(true);
    }
  }, [crashMultiplier, autoCashout, isCrashRunning, hasCashedOut]);

  const handlePlay = async () => {
    setHasCashedOut(false);
    await playCrash();
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Crash</h2>
        <div className="text-xl font-mono">
          {isCrashRunning ? crashMultiplier.toFixed(2) + 'x' : '1.00x'}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 mb-4 h-64 flex flex-col justify-center items-center">
        {isCrashRunning ? (
          <div className="text-5xl font-bold animate-pulse">
            {crashMultiplier.toFixed(2)}x
          </div>
        ) : (
          <button
            onClick={handlePlay}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg text-xl font-bold"
            disabled={isCrashRunning}
          >
            Place Bet
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Bet Amount</label>
        <input
          type="number"
          value={currentBet}
          onChange={(e) => setCurrentBet(Number(e.target.value))}
          className="bg-gray-700 text-white p-2 rounded w-full"
          min="1"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Auto Cashout</label>
        <input
          type="number"
          value={autoCashout}
          onChange={(e) => setAutoCashout(Number(e.target.value))}
          className="bg-gray-700 text-white p-2 rounded w-full"
          min="1.1"
          step="0.1"
        />
      </div>
      
      <div className="mt-6">
        <h3 className="font-bold mb-2">Recent Multipliers</h3>
        <div className="flex space-x-2">
          {crashHistory.map((mult, i) => (
            <div 
              key={i} 
              className={`px-3 py-1 rounded ${mult < 2 ? 'bg-red-500' : mult < 5 ? 'bg-yellow-500' : 'bg-green-500'}`}
            >
              {mult.toFixed(2)}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrashGame;