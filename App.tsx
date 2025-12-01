import { useState, useEffect } from 'react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DailySummary } from './components/DailySummary';
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Wallet, LogOut, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'airtime';
  amount: number;
  customerName: string;
  customerPhone: string;
  reference: string;
  timestamp: string;
  date: string;
  status: 'active' | 'cancelled';
  cancelledAt?: string;
  cancelReason?: string;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Load transactions from localStorage on mount (filtered by user)
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`transactions_${user.id}`);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    }
  }, [user]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp' | 'date' | 'status'>) => {
    const now = new Date();
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      status: 'active',
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const cancelTransaction = (id: string, reason: string) => {
    setTransactions(transactions.map(t => 
      t.id === id 
        ? { 
            ...t, 
            status: 'cancelled' as const, 
            cancelledAt: new Date().toISOString(),
            cancelReason: reason 
          }
        : t
    ));
  };

  const filteredTransactions = transactions.filter(t => t.date === selectedDate);

  // Conditional rendering without early returns
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Wallet className="size-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Wallet className="size-6" />
            </div>
            <div>
              <h1 className="text-xl">Mobile Money Tracker</h1>
              <p className="text-blue-100 text-sm">Merchant Dashboard</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-blue-100 text-sm mt-2">
          <User className="size-4" />
          <span>{user.name} ({user.email})</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Daily Summary */}
        <DailySummary 
          transactions={filteredTransactions} 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Tabs */}
        <Tabs defaultValue="add" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Transaction</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="mt-4">
            <TransactionForm onAddTransaction={addTransaction} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <TransactionList 
              transactions={filteredTransactions}
              onDeleteTransaction={deleteTransaction}
              onCancelTransaction={cancelTransaction}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}