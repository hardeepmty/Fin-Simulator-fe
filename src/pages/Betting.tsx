
import React, { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, Ticket, TrendingUp, Info } from 'lucide-react';

const Betting = () => {
  const { bettingEvents, placeBet, virtualCurrency } = useSimulation();
  const { toast } = useToast();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [betAmounts, setBetAmounts] = useState<Record<string, number>>({});

  const handleSelectOption = (eventId: string, optionId: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [eventId]: optionId
    });
  };

  const handleBetAmountChange = (eventId: string, amount: string) => {
    const numAmount = parseInt(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      setBetAmounts({
        ...betAmounts,
        [eventId]: numAmount
      });
    } else {
      setBetAmounts({
        ...betAmounts,
        [eventId]: 0
      });
    }
  };

  const handlePlaceBet = (eventId: string) => {
    const optionId = selectedOptions[eventId];
    const amount = betAmounts[eventId] || 0;
    
    if (!optionId) {
      toast({
        title: "No option selected",
        description: "Please select an outcome to bet on",
        variant: "destructive"
      });
      return;
    }
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid betting amount",
        variant: "destructive"
      });
      return;
    }
    
    if (amount > virtualCurrency) {
      toast({
        title: "Insufficient funds",
        description: `You need ${formatCurrency(amount)} VC to place this bet`,
        variant: "destructive"
      });
      return;
    }
    
    placeBet(eventId, optionId, amount);
    
    const event = bettingEvents.find(e => e.id === eventId);
    const option = event?.options.find(o => o.id === optionId);
    
    toast({
      title: "Bet placed successfully",
      description: `${formatCurrency(amount)} VC on "${option?.name}" for ${event?.name}`,
    });
    
    // Reset the selection and amount for this event
    setSelectedOptions({
      ...selectedOptions,
      [eventId]: ''
    });
    
    setBetAmounts({
      ...betAmounts,
      [eventId]: 0
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      
      <main className="pt-24 pb-20 md:pb-8 md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Betting Events</h1>
            <p className="text-muted-foreground">Place virtual bets on sports, predictions, and other events</p>
          </div>
          
          <div className="mb-6 p-6 bg-gradient-to-r from-amber-500/5 to-amber-300/5 rounded-xl border border-amber-500/10">
            <div className="flex items-start md:items-center flex-col md:flex-row">
              <div className="mr-6 mb-4 md:mb-0">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Info size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">How Betting Works</h2>
                <p className="text-muted-foreground">
                  Place virtual bets on the outcome of various events with your VC. If your prediction is correct, you'll win based on the odds multiplier. 
                  Experienced players can also purchase ownership of betting events to earn a percentage of the total betting pool.
                </p>
              </div>
            </div>
          </div>
          
          {/* Betting Categories */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="default" className="px-3 py-1.5 text-sm cursor-pointer">All Events</Badge>
            <Badge variant="outline" className="px-3 py-1.5 text-sm cursor-pointer">Sports</Badge>
            <Badge variant="outline" className="px-3 py-1.5 text-sm cursor-pointer">Predictions</Badge>
            <Badge variant="outline" className="px-3 py-1.5 text-sm cursor-pointer">Custom</Badge>
          </div>
          
          {/* Events List */}
          <div className="grid grid-cols-1 gap-6">
            {bettingEvents.map(event => (
              <Card key={event.id} className="p-6">
                <div className="md:flex">
                  <div className="flex-1 md:pr-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={event.type === 'Sports' ? 'default' : 'outline'}>
                        {event.type}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {new Date(event.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-sm font-medium mb-2">
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        Total Pool: {formatCurrency(event.totalPool)}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="font-medium">Betting Options:</div>
                      {event.options.map(option => (
                        <div 
                          key={option.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedOptions[event.id] === option.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleSelectOption(event.id, option.id)}
                        >
                          <div className="flex justify-between">
                            <span>{option.name}</span>
                            <span className="font-semibold">{option.odds}x</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:w-72 border-t md:border-l md:border-t-0 pt-4 md:pt-0 md:pl-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Your Bet Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                          type="number"
                          min="1"
                          value={betAmounts[event.id] || ''}
                          onChange={(e) => handleBetAmountChange(event.id, e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-input rounded-md"
                          placeholder="Amount in VC"
                        />
                      </div>
                    </div>
                    
                    {selectedOptions[event.id] && betAmounts[event.id] > 0 && (
                      <div className="bg-muted/30 p-3 rounded-md mb-4">
                        <div className="text-sm mb-1">Potential Win:</div>
                        <div className="font-semibold">
                          {formatCurrency(
                            betAmounts[event.id] * (
                              event.options.find(o => o.id === selectedOptions[event.id])?.odds || 0
                            )
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handlePlaceBet(event.id)}
                      disabled={!selectedOptions[event.id] || !(betAmounts[event.id] > 0)}
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Place Bet
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => {}}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Buy Event
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Betting;
