import { useState } from 'react';
import { Transaction } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowDownCircle, ArrowUpCircle, Smartphone, Trash2, Ban, AlertCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onCancelTransaction: (id: string, reason: string) => void;
}

export function TransactionList({ transactions, onDeleteTransaction, onCancelTransaction }: TransactionListProps) {
  const [cancelReason, setCancelReason] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCancelClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleCancelSubmit = () => {
    if (!selectedTransactionId) return;
    
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    onCancelTransaction(selectedTransactionId, cancelReason);
    setCancelDialogOpen(false);
    setSelectedTransactionId(null);
    setCancelReason('');
    toast.success('Transaction cancelled successfully');
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>No transactions for this date</p>
          <p className="text-sm mt-2">Add a transaction to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All transactions for selected date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-start gap-3 p-4 border rounded-lg transition-colors ${
                  transaction.status === 'cancelled' 
                    ? 'bg-gray-50 opacity-60 border-gray-300' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  transaction.status === 'cancelled'
                    ? 'bg-gray-200'
                    : transaction.type === 'deposit' 
                      ? 'bg-green-100' 
                      : transaction.type === 'withdrawal'
                        ? 'bg-red-100'
                        : 'bg-purple-100'
                }`}>
                  {transaction.status === 'cancelled' ? (
                    <Ban className="size-5 text-gray-600" />
                  ) : transaction.type === 'deposit' ? (
                    <ArrowDownCircle className="size-5 text-green-600" />
                  ) : transaction.type === 'withdrawal' ? (
                    <ArrowUpCircle className="size-5 text-red-600" />
                  ) : (
                    <Smartphone className="size-5 text-purple-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={transaction.status === 'cancelled' ? 'line-through text-gray-500' : ''}>
                          {transaction.customerName}
                        </p>
                        {transaction.status === 'cancelled' && (
                          <Badge variant="destructive" className="text-xs">Cancelled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{transaction.customerPhone}</p>
                      {transaction.reference && (
                        <p className="text-xs text-gray-500 mt-1">Ref: {transaction.reference}</p>
                      )}
                      {transaction.status === 'cancelled' && transaction.cancelReason && (
                        <div className="flex items-start gap-1 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          <AlertCircle className="size-3 mt-0.5 shrink-0" />
                          <span>Reason: {transaction.cancelReason}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`${
                        transaction.status === 'cancelled'
                          ? 'text-gray-400 line-through'
                          : transaction.type === 'deposit' 
                            ? 'text-green-600' 
                            : transaction.type === 'withdrawal'
                              ? 'text-red-600'
                              : 'text-purple-600'
                      }`}>
                        {transaction.type === 'airtime' ? '' : transaction.type === 'deposit' ? '+' : '-'} {formatAmount(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(transaction.timestamp)}</p>
                    </div>
                  </div>
                </div>

                {transaction.status === 'active' && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => handleCancelClick(transaction.id)}
                    >
                      <Ban className="size-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this transaction from the records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteTransaction(transaction.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Transaction Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Transaction</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this transaction. This action will mark the transaction as cancelled but keep it in the records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Cancellation Reason *</Label>
              <Input
                id="cancelReason"
                placeholder="e.g., Customer requested reversal, Wrong amount entered..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={handleCancelSubmit}>
              Cancel Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
