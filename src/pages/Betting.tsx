import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, Ticket, TrendingUp, Info, XCircle } from 'lucide-react';
import axios from 'axios';

// Define the interface for a single betting event
interface BettingEvent {
  id: string;
  name: string;
  description: string;
  type: 'Sports' | 'Prediction' | 'Custom';
  totalPool: number;
  endDate: string; // Mapped from backend 'eventDate'
  options: { // Mapped from backend 'outcomes'
    id: string; // Mapped from backend '_id' of outcome
    name: string; // Mapped from backend 'option'
    odds: number; // Mapped from backend 'multiplier'
  }[];
}

// Define the interface for a user's bet (from the backend's Bet model)
interface UserBet {
  _id: string;
  user: string; // User ID
  event: {
    _id: string;
    title: string;
    // Add other relevant event details if needed for display in the modal
  };
  selectedOption: string; // The name of the option (e.g., "India wins")
  amount: number;
  createdAt: string;
}

const Betting = () => {
  // Access virtual currency from the simulation context
  const { virtualCurrency } = useSimulation();
  // Hook for displaying toast notifications
  const { toast } = useToast();

  // State to manage selected options for each betting event
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  // State to manage bet amounts for each betting event
  const [betAmounts, setBetAmounts] = useState<Record<string, number>>({});
  // State to store the list of betting events, initialized as an empty array
  const [bettingEvents, setBettingEvents] = useState<BettingEvent[]>([]);
  // State to manage the loading status of betting events
  const [loading, setLoading] = useState(true);
  // State to control the visibility of the "My Bets" modal
  const [showMyBetsModal, setShowMyBetsModal] = useState(false);
  // State to store the user's betting history
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  // State for loading user bets
  const [loadingUserBets, setLoadingUserBets] = useState(false);


  // useEffect hook to fetch all betting events when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Make an API call to get all betting events
        const response = await axios.get('http://localhost:8000/api/betting/getAllEvents');
        // Ensure the data received is an array before setting the state.
        // This prevents the 'map is undefined' error if the API returns non-array data.
        // Transform the backend response to match the frontend interface
        const transformedEvents: BettingEvent[] = Array.isArray(response.data)
          ? response.data.map((event: any) => ({
              id: event._id, // Map backend _id to frontend id
              name: event.title, // Map backend title to frontend name
              description: event.description,
              type: event.type, // Assuming 'type' is consistent or needs a specific mapping if not
              totalPool: event.totalPool,
              endDate: event.eventDate, // Map backend 'eventDate' to frontend 'endDate'
              options: Array.isArray(event.outcomes) // Ensure 'outcomes' is an array before mapping
                ? event.outcomes.map((outcome: any) => ({
                    id: outcome._id, // Map backend '_id' of outcome to frontend 'id'
                    name: outcome.option, // Map backend 'option' to frontend 'name'
                    odds: outcome.multiplier, // Map backend 'multiplier' to frontend 'odds'
                  }))
                : [], // Default to empty array if outcomes is not an array
            }))
          : [];
        setBettingEvents(transformedEvents);
      } catch (error) {
        // Log the error and display a toast notification
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load betting events",
          variant: "destructive"
        });
        // Set betting events to an empty array on error to ensure it's always iterable
        setBettingEvents([]);
      } finally {
        // Set loading to false regardless of success or failure
        setLoading(false);
      }
    };
    fetchEvents(); // Call the fetch function
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handler for selecting a betting option for a specific event
  const handleSelectOption = (eventId: string, optionId: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [eventId]: optionId // Update the selected option for the given event
    });
  };

  // Handler for changing the bet amount for a specific event
  const handleBetAmountChange = (eventId: string, amount: string) => {
    const numAmount = parseInt(amount); // Parse the input amount to an integer
    if (!isNaN(numAmount)) {
      // If it's a valid number, update the bet amount state (ensure non-negative)
      setBetAmounts({
        ...betAmounts,
        [eventId]: numAmount > 0 ? numAmount : 0
      });
    } else {
      // If the input is not a number (e.g., empty string), set the amount to 0
      setBetAmounts({
        ...betAmounts,
        [eventId]: 0
      });
    }
  };

  // Handler for placing a bet on a specific event
  const handlePlaceBet = async (eventId: string) => {
    const optionId = selectedOptions[eventId]; // Get the selected option ID for the event
    const amount = betAmounts[eventId] || 0; // Get the bet amount, default to 0 if not set

    // Validate if an option is selected
    if (!optionId) {
      toast({
        title: "No option selected",
        description: "Please select an outcome to bet on",
        variant: "destructive"
      });
      return;
    }

    // Validate if the amount is valid
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid betting amount",
        variant: "destructive"
      });
      return;
    }

    // Validate if the user has sufficient virtual currency
    if (amount > virtualCurrency) {
      toast({
        title: "Insufficient funds",
        description: `You need ${formatCurrency(amount)} VC to place this bet`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Retrieve authentication token from localStorage
      const authToken = localStorage.getItem('token'); // Replace 'authToken' with your actual key

      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "You are not authenticated. Please log in.",
          variant: "destructive"
        });
        return;
      }

      // Find the selected option object from the bettingEvents state
      const event = bettingEvents.find(e => e.id === eventId);
      const selectedOptionObject = event?.options.find(o => o.id === optionId);

      if (!selectedOptionObject) {
        toast({
          title: "Error",
          description: "Selected option not found for this event.",
          variant: "destructive"
        });
        return;
      }

      // Make an API call to place the bet, including the Authorization header
      // Send selectedOptionObject.name (e.g., "India wins") instead of optionId
      await axios.post(`http://localhost:8000/api/betting/${eventId}/bet`,
        {
          selectedOption: selectedOptionObject.name, // Sending the option's name/title
          amount
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}` // Include the Bearer token
          }
        }
      );

      // Display success toast
      toast({
        title: "Bet placed successfully",
        description: `${formatCurrency(amount)} VC on "${selectedOptionObject.name}"`,
      });

      // Refresh events to get updated odds and pools after placing a bet
      const eventsResponse = await axios.get('http://localhost:8000/api/betting/getAllEvents');
      // Transform the refreshed data as well
      const refreshedTransformedEvents: BettingEvent[] = Array.isArray(eventsResponse.data)
        ? eventsResponse.data.map((event: any) => ({
            id: event._id,
            name: event.title,
            description: event.description,
            type: event.type,
            totalPool: event.totalPool,
            endDate: event.eventDate,
            options: Array.isArray(event.outcomes)
              ? event.outcomes.map((outcome: any) => ({
                  id: outcome._id,
                  name: outcome.option,
                  odds: outcome.multiplier,
                }))
              : [],
          }))
        : [];
      setBettingEvents(refreshedTransformedEvents);

      // Reset the selection and amount for the event after placing the bet
      setSelectedOptions(prev => ({ ...prev, [eventId]: '' }));
      setBetAmounts(prev => ({ ...prev, [eventId]: 0 }));

    } catch (error) {
      // Log the error and display a failure toast
      console.error('Error placing bet:', error);
      // Check for specific unauthorized error status
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Your session has expired or you are not authorized. Please log in again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Bet failed",
          description: "There was an error processing your bet",
          variant: "destructive"
        });
      }
    }
  };

  // Function to fetch user's betting history
  const fetchUserBets = async () => {
    setLoadingUserBets(true);
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view your bets.",
          variant: "destructive"
        });
        setLoadingUserBets(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/api/betting/getMyBets', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUserBets(response.data);
    } catch (error) {
      console.error('Error fetching user bets:', error);
      toast({
        title: "Error",
        description: "Failed to load your betting history.",
        variant: "destructive"
      });
      setUserBets([]);
    } finally {
      setLoadingUserBets(false);
    }
  };

  // Handler to open the "My Bets" modal and fetch data
  const handleOpenMyBetsModal = () => {
    setShowMyBetsModal(true);
    fetchUserBets(); // Fetch bets when the modal is opened
  };

  // Render a loading message while events are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <main className="pt-24 pb-20 md:pb-8 md:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-lg mt-10">Loading betting events...</p>
          </div>
        </main>
      </div>
    );
  }

  // Render a message if no betting events are available after loading
  if (bettingEvents.length === 0) {
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
            <p className="text-center text-muted-foreground text-lg mt-10">No betting events available at the moment. Please check back later!</p>
          </div>
        </main>
      </div>
    );
  }

  // Main render of the Betting component
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />



      <main className="pt-24 pb-20 md:pb-8 md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8"> {/* This div no longer needs to contain the button */}
            <h1 className="text-3xl font-bold mb-2">Betting Events</h1>
            <p className="text-muted-foreground">Place virtual bets on sports, predictions, and other events</p>
            
          </div>

          {/* Information banner about how betting works */}
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

          {/* Filter badges for event types */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="default" className="px-3 py-1.5 text-sm cursor-pointer">All Events</Badge>
            <Badge variant="outline" className="px-3 py-1.5 text-sm cursor-pointer">Sports</Badge>
            <Badge variant="outline" className="px-3 py-1.5 text-sm cursor-pointer">Predictions</Badge>
                  {/* Moved NEW: My Bets button to be a direct child of the main wrapper div */}
      <Button
        variant="outline"
        onClick={handleOpenMyBetsModal}
        className="top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-md shadow-lg bg-cyan-800" // Increased z-index
      >
        <Ticket className="h-4 w-4" />
        My Bets
      </Button>
          </div>

          {/* Grid to display individual betting event cards */}
          <div className="grid grid-cols-1 gap-6">
            {bettingEvents.map(event => (
              <Card key={event.id} className="p-6">
                <div className="md:flex">
                  <div className="flex-1 md:pr-6">
                    {/* Event header with type badge and end date */}
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={event.type === 'Sports' ? 'default' : 'outline'}>
                        {event.type}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {new Date(event.endDate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Event name and description */}
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <p className="text-muted-foreground mb-4">{event.description}</p>

                    {/* Total betting pool information */}
                    <div className="mb-4">
                      <div className="flex items-center text-sm font-medium mb-2">
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        Total Pool: {formatCurrency(event.totalPool)}
                      </div>
                    </div>

                    {/* Betting options */}
                    <div className="space-y-3 mb-6">
                      <div className="font-medium">Betting Options:</div>
                      {/* Added a defensive check for event.options before mapping */}
                      {event.options && event.options.map(option => (
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

                  {/* Bet placement section */}
                  <div className="md:w-72 border-t md:border-l md:border-t-0 pt-4 md:pt-0 md:pl-6">
                    <div className="mb-4">
                      <label htmlFor={`bet-amount-${event.id}`} className="block text-sm font-medium mb-1">Your Bet Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                          id={`bet-amount-${event.id}`}
                          type="number"
                          min="1"
                          value={betAmounts[event.id] || ''}
                          onChange={(e) => handleBetAmountChange(event.id, e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-input rounded-md"
                          placeholder="Amount in VC"
                        />
                      </div>
                    </div>

                    {/* Display potential win if an option is selected and amount is entered */}
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

                    {/* Place Bet button */}
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handlePlaceBet(event.id)}
                      // Disable button if no option is selected or amount is not greater than 0
                      disabled={!selectedOptions[event.id] || !(betAmounts[event.id] > 0)}
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Place Bet
                    </Button>

                    {/* Buy Event button (placeholder for future functionality) */}
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => { /* TODO: Implement Buy Event logic */ }}
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

      {/* My Bets Modal */}
      {showMyBetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">My Betting History</h2>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setShowMyBetsModal(false)}
            >
              <XCircle className="h-6 w-6" />
            </Button>

            {loadingUserBets ? (
              <p className="text-center text-muted-foreground">Loading your bets...</p>
            ) : userBets.length === 0 ? (
              <p className="text-center text-muted-foreground">You haven't placed any bets yet.</p>
            ) : (
              <div className="space-y-4">
                {userBets.map(bet => (
                  <Card key={bet._id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-lg">{bet.event.title}</h4>
                      <Badge variant="secondary">{new Date(bet.createdAt).toLocaleDateString()}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-1">
                      Bet on: <span className="font-medium text-foreground">{bet.selectedOption}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Amount: <span className="font-medium text-foreground">{formatCurrency(bet.amount)} VC</span>
                    </p>
                    {/* You can add more details here, e.g., potential win, outcome if event is closed */}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Betting;
