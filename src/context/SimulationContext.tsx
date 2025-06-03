import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Types
export interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  quantity: number;
}

export interface Asset {
  id: string;
  name: string;
  type: "Land" | "Private Jets" | "Yachts" | "Paintings" | "Gold";
  price: number;
  dailyReturn: number;
  statusPoints: number;
  imageUrl: string;
  owned: boolean;
}

export interface BettingEvent {
  id: string;
  name: string;
  type: "Sports" | "Prediction" | "Custom";
  description: string;
  totalPool: number;
  endDate: Date;
  options: {
    id: string;
    name: string;
    odds: number;
  }[];
  isClosed: boolean; // Added this to match the Betting component's interface
}

// User Data Type
export interface User {
  _id: string;
  name: string;
  email: string;
  vcBalance: number;
  role: string; // This is correctly defined here
  stocks: stockItem[];
  socialStatus: number;
  assets: ownedCollectibles[];
}

export interface stockItem {
  symbol: string;
  shares: number;
  purchasePrice: number;
  _id: string;
}

export interface ownedCollectibles {
  collectibleId: string,
  name: string,
  category: string,
  price: number,
  dailyReturn: number,
  statusPoints: number,
  purchaseDate: string,
  _id: string
}

// Context State
interface SimulationContextType {
  // User data
  user: User | null; // Expose the full user object
  virtualCurrency: number;
  socialStatus: number;
  setUser: (user: User | null) => void;
  setVirtualCurrency: (amount: number) => void;
  incrementVirtualCurrency: (amount: number) => void;
  decrementVirtualCurrency: (amount: number) => void;
  logout: () => void;

  // Portfolio data
  stocks: Stock[];
  assets: Asset[];
  bettingEvents: BettingEvent[]; // This is not being used in the context, but kept for consistency

  // Portfolio actions (placeholders for now)
  buyStock: (stockId: string, quantity: number) => void;
  sellStock: (stockId: string, quantity: number) => void;
  buyAsset: (assetId: string) => void;
  sellAsset: (assetId: string) => void;
  placeBet: (eventId: string, optionId: string, amount: number) => void;
}

// Create context with default values
const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Sample data (these will be overridden by fetched data if available)
const sampleStocks: Stock[] = [
  { id: "1", name: "Tech Giant", symbol: "TGT", price: 150, change: 2.5, quantity: 0 },
  { id: "2", name: "Energy Corp", symbol: "ENC", price: 75, change: -1.2, quantity: 0 },
  { id: "3", name: "Financial Services", symbol: "FIN", price: 220, change: 0.8, quantity: 0 },
  { id: "4", name: "Retail Chain", symbol: "RTC", price: 45, change: -0.5, quantity: 0 },
  { id: "5", name: "Healthcare Inc", symbol: "HCI", price: 110, change: 3.2, quantity: 0 },
];

const sampleAssets: Asset[] = [
  { id: "1", name: "Private Island", type: "Land", price: 100000, dailyReturn: 10, statusPoints: 5000, imageUrl: "/placeholder.svg", owned: false },
  { id: "2", name: "Gulfstream G650", type: "Private Jets", price: 65000, dailyReturn: 6.5, statusPoints: 3200, imageUrl: "/placeholder.svg", owned: false },
  { id: "3", name: "Mega Yacht", type: "Yachts", price: 45000, dailyReturn: 4.5, statusPoints: 2000, imageUrl: "/placeholder.svg", owned: false },
  { id: "4", name: "Picasso Original", type: "Paintings", price: 35000, dailyReturn: 3.5, statusPoints: 1500, imageUrl: "/placeholder.svg", owned: false },
  { id: "5", name: "Gold Bullion (1kg)", type: "Gold", price: 5000, dailyReturn: 0.5, statusPoints: 250, imageUrl: "/placeholder.svg", owned: false },
];

const sampleBettingEvents: BettingEvent[] = [
  {
    id: "1",
    name: "International Cricket Match",
    type: "Sports",
    description: "India vs Australia ODI final match",
    totalPool: 25000,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    options: [{ id: "1a", name: "India wins", odds: 1.8 }, { id: "1b", name: "Australia wins", odds: 2.1 }, { id: "1c", name: "Draw", odds: 8.5 }],
    isClosed: false,
  },
  {
    id: "2",
    name: "2024 Presidential Election",
    type: "Prediction",
    description: "Predict the outcome of the upcoming election",
    totalPool: 50000,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    options: [{ id: "2a", name: "Candidate A wins", odds: 2.2 }, { id: "2b", name: "Candidate B wins", odds: 1.9 }],
    isClosed: false,
  },
];

// Provider component
export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [virtualCurrency, setVirtualCurrency] = useState<number>(0);
  const [socialStatus, setsocialStatus] = useState<number>(0);
  const [stocks, setStocks] = useState<Stock[]>(sampleStocks);
  const [assets, setAssets] = useState<Asset[]>(sampleAssets);
  const [bettingEvents, setBettingEvents] = useState<BettingEvent[]>(sampleBettingEvents); // Keeping this for now, though Betting component fetches its own

  // Fetch user data on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage. User not logged in.");
        setUser(null); // Ensure user is null if no token
        setVirtualCurrency(0);
        setsocialStatus(0);
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("User data fetched from backend:", res.data); // Debugging line

        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          vcBalance: res.data.vcBalance,
          role: res.data.role, // This is correctly being set from backend response
          stocks: res.data.stocks,
          socialStatus: res.data.socialStatus,
          assets: res.data.ownedCollectibles
        });

        setVirtualCurrency(res.data.vcBalance);
        setsocialStatus(res.data.socialStatus);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Clear user data on error (e.g., token expired, invalid)
        localStorage.removeItem("token");
        setUser(null);
        setVirtualCurrency(0);
        setsocialStatus(0);
      }
    };

    fetchUser();
  }, []);

  const incrementVirtualCurrency = (amount: number) => setVirtualCurrency((prev) => prev + amount);
  const decrementVirtualCurrency = (amount: number) => setVirtualCurrency((prev) => prev - amount);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setVirtualCurrency(0);
    setsocialStatus(0);
    // Optionally, force a page reload or redirect to login
    // window.location.reload();
  };

  return (
    <SimulationContext.Provider
      value={{
        user, // Now exposing the full user object with role
        virtualCurrency,
        socialStatus,
        setUser,
        setVirtualCurrency,
        incrementVirtualCurrency,
        decrementVirtualCurrency,
        logout,
        stocks,
        assets,
        bettingEvents, // Still providing this, though Betting component fetches its own
        buyStock: () => {},
        sellStock: () => {},
        buyAsset: () => {},
        sellAsset: () => {},
        placeBet: () => {},
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

// Hook to use context
export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within a SimulationProvider");
  return context;
};
