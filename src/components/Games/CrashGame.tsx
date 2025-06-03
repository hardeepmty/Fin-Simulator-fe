import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Ticket, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CrashGame: React.FC = () => {
  const { virtualCurrency, decrementVirtualCurrency, incrementVirtualCurrency } = useSimulation();
  const { toast } = useToast();

  // Game State
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<string>('Place your bet and watch the multiplier grow!');
  const [gameStatusType, setGameStatusType] = useState<string>('waiting'); // 'waiting', 'playing', 'crashed', 'won'
  const [gameHistory, setGameHistory] = useState<number[]>([]); // Stores multipliers of past rounds
  const [gameData, setGameData] = useState<{ x: number; y: number }[]>([{ x: 0, y: 1.00 }]); // Data points for the graph

  // Refs for DOM elements (inputs, graph paths, multiplier text)
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const crashPointRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const betAmountInputRef = useRef<HTMLInputElement>(null);
  const autoCashoutInputRef = useRef<HTMLInputElement>(null);
  const graphLineRef = useRef<SVGPathElement>(null);
  const graphFillRef = useRef<SVGPathElement>(null);
  const multiplierTextRef = useRef<HTMLDivElement>(null);

  const gameSpeed = 100; // milliseconds for multiplier update

  // Ref to hold the latest multiplier value for use in functions that might be called
  // from outside the direct render cycle (e.g., crashGame, cashOut)
  const multiplierRef = useRef(multiplier);
  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);

  // Helper function to update game status message and type
  const setStatus = useCallback((message: string, type: string) => {
    setGameStatus(message);
    setGameStatusType(type);
  }, []);

  // Generates a random crash point for the game round
  const generateCrashPoint = useCallback(() => {
    // This formula ensures lower multipliers are more common, simulating a real crash game.
    // The `0.99` factor introduces a slight house edge.
    const random = Math.random();
    return parseFloat(Math.max(1.01, 1 / (1 - random) * 0.99).toFixed(2));
  }, []);

  // Function to reset the game state after a round ends (win or crash)
  const resetGame = useCallback(() => {
    setTimeout(() => {
      setCurrentBet(0);
      setHasBet(false);
      setMultiplier(1.00); // Reset multiplier display
      setGameData([{ x: 0, y: 1.00 }]); // Clear graph data
      gameTimeRef.current = 0; // Reset game time

      // Re-enable bet input
      if (betAmountInputRef.current) betAmountInputRef.current.disabled = false;

      // Remove crash/win animations/styles
      if (multiplierTextRef.current) {
        multiplierTextRef.current.classList.remove('crashed');
      }
      if (graphLineRef.current) {
        graphLineRef.current.classList.remove('crashed');
        graphLineRef.current.setAttribute('d', ''); // Clear graph line path
      }
      if (graphFillRef.current) {
        graphFillRef.current.classList.remove('crashed');
        graphFillRef.current.setAttribute('d', ''); // Clear graph fill path
      }

      setStatus('Place your bet and watch the multiplier grow!', 'waiting');
    }, 3000); // Wait 3 seconds before allowing a new round
  }, [setStatus]);

  // Function to handle the game crashing
  const crashGame = useCallback(() => {
    // Stop the game interval
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    setIsPlaying(false); // Set game state to not playing

    // Apply crash-specific styles/animations
    if (multiplierTextRef.current) {
      multiplierTextRef.current.classList.add('crashed');
    }
    if (graphLineRef.current) {
      graphLineRef.current.classList.add('crashed');
    }
    if (graphFillRef.current) {
      graphFillRef.current.classList.add('crashed');
    }

    // Display appropriate status message and toast notification
    if (hasBet) {
      setStatus(`💥 CRASHED at ${multiplierRef.current.toFixed(2)}x! You lost $${currentBet.toFixed(2)}`, 'crashed');
      toast({
        title: "Game Over!",
        description: `You lost $${currentBet.toFixed(2)} at ${multiplierRef.current.toFixed(2)}x.`,
        variant: "destructive",
      });
    } else {
      setStatus(`💥 CRASHED at ${multiplierRef.current.toFixed(2)}x!`, 'crashed');
      toast({
        title: "Game Crashed!",
        description: `Multiplier crashed at ${multiplierRef.current.toFixed(2)}x.`,
        variant: "default", // Using "default" as "success" might not be a valid variant for shadcn/ui toast
      });
    }

    // Add the crash point to game history
    setGameHistory(prevHistory => {
      const newHistory = [multiplierRef.current, ...prevHistory];
      return newHistory.slice(0, 20); // Keep only the last 20 results
    });

    resetGame(); // Reset for the next round
  }, [hasBet, currentBet, toast, resetGame, setStatus]);

  // Function to handle a user cashing out
  const cashOut = useCallback(() => {
    if (!hasBet || !isPlaying) return; // Only allow cash out if a bet is placed and game is active

    const winAmount = parseFloat((currentBet * multiplierRef.current).toFixed(2)); // Calculate winnings
    incrementVirtualCurrency(winAmount); // Add winnings to user's virtual currency

    setStatus(`✅ Cashed out at ${multiplierRef.current.toFixed(2)}x! Won $${winAmount.toFixed(2)}`, 'won');
    toast({
      title: "Cashed Out!",
      description: `You won $${winAmount.toFixed(2)} at ${multiplierRef.current.toFixed(2)}x!`,
      variant: "default", // Using "default" as "success" might not be a valid variant for shadcn/ui toast
    });

    // Stop the game interval
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    setIsPlaying(false); // Set game state to not playing

    // Add the cash-out multiplier to game history
    setGameHistory(prevHistory => {
      const newHistory = [multiplierRef.current, ...prevHistory];
      return newHistory.slice(0, 20); // Keep only the last 20 results
    });

    resetGame(); // Reset for the next round
  }, [hasBet, isPlaying, currentBet, incrementVirtualCurrency, toast, resetGame, setStatus]);

  // The core game loop function that runs every `gameSpeed` milliseconds
  const tick = useCallback(() => {
    gameTimeRef.current += gameSpeed;

    // Use functional update for setMultiplier to ensure it always uses the latest state
    setMultiplier(prevMultiplier => {
      const newMultiplier = parseFloat((prevMultiplier + 0.01).toFixed(2));

      // Update gameData for graph based on the new multiplier
      setGameData(prevData => [...prevData, { x: gameTimeRef.current, y: newMultiplier }]);

      const autoCashOut = parseFloat(autoCashoutInputRef.current?.value || '0');

      // Check for crash condition
      if (newMultiplier >= crashPointRef.current) {
        crashGame(); // Call crashGame if multiplier reaches or exceeds crash point
        return prevMultiplier; // Return previous multiplier, as game is ending
      }

      // Check for auto cash out condition (if a bet is placed and auto cash out is set)
      if (hasBet && newMultiplier >= autoCashOut && autoCashOut > 1.00) {
        cashOut(); // Call cashOut if auto cash out point is reached
        return prevMultiplier; // Return previous multiplier, as game is ending
      }
      return newMultiplier; // Return the new multiplier to update the state
    });
  }, [crashGame, cashOut, hasBet]); // Dependencies for tick

  // Function to start a new round of the game
  const startGame = useCallback(() => {
    if (isPlaying) return; // Prevent starting if already playing

    setIsPlaying(true); // Set game state to playing
    setMultiplier(1.00); // Reset multiplier
    setGameData([{ x: 0, y: 1.00 }]); // Reset graph data
    gameTimeRef.current = 0; // Reset game time
    crashPointRef.current = generateCrashPoint(); // Generate a new random crash point

    setStatus('🚀 Game started! Multiplier is rising...', 'playing');

    // Disable bet input while game is running
    if (betAmountInputRef.current) betAmountInputRef.current.disabled = true;

    // Start the game interval, calling the 'tick' function repeatedly
    gameIntervalRef.current = setInterval(tick, gameSpeed);
  }, [isPlaying, generateCrashPoint, setStatus, tick]); // `tick` is a dependency, but it's stable due to its own useCallback

  // Handles placing a bet when the button is clicked
  const handlePlaceBet = () => {
    const betAmount = parseFloat(betAmountInputRef.current?.value || '0');
    if (betAmount <= 0 || isNaN(betAmount)) {
      toast({ title: "Invalid Bet", description: "Please enter a valid bet amount.", variant: "destructive" });
      return;
    }
    if (betAmount > virtualCurrency) {
      toast({ title: "Insufficient Funds", description: "You don't have enough virtual currency.", variant: "destructive" });
      return;
    }
    if (isPlaying) {
      toast({ title: "Game in Progress", description: "Wait for the current round to finish.", variant: "destructive" });
      return;
    }

    setCurrentBet(betAmount); // Set the current bet amount
    decrementVirtualCurrency(betAmount); // Deduct bet from user's balance
    setHasBet(true); // Indicate that a bet has been placed
    startGame(); // Start the game round
  };

  // Updates the potential win display based on current bet and multiplier
  const updatePotentialWin = useCallback(() => {
    const betAmount = parseFloat(betAmountInputRef.current?.value || '0');
    // Calculate potential win: if a bet is active, use currentBet; otherwise, use input bet amount
    const potential = hasBet ? currentBet * multiplier : betAmount * multiplier;
    const potentialWinElement = document.getElementById('potential-win');
    if (potentialWinElement) {
      potentialWinElement.textContent = potential.toFixed(2);
    }
  }, [currentBet, hasBet, multiplier]);

  // Updates the SVG graph based on the accumulated gameData points
  const updateGraph = useCallback(() => {
    if (gameData.length < 2 || !graphLineRef.current || !graphFillRef.current) return;

    const svgContainer = document.getElementById('graph-container-id');
    if (!svgContainer) return;

    const width = svgContainer.offsetWidth;
    const height = svgContainer.offsetHeight;

    // Determine max values for scaling the graph
    const maxTime = Math.max(...gameData.map(d => d.x), 10000); // Ensure x-axis extends at least 10 seconds
    const maxMultiplier = Math.max(...gameData.map(d => d.y), 5); // Ensure y-axis extends at least to 5x
    const displayMaxMultiplier = maxMultiplier * 1.2; // Add some padding above the max multiplier

    let pathData = ''; // SVG path for the line
    let fillPathData = ''; // SVG path for the shaded area

    gameData.forEach((point, index) => {
      // Scale x and y coordinates to fit the SVG container dimensions
      const x = (point.x / maxTime) * width;
      const y = height - ((point.y - 1) / (displayMaxMultiplier - 1)) * height; // Scale y from 1x upwards

      if (index === 0) {
        pathData += `M ${x} ${y}`; // Move to the first point
        fillPathData += `M ${x} ${height} L ${x} ${y}`; // Start fill path from bottom-left
      } else {
        pathData += ` L ${x} ${y}`; // Draw line to next point
        fillPathData += ` L ${x} ${y}`; // Continue fill path
      }
    });

    // Close the fill path to create a polygon
    if (gameData.length > 0) {
      const lastPoint = gameData[gameData.length - 1];
      const lastX = (lastPoint.x / maxTime) * width;
      fillPathData += ` L ${lastX} ${height} Z`; // Draw to bottom-right, then close
    }

    // Update SVG path attributes
    graphLineRef.current.setAttribute('d', pathData);
    graphFillRef.current.setAttribute('d', fillPathData);
  }, [gameData]); // Re-run when gameData changes

  // Effect to initialize game history on component mount
  useEffect(() => {
    const initialHistory: number[] = [];
    for (let i = 0; i < 10; i++) {
      initialHistory.push(generateCrashPoint());
    }
    setGameHistory(initialHistory);
  }, [generateCrashPoint]);

  // Effect to manage the game interval (start/stop)
  useEffect(() => {
    if (isPlaying) {
      // Clear any existing interval to prevent multiple intervals running
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      // Start a new interval, calling the 'tick' function
      gameIntervalRef.current = setInterval(tick, gameSpeed);
    } else {
      // Clear the interval if game is not playing
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
    }
    // Cleanup function: ensures interval is cleared when component unmounts or `isPlaying` changes
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [isPlaying, tick]); // Re-run when isPlaying or tick function changes

  // Effect to update graph and potential win whenever gameData or multiplier changes
  useEffect(() => {
    updateGraph();
    updatePotentialWin();
  }, [gameData, updateGraph, updatePotentialWin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br text-white overflow-hidden">
      {/* Inline CSS for specific game styles */}
      <style>{`
        .game-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          width: 90%;
          max-width: 800px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .game-title {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .multiplier-display {
          text-align: center;
          margin: 2rem 0;
          height: 300px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 15px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .graph-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .graph-svg {
          width: 100%;
          height: 100%;
        }

        .graph-line {
          fill: none;
          stroke: #4ecdc4;
          stroke-width: 3;
          filter: drop-shadow(0 0 8px rgba(78, 205, 196, 0.6));
          transition: stroke 0.3s ease;
        }

        .graph-line.crashed {
          stroke: #ff6b6b;
          filter: drop-shadow(0 0 8px rgba(255, 107, 107, 0.6));
        }

        .graph-fill {
          fill: url(#gradient);
          opacity: 0.3;
        }

        .graph-fill.crashed {
          fill: url(#crashGradient);
        }

        .multiplier-text {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 2.5rem;
          font-weight: bold;
          color: #4ecdc4;
          text-shadow: 0 0 20px rgba(78, 205, 196, 0.8);
          background: rgba(0, 0, 0, 0.7);
          padding: 0.5rem 1rem;
          border-radius: 10px;
          border: 1px solid rgba(78, 205, 196, 0.3);
          z-index: 10;
        }

        .multiplier-text.crashed {
          color: #ff6b6b;
          text-shadow: 0 0 20px rgba(255, 107, 107, 0.8);
          border-color: rgba(255, 107, 107, 0.3);
          animation: crash-pulse 0.5s ease-in-out;
        }

        @keyframes crash-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .graph-grid {
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 1;
        }

        .graph-labels {
          fill: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          font-family: 'Segoe UI', sans-serif;
        }

        .bet-button.place-bet {
          background: linear-gradient(45deg, #4ecdc4, #45b7d1);
          color: white;
        }

        .bet-button.place-bet:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(78, 205, 196, 0.3);
        }

        .bet-button.place-bet:disabled {
          background: #666;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .bet-button.cash-out {
          background: linear-gradient(45deg, #ff6b6b, #ff4757);
          color: white;
        }

        .bet-button.cash-out:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
        }

        .bet-button.cash-out:disabled {
          background: #666;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .history-item.low {
          color: #ff6b6b;
          border-color: rgba(255, 107, 107, 0.3);
        }

        .history-item.medium {
          color: #feca57;
          border-color: rgba(254, 202, 87, 0.3);
        }

        .history-item.high {
          color: #4ecdc4;
          border-color: rgba(78, 205, 196, 0.3);
        }

        .status-message.waiting {
          color: #feca57;
        }

        .status-message.playing {
          color: #4ecdc4;
        }

        .status-message.crashed {
          color: #ff6b6b;
        }

        .status-message.won {
          color: #2ed573;
        }

        @media (max-width: 768px) {
          .game-container {
            padding: 1rem;
            margin: 1rem;
          }
          
          .controls {
            grid-template-columns: 1fr;
          }
          
          .multiplier-text {
            font-size: 3rem;
          }
          
          .game-title {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">🚀 CRASH GAME</h1>
          <div className="balance">Balance: ${virtualCurrency.toFixed(2)}</div>
        </div>

        <div className="multiplier-display">
          <div id="graph-container-id" className="graph-container">
            <svg className="graph-svg" id="graph-svg">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#4ecdc4', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#4ecdc4', stopOpacity: 0 }} />
                </linearGradient>
                <linearGradient id="crashGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#ff6b6b', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <g id="grid-lines">
                {/* Horizontal lines */}
                {[1, 2, 3, 4, 5].map(i => (
                  <g key={`h-line-group-${i}`}>
                    <line
                      className="graph-grid"
                      x1="0"
                      y1={(300 / 6) * i}
                      x2="100%"
                      y2={(300 / 6) * i}
                    />
                    <text
                      className="graph-labels"
                      x="10"
                      y={(300 / 6) * i - 5}
                    >
                      {(6 - i).toFixed(1)}x
                    </text>
                  </g>
                ))}
                {/* Vertical lines - adjust based on desired time scale */}
                {[1, 2, 3, 4].map(i => (
                  <line
                    key={`v-line-${i}`}
                    className="graph-grid"
                    x1={`${(100 / 5) * i}%`}
                    y1="0"
                    x2={`${(100 / 5) * i}%`}
                    y2="100%"
                  />
                ))}
              </g>
              {/* Graph path */}
              <path ref={graphFillRef} className="graph-fill" d=""></path>
              <path ref={graphLineRef} className="graph-line" d=""></path>
            </svg>
          </div>
          <div ref={multiplierTextRef} className={`multiplier-text ${gameStatusType === 'crashed' ? 'crashed' : ''}`}>
            {multiplier.toFixed(2)}x
          </div>
        </div>

        <div className={`status-message ${gameStatusType}`}>{gameStatus}</div>

        <div className="controls grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          <div className="bet-section bg-white bg-opacity-5 p-6 rounded-xl border border-white border-opacity-10">
            <h3 className="text-[#4ecdc4] text-lg font-semibold mb-4">💰 Place Bet</h3>
            <div className="mb-4">
              <label htmlFor="bet-amount" className="block text-sm text-gray-300 mb-2">Bet Amount ($)</label>
              <input
                type="number"
                id="bet-amount"
                min="1"
                defaultValue="10"
                step="1"
                ref={betAmountInputRef}
                className="w-full p-3 rounded-lg border border-white border-opacity-20 bg-black bg-opacity-30 text-white focus:outline-none focus:border-[#4ecdc4] focus:ring-2 focus:ring-[#4ecdc4]"
                disabled={isPlaying}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="auto-cashout" className="block text-sm text-gray-300 mb-2">Auto Cash Out (x)</label>
              <input
                type="number"
                id="auto-cashout"
                min="1.01"
                defaultValue="2.00"
                step="0.01"
                ref={autoCashoutInputRef}
                className="w-full p-3 rounded-lg border border-white border-opacity-20 bg-black bg-opacity-30 text-white focus:outline-none focus:border-[#4ecdc4] focus:ring-2 focus:ring-[#4ecdc4]"
                disabled={isPlaying}
              />
            </div>
            <Button
              className="bet-button place-bet w-full py-3 rounded-xl text-lg font-bold uppercase tracking-wide transition-all duration-300"
              onClick={handlePlaceBet}
              disabled={isPlaying || virtualCurrency < parseFloat(betAmountInputRef.current?.value || '0')}
            >
              Place Bet
            </Button>
          </div>

          <div className="bet-section bg-white bg-opacity-5 p-6 rounded-xl border border-white border-opacity-10">
            <h3 className="text-[#ff6b6b] text-lg font-semibold mb-4">💸 Cash Out</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Current Bet</label>
              <div className="p-3 bg-black bg-opacity-30 rounded-lg text-[#4ecdc4] text-lg font-bold">
                ${currentBet.toFixed(2)}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Potential Win</label>
              <div className="p-3 bg-black bg-opacity-30 rounded-lg text-[#2ed573] text-lg font-bold">
                $<span id="potential-win">0.00</span>
              </div>
            </div>
            <Button
              className="bet-button cash-out w-full py-3 rounded-xl text-lg font-bold uppercase tracking-wide transition-all duration-300"
              onClick={cashOut}
              disabled={!hasBet || !isPlaying}
            >
              Cash Out
            </Button>
          </div>
        </div>

        <div className="game-history mt-8">
          <h3 className="history-title text-xl font-semibold mb-4 text-[#4ecdc4]">📊 Recent Results</h3>
          <div className="history-list flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
            {gameHistory.map((mult, index) => (
              <div
                key={index}
                className={`history-item px-4 py-2 rounded-full text-sm border border-opacity-20 ${
                  mult < 1.5 ? 'low text-[#ff6b6b] border-[#ff6b6b]' :
                  mult < 3 ? 'medium text-[#feca57] border-[#feca57]' :
                  'high text-[#4ecdc4] border-[#4ecdc4]'
                }`}
              >
                {mult.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;
