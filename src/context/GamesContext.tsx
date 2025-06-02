// src/context/GamesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSimulation } from './SimulationContext';

interface GameResult {
  win: boolean;
  payout: number;
  outcome: any;
  timestamp: Date;
}

interface GamesContextType {
  // Game state
  activeGame: string | null;
  gameHistory: GameResult[];
  currentBet: number;
  
  // Game actions
  setActiveGame: (game: string | null) => void;
  setCurrentBet: (amount: number) => void;
  playCrash: () => Promise<GameResult>;
  playSlots: () => Promise<GameResult>;
  playRoulette: (bet: 'red' | 'black' | 'green', number?: number) => Promise<GameResult>;
  playDice: (target: 'over' | 'under', threshold: number) => Promise<GameResult>;
  playPlinko: (risk: 'low' | 'medium' | 'high', rowCount: number) => Promise<GameResult>;
  
  // Game data
  crashMultiplier: number;
  isCrashRunning: boolean;
  crashHistory: number[];
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, decrementVirtualCurrency, incrementVirtualCurrency } = useSimulation();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [currentBet, setCurrentBet] = useState(10);
  const [crashMultiplier, setCrashMultiplier] = useState(1.0);
  const [isCrashRunning, setIsCrashRunning] = useState(false);
  const [crashHistory, setCrashHistory] = useState<number[]>([]);

  // Common game result handler
  const handleGameResult = (result: GameResult) => {
    setGameHistory(prev => [result, ...prev.slice(0, 49)]);
    return result;
  };

  // Crash Game
  const playCrash = async (): Promise<GameResult> => {
    if (!user || user.vcBalance < currentBet) {
      throw new Error('Insufficient balance');
    }

    decrementVirtualCurrency(currentBet);
    setIsCrashRunning(true);
    setCrashMultiplier(1.0);

    return new Promise((resolve) => {
      let multiplier = 1.0;
      const interval = setInterval(() => {
        multiplier += 0.01;
        setCrashMultiplier(parseFloat(multiplier.toFixed(2)));
        
        // Random crash between 1.1x and 10x
        const crashPoint = Math.random() * 8.9 + 1.1;
        if (multiplier >= crashPoint) {
          clearInterval(interval);
          setIsCrashRunning(false);
          const win = Math.random() > 0.45; // 55% chance to cash out before crash
          const payout = win ? currentBet * multiplier : 0;
          
          if (win) {
            incrementVirtualCurrency(payout);
          }
          
          const result = handleGameResult({
            win,
            payout,
            outcome: { multiplier: parseFloat(multiplier.toFixed(2)), crashedAt: parseFloat(crashPoint.toFixed(2)) },
            timestamp: new Date()
          });
          
          setCrashHistory(prev => [parseFloat(crashPoint.toFixed(2)), ...prev.slice(0, 9)]);
          resolve(result);
        }
      }, 100);
    });
  };

  // Slots Game
  const playSlots = async (): Promise<GameResult> => {
    if (!user || user.vcBalance < currentBet) {
      throw new Error('Insufficient balance');
    }

    decrementVirtualCurrency(currentBet);

    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣', '💎'];
    const reels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];

    // Calculate payout
    let payout = 0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      const symbolIndex = symbols.indexOf(reels[0]);
      payout = currentBet * [5, 5, 5, 10, 15, 20, 50, 100][symbolIndex];
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      payout = currentBet * 2;
    }

    if (payout > 0) {
      incrementVirtualCurrency(payout);
    }

    return handleGameResult({
      win: payout > 0,
      payout,
      outcome: { reels },
      timestamp: new Date()
    });
  };

  // Other game implementations would go here...

  return (
    <GamesContext.Provider value={{
      activeGame,
      gameHistory,
      currentBet,
      setActiveGame,
      setCurrentBet,
      playCrash,
      playSlots,
      playRoulette: () => Promise.resolve({ win: false, payout: 0, outcome: null, timestamp: new Date() }), // Implement
      playDice: () => Promise.resolve({ win: false, payout: 0, outcome: null, timestamp: new Date() }), // Implement
      playPlinko: () => Promise.resolve({ win: false, payout: 0, outcome: null, timestamp: new Date() }), // Implement
      crashMultiplier,
      isCrashRunning,
      crashHistory
    }}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = () => {
  const context = useContext(GamesContext);
  if (!context) throw new Error('useGames must be used within a GamesProvider');
  return context;
};