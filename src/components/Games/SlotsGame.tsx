// src/components/Games/SlotsGame.tsx
import React, { useState, useEffect } from 'react';
import { useGames } from '@/context/GamesContext';

const SlotsGame: React.FC = () => {
  const { playSlots, currentBet, setCurrentBet } = useGames();
  const [reels, setReels] = useState<string[]>(['🍒', '🍒', '🍒']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  const handlePlay = async () => {
    setIsSpinning(true);
    // Visual spinning effect
    const spinDuration = 2000;
    const startTime = Date.now();
    
    const spinInterval = setInterval(() => {
      setReels([
        ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣', '💎'][Math.floor(Math.random() * 8)],
        ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣', '💎'][Math.floor(Math.random() * 8)],
        ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣', '💎'][Math.floor(Math.random() * 8)]
      ]);
    }, 100);

    // setTimeout(() => {
    //   clearInterval(spinInterval);
    //   const result = await playSlots();
    //   setReels(result.outcome.reels);
    //   if (result.win) {
    //     setLastWin(result.payout);
    //   }
    //   setIsSpinning(false);
    // }, spinDuration);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Slots</h2>
      
      <div className="bg-gray-800 rounded-lg p-4 mb-4 h-64 flex items-center justify-center">
        <div className="text-6xl font-bold flex space-x-4">
          {reels.map((reel, i) => (
            <div key={i} className="w-16 h-16 flex items-center justify-center">
              {reel}
            </div>
          ))}
        </div>
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
      
      <button
        onClick={handlePlay}
        className={`w-full py-3 rounded-lg text-xl font-bold ${
          isSpinning ? 'bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={isSpinning}
      >
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>
      
      {lastWin > 0 && (
        <div className="mt-4 p-2 bg-green-500 rounded text-center">
          You won ${lastWin.toLocaleString()}!
        </div>
      )}
    </div>
  );
};

export default SlotsGame;