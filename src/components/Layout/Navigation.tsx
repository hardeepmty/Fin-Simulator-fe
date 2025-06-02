
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Award, Ticket, Landmark, Table } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/investments', label: 'Investments', icon: TrendingUp },
  { path: '/marketplace', label: 'Marketplace', icon: Award },
  { path: '/betting', label: 'Betting', icon: Ticket },
  { path: '/loans', label: 'Loans', icon: Landmark },
  { path: '/leaderboards', label: 'Leaderboards', icon: Table },
];

const Navigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border py-2 z-10 md:top-16 md:left-0 md:right-auto md:bottom-auto md:h-[calc(100vh-4rem)] md:w-64 md:border-r md:border-t-0 md:py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-0 md:max-w-none">
        <ul className="flex justify-around md:flex-col md:space-y-2">
          {navItems.map((item) => (
            <li key={item.path} className="md:px-4">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col md:flex-row items-center justify-center md:justify-start p-2 md:p-3 rounded-lg transition-colors',
                    'text-sm font-medium',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon size={20} className="mb-1 md:mb-0 md:mr-3" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
