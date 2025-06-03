
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Trophy, Award, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LeaderboardUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  change?: 'up' | 'down' | 'same';
  badge?: 'gold' | 'silver' | 'bronze' | string;
};

interface LeaderboardCardProps {
  title: string;
  users: LeaderboardUser[];
  className?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ title, users, className, icon, style }) => {
  const getBadgeIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case 2:
        return <Award className="h-4 w-4 text-gray-300" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-700" />;
      default:
        return <Star className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-500 to-yellow-300 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-300 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-700 to-amber-600 text-white";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className={cn("backdrop-blur-sm bg-card/70 border-border/40 hover:shadow-md transition-shadow", className)} style={style}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          {icon || <Zap className="mr-2 h-5 w-5 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold", getRankStyles(user.rank))}>
                  {user.rank}
                </div>
                
                <Avatar className="h-10 w-10 border-2 border-border/40">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </Avatar>
                
                <div>
                  <div className="font-medium">{user.name}</div>
                  {user.badge && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      {getBadgeIcon(user.rank)}
                      
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{user.score.toLocaleString()}</span>
                {user.change && (
                  <Badge className={cn(
                    "ml-2",
                    user.change === 'up' ? "bg-green-500" : 
                    user.change === 'down' ? "bg-red-500" : 
                    "bg-gray-500"
                  )}>
                    {user.change === 'up' ? '↑' : user.change === 'down' ? '↓' : '–'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
