import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, TrendingUp, Gem, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import MarketTicker from '@/components/MarketTicker';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Stock Market Ticker */}
      <MarketTicker />
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-32 md:py-40 bg-gradient-to-b from-gray-800 via-gray-900 to-black">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="animate-fade-up">
            <div className="inline-block px-4 py-2 mb-6 text-sm font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full backdrop-blur-sm uppercase tracking-wider">
              Virtual Finance Hub
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Build, Invest & Thrive with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                CashOut
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 md:mb-10 max-w-3xl mx-auto">
              Experience a next-gen virtual trading simulation. Buy, sell, and manage assets in a dynamic financial world.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/dashboard">
                <Button size="lg" className="group bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-semibold px-8 py-3 text-lg">
                  Start Trading
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-yellow-400">Master the Financial World</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Learn, strategize, and grow your portfolio with our professional-grade finance simulation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: <TrendingUp size={32} />, title: "Stock Market", desc: "Trade real-time stocks in a simulated environment.", color: "text-green-400 border-green-400/20 bg-green-400/10" },
              { icon: <Award size={32} />, title: "Social Prestige", desc: "Increase wealth and climb the social elite ladder.", color: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10" },
              { icon: <Gem size={32} />, title: "Luxury Assets", desc: "Invest in luxury assets with passive income returns.", color: "text-purple-400 border-purple-400/20 bg-purple-400/10" },
              { icon: <Ticket size={32} />, title: "Betting & Events", desc: "Engage in high-stakes betting and virtual events.", color: "text-red-400 border-red-400/20 bg-red-400/10" }
            ].map((feature, index) => (
              <div key={index} className={`p-8 rounded-xl shadow-lg border border-gray-700 hover:border-yellow-400 transition-all duration-300 bg-gray-800 text-white text-center animate-fade-up`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`h-16 w-16 flex items-center justify-center rounded-full mx-auto mb-5 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;