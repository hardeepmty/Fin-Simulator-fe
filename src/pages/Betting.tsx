import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext'; // Import useSimulation
import Header from '@/components/Layout/Header';
import Navigation from '@/components/Layout/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, Ticket, TrendingUp, Info, XCircle, PlusCircle, CheckCircle } from 'lucide-react';
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
  isClosed: boolean; // Added for declare result functionality
}

// Define the interface for a user's bet (from the backend's Bet model)
interface UserBet {
  _id: string;
  user: string; // User ID
  event: {
    _id: string;
    title: string;
    isClosed: boolean;
    winner: string | null;
  };
  selectedOption: string; // The name of the option (e.g., "India wins")
  amount: number;
  createdAt: string;
}

const Betting = () => {
  // Access virtual currency and user object from the simulation context
  const { virtualCurrency, user } = useSimulation(); // Destructure user here
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

  // NEW: State for Admin Panel
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  // userRole is now derived from context: const [userRole, setUserRole] = useState<string>('Beginner'); // This state is no longer needed here

  // NEW: States for Create Event form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState(''); // Expected format for datetime-local
  const [newEventOutcomes, setNewEventOutcomes] = useState<string[]>(['', '']); // Start with two empty outcomes

  // NEW: States for Declare Result form
  const [selectedEventToDeclare, setSelectedEventToDeclare] = useState<string>('');
  const [selectedWinningOption, setSelectedWinningOption] = useState<string>('');
  const [activeEvents, setActiveEvents] = useState<BettingEvent[]>([]); // For declare result dropdown

  // useEffect hook to fetch all betting events when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/betting/getAllEvents');
        const transformedEvents: BettingEvent[] = Array.isArray(response.data)
          ? response.data.map((event: any) => ({
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
              isClosed: event.isClosed, // Include isClosed
            }))
          : [];
        setBettingEvents(transformedEvents);
        // Filter for active events for the declare result dropdown
        setActiveEvents(transformedEvents.filter(event => !event.isClosed));
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load betting events",
          variant: "destructive"
        });
        setBettingEvents([]);
        setActiveEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Removed direct JWT decoding for user role, now relying on SimulationContext
    // The user role is now managed by the SimulationProvider and accessed via the `user` object.
    // No need for separate `fetchUserRole` logic here.

    fetchEvents();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSelectOption = (eventId: string, optionId: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [eventId]: optionId
    });
  };

  const handleBetAmountChange = (eventId: string, amount: string) => {
    const numAmount = parseInt(amount);
    if (!isNaN(numAmount)) {
      setBetAmounts({
        ...betAmounts,
        [eventId]: numAmount > 0 ? numAmount : 0
      });
    } else {
      setBetAmounts({
        ...betAmounts,
        [eventId]: 0
      });
    }
  };

  const handlePlaceBet = async (eventId: string) => {
    const optionId = selectedOptions[eventId];
    const amount = betAmounts[eventId] || 0;

    if (!optionId) {
      toast({ title: "No option selected", description: "Please select an outcome to bet on", variant: "destructive" });
      return;
    }
    if (amount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid betting amount", variant: "destructive" });
      return;
    }
    if (amount > virtualCurrency) {
      toast({ title: "Insufficient funds", description: `You need ${formatCurrency(amount)} VC to place this bet`, variant: "destructive" });
      return;
    }

    try {
      const authToken = localStorage.getItem('token'); // Use 'token'
      if (!authToken) {
        toast({ title: "Authentication Error", description: "You are not authenticated. Please log in.", variant: "destructive" });
        return;
      }

      const event = bettingEvents.find(e => e.id === eventId);
      const selectedOptionObject = event?.options.find(o => o.id === optionId);

      if (!selectedOptionObject) {
        toast({ title: "Error", description: "Selected option not found for this event.", variant: "destructive" });
        return;
      }

      await axios.post(`http://localhost:8000/api/betting/${eventId}/bet`,
        { selectedOption: selectedOptionObject.name, amount },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      toast({ title: "Bet placed successfully", description: `${formatCurrency(amount)} VC on "${selectedOptionObject.name}"` });

      // Refresh events to get updated odds and pools
      const eventsResponse = await axios.get('http://localhost:8000/api/betting/getAllEvents');
      const refreshedTransformedEvents: BettingEvent[] = Array.isArray(eventsResponse.data)
        ? eventsResponse.data.map((event: any) => ({
            id: event._id, name: event.title, description: event.description, type: event.type,
            totalPool: event.totalPool, endDate: event.eventDate,
            options: Array.isArray(event.outcomes) ? event.outcomes.map((outcome: any) => ({
                id: outcome._id, name: outcome.option, odds: outcome.multiplier,
              })) : [],
            isClosed: event.isClosed,
          }))
        : [];
      setBettingEvents(refreshedTransformedEvents);
      setActiveEvents(refreshedTransformedEvents.filter(event => !event.isClosed));


      setSelectedOptions(prev => ({ ...prev, [eventId]: '' }));
      setBetAmounts(prev => ({ ...prev, [eventId]: 0 }));

    } catch (error) {
      console.error('Error placing bet:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast({ title: "Unauthorized", description: "Your session has expired or you are not authorized. Please log in again.", variant: "destructive" });
      } else {
        toast({ title: "Bet failed", description: "There was an error processing your bet", variant: "destructive" });
      }
    }
  };

  // Function to fetch user's betting history
  const fetchUserBets = async () => {
    setLoadingUserBets(true);
    try {
      const authToken = localStorage.getItem('token'); // Use 'token'
      if (!authToken) {
        toast({ title: "Authentication Error", description: "Please log in to view your bets.", variant: "destructive" });
        setLoadingUserBets(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/api/betting/getMyBets', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUserBets(response.data);
    } catch (error) {
      console.error('Error fetching user bets:', error);
      toast({ title: "Error", description: "Failed to load your betting history.", variant: "destructive" });
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

  // NEW: Admin Panel Functions
  const handleAddOutcome = () => {
    setNewEventOutcomes([...newEventOutcomes, '']);
  };

  const handleRemoveOutcome = (index: number) => {
    const updatedOutcomes = newEventOutcomes.filter((_, i) => i !== index);
    setNewEventOutcomes(updatedOutcomes);
  };

  const handleOutcomeChange = (index: number, value: string) => {
    const updatedOutcomes = [...newEventOutcomes];
    updatedOutcomes[index] = value;
    setNewEventOutcomes(updatedOutcomes);
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle || !newEventDate || newEventOutcomes.some(o => !o.trim())) {
      toast({ title: "Invalid Input", description: "Please fill all required fields and provide at least two outcomes.", variant: "destructive" });
      return;
    }
    if (newEventOutcomes.length < 2) {
      toast({ title: "Invalid Outcomes", description: "Please provide at least two outcomes.", variant: "destructive" });
      return;
    }

    try {
      const authToken = localStorage.getItem('token'); // Use 'token'
      if (!authToken) {
        toast({ title: "Authentication Error", description: "You are not authenticated.", variant: "destructive" });
        return;
      }

      await axios.post('http://localhost:8000/api/betting/create',
        {
          title: newEventTitle,
          description: newEventDescription,
          eventDate: newEventDate,
          outcomes: newEventOutcomes.filter(o => o.trim() !== '') // Send only non-empty outcomes
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      toast({ title: "Event Created", description: `"${newEventTitle}" has been created successfully.`, });
      // Clear form and refresh events
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventDate('');
      setNewEventOutcomes(['', '']);
      // Re-fetch all events to update the main list and active events for declare result
      const eventsResponse = await axios.get('http://localhost:8000/api/betting/getAllEvents');
      const refreshedTransformedEvents: BettingEvent[] = Array.isArray(eventsResponse.data)
        ? eventsResponse.data.map((event: any) => ({
            id: event._id, name: event.title, description: event.description, type: event.type,
            totalPool: event.totalPool, endDate: event.eventDate,
            options: Array.isArray(event.outcomes) ? event.outcomes.map((outcome: any) => ({
                id: outcome._id, name: outcome.option, odds: outcome.multiplier,
              })) : [],
            isClosed: event.isClosed,
          }))
        : [];
      setBettingEvents(refreshedTransformedEvents);
      setActiveEvents(refreshedTransformedEvents.filter(event => !event.isClosed));

    } catch (error) {
      console.error('Error creating event:', error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast({ title: "Access Denied", description: "You do not have administrative privileges to create events.", variant: "destructive" });
      } else {
        toast({ title: "Creation Failed", description: "Failed to create event.", variant: "destructive" });
      }
    }
  };

  const handleDeclareResult = async () => {
    if (!selectedEventToDeclare || !selectedWinningOption) {
      toast({ title: "Missing Selection", description: "Please select an event and a winning option.", variant: "destructive" });
      return;
    }

    try {
      const authToken = localStorage.getItem('token'); // Use 'token'
      if (!authToken) {
        toast({ title: "Authentication Error", description: "You are not authenticated.", variant: "destructive" });
        return;
      }

      await axios.post(`http://localhost:8000/api/betting/events/${selectedEventToDeclare}/declare`,
        { winningOption: selectedWinningOption },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      toast({ title: "Result Declared", description: `Result for event declared successfully!`, });
      // Clear form and refresh events
      setSelectedEventToDeclare('');
      setSelectedWinningOption('');
      // Re-fetch all events to update the main list and active events for declare result
      const eventsResponse = await axios.get('http://localhost:8000/api/betting/getAllEvents');
      const refreshedTransformedEvents: BettingEvent[] = Array.isArray(eventsResponse.data)
        ? eventsResponse.data.map((event: any) => ({
            id: event._id, name: event.title, description: event.description, type: event.type,
            totalPool: event.totalPool, endDate: event.eventDate,
            options: Array.isArray(event.outcomes) ? event.outcomes.map((outcome: any) => ({
                id: outcome._id, name: outcome.option, odds: outcome.multiplier,
              })) : [],
            isClosed: event.isClosed,
          }))
        : [];
      setBettingEvents(refreshedTransformedEvents);
      setActiveEvents(refreshedTransformedEvents.filter(event => !event.isClosed));

    } catch (error) {
      console.error('Error declaring result:', error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast({ title: "Access Denied", description: "You do not have administrative privileges to declare results.", variant: "destructive" });
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast({ title: "Declaration Failed", description: error.response.data.message, variant: "destructive" });
      } else {
        toast({ title: "Declaration Failed", description: "Failed to declare result.", variant: "destructive" });
      }
    }
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


      {/* NEW: Admin Panel button, fixed to the top-right, slightly below My Bets */}
      {user?.role === 'Admin' && ( // Check user?.role from context
        <Button
          variant="default"
          onClick={() => setShowAdminPanelModal(true)}
          className="fixed top-20 right-6 z-[100] flex items-center gap-2 px-4 py-2 rounded-md shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Info className="h-4 w-4" />
          Admin Panel
        </Button>
      )}

      <main className="pt-24 pb-20 md:pb-8 md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
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
            <Button
                variant="outline"
                onClick={handleOpenMyBetsModal}
                className="top-6 right-6  flex items-center gap-2 px-4 py-2 rounded-md shadow-lg bg-cyan-800 text-white hover:bg-cyan-700"
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
                    {/* Display if event is closed and winner is declared */}
                    {bet.event.isClosed && (
                      <p className={`text-sm font-medium ${bet.selectedOption === bet.event.winner ? 'text-green-500' : 'text-red-500'}`}>
                        Outcome: {bet.event.winner ? `Winner: ${bet.event.winner}` : 'Result Pending'}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW: Admin Panel Modal */}
      {showAdminPanelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl mx-auto p-8 bg-card rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Admin Panel</h2>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdminPanelModal(false)}
            >
              <XCircle className="h-7 w-7" />
            </Button>

            {/* Create New Event Section */}
            <div className="mb-8 p-6 border rounded-lg bg-secondary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Create New Betting Event
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="newEventTitle" className="block text-sm font-medium mb-1">Event Title</label>
                  <input
                    id="newEventTitle"
                    type="text"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g., India vs Australia ODI Final"
                  />
                </div>
                <div>
                  <label htmlFor="newEventDate" className="block text-sm font-medium mb-1">Event Date & Time</label>
                  <input
                    id="newEventDate"
                    type="datetime-local"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="newEventDescription" className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  id="newEventDescription"
                  className="w-full p-2 border border-input rounded-md bg-background min-h-[80px]"
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Brief description of the event"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Outcomes (at least 2)</label>
                {newEventOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border border-input rounded-md bg-background"
                      value={outcome}
                      onChange={(e) => handleOutcomeChange(index, e.target.value)}
                      placeholder={`Outcome ${index + 1}`}
                    />
                    {newEventOutcomes.length > 2 && (
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveOutcome(index)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="secondary" onClick={handleAddOutcome} className="mt-2 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Add Another Outcome
                </Button>
              </div>
              <Button onClick={handleCreateEvent} className="w-full flex items-center gap-2">
                Create Event
              </Button>
            </div>

            {/* Declare Result Section */}
            <div className="p-6 border rounded-lg bg-secondary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Declare Event Result
              </h3>
              <div className="mb-4">
                <label htmlFor="selectEvent" className="block text-sm font-medium mb-1">Select Event</label>
                <select
                  id="selectEvent"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={selectedEventToDeclare}
                  onChange={(e) => {
                    setSelectedEventToDeclare(e.target.value);
                    setSelectedWinningOption(''); // Reset winning option when event changes
                  }}
                >
                  <option value="">-- Select an active event --</option>
                  {activeEvents.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
              {selectedEventToDeclare && (
                <div className="mb-4">
                  <label htmlFor="selectWinningOption" className="block text-sm font-medium mb-1">Select Winning Option</label>
                  <select
                    id="selectWinningOption"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={selectedWinningOption}
                    onChange={(e) => setSelectedWinningOption(e.target.value)}
                  >
                    <option value="">-- Select winning option --</option>
                    {bettingEvents.find(e => e.id === selectedEventToDeclare)?.options.map(option => (
                      <option key={option.id} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button
                onClick={handleDeclareResult}
                className="w-full flex items-center gap-2"
                disabled={!selectedEventToDeclare || !selectedWinningOption}
              >
                Declare Result
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Betting;
