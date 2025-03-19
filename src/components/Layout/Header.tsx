import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSimulation } from "@/context/SimulationContext";
import { formatCurrency } from "@/utils/formatters";
import { Trophy, Coins, LogOut } from "lucide-react";
import axios from "axios";
import ThemeToggle from "@/components/ThemeToggle"; // Import Dark Mode Toggle

const Header: React.FC = () => {
  const { user, setUser, virtualCurrency, setVirtualCurrency, socialStatus, logout } = useSimulation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          vcBalance: res.data.vcBalance,
          role: res.data.role,
          stocks: res.data.stocks,
          socialStatus: res.data.socialStatus,
          assets: res.data.ownedCollectibles
        });

        setVirtualCurrency(res.data.vcBalance); // Update virtual currency
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (!user?._id) {
      fetchUser();
    }
  }, [setUser, setVirtualCurrency, user]);

  return (
    <header className="border-b border-border/40 bg-background/60 backdrop-blur-md z-50 fixed top-0 left-0 right-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-fin-light-blue">
                CashOut
              </span>
            </Link>
          </div>

          {/* Right: User Info, VC, SP, Dark Mode Toggle */}
          <div className="flex items-center space-x-6">
            {/* Virtual Currency */}
            <div className="flex items-center space-x-1 bg-fin-blue/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-fin-blue/10">
              <Coins size={16} className="text-fin-blue" />
              <span className="text-sm font-medium">{formatCurrency(virtualCurrency)} VC</span>
            </div>

            {/* Social Status */}
            <div className="flex items-center space-x-1 bg-amber-500/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-500/10">
              <Trophy size={16} className="text-amber-500" />
              <span className="text-sm font-medium">{socialStatus} SP</span>
            </div>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-black dark:text-white">{user.name}</span>
                <button onClick={logout} className="text-red-400 hover:text-red-500">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-white bg-primary px-3 py-1.5 rounded">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
