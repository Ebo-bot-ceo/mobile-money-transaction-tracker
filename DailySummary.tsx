import { Transaction } from '../App';
import { Card, CardContent } from './ui/card';
import { ArrowDownCircle, ArrowUpCircle, Smartphone, TrendingUp } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DailySummaryProps {
  transactions: Transaction[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DailySummary({ transactions, selectedDate, onDateChange }: DailySummaryProps) {
  // Only count active transactions
  const activeTransactions = transactions.filter(t => t.status === 'active');
  
  const totalReceived = activeTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSent = activeTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAirtime = activeTransactions
    .filter(t => t.type === 'airtime')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalReceived - totalSent;

  const cancelledCount = transactions.filter(t => t.status === 'cancelled').length;

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="space-y-2">
        <Label htmlFor="date">Select Date</Label>
        <Input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3">
        {/* Money In */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Deposits (Money In)</p>
                <p className="text-2xl text-green-900 mt-1">
                  {formatAmount(totalReceived)}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <ArrowDownCircle className="size-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Money Out */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Withdrawals (Money Out)</p>
                <p className="text-2xl text-red-900 mt-1">
                  {formatAmount(totalSent)}
                </p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <ArrowUpCircle className="size-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Net Balance</p>
                <p className={`text-2xl mt-1 ${
                  balance >= 0 ? 'text-blue-900' : 'text-red-700'
                }`}>
                  {balance >= 0 ? '+' : ''}{formatAmount(balance)}
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <TrendingUp className="size-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Airtime Sales */}
        {totalAirtime > 0 && (
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">Airtime Sales</p>
                  <p className="text-2xl text-purple-900 mt-1">
                    {formatAmount(totalAirtime)}
                  </p>
                </div>
                <div className="bg-purple-200 p-3 rounded-full">
                  <Smartphone className="size-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transaction Count */}
      <div className="text-center text-sm text-gray-600">
        {activeTransactions.length} active transaction{activeTransactions.length !== 1 ? 's' : ''}
        {cancelledCount > 0 && (
          <span className="text-red-600"> · {cancelledCount} cancelled</span>
        )}
      </div>
    </div>
  );
}