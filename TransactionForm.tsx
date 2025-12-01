import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ArrowDownCircle, ArrowUpCircle, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TransactionFormProps {
  onAddTransaction: (transaction: {
    type: 'deposit' | 'withdrawal' | 'airtime';
    amount: number;
    customerName: string;
    customerPhone: string;
    reference: string;
  }) => void;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [type, setType] = useState<'deposit' | 'withdrawal' | 'airtime'>('deposit');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reference, setReference] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!customerName || !customerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAddTransaction({
      type,
      amount: parseFloat(amount),
      customerName,
      customerPhone,
      reference,
    });

    // Reset form
    setAmount('');
    setCustomerName('');
    setCustomerPhone('');
    setReference('');
    
    const typeLabels = {
      deposit: 'Money In',
      withdrawal: 'Money Out',
      airtime: 'Airtime Purchase'
    };
    toast.success(`Transaction recorded: ${typeLabels[type]}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Transaction</CardTitle>
        <CardDescription>Record a new mobile money transaction</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'deposit' | 'withdrawal' | 'airtime')}>
              <div className="grid grid-cols-3 gap-2">
                <label
                  htmlFor="deposit"
                  className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    type === 'deposit'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="deposit" id="deposit" className="sr-only" />
                  <ArrowDownCircle className={`size-6 ${type === 'deposit' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <div className={`text-sm ${type === 'deposit' ? 'text-green-700' : ''}`}>Deposit</div>
                    <div className="text-xs text-gray-500">Money In</div>
                  </div>
                </label>
                
                <label
                  htmlFor="withdrawal"
                  className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    type === 'withdrawal'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="withdrawal" id="withdrawal" className="sr-only" />
                  <ArrowUpCircle className={`size-6 ${type === 'withdrawal' ? 'text-red-600' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <div className={`text-sm ${type === 'withdrawal' ? 'text-red-700' : ''}`}>Withdrawal</div>
                    <div className="text-xs text-gray-500">Money Out</div>
                  </div>
                </label>

                <label
                  htmlFor="airtime"
                  className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    type === 'airtime'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="airtime" id="airtime" className="sr-only" />
                  <Smartphone className={`size-6 ${type === 'airtime' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <div className={`text-sm ${type === 'airtime' ? 'text-purple-700' : ''}`}>Airtime</div>
                    <div className="text-xs text-gray-500">Purchase</div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Customer Phone *</Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="Enter phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference / Note</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Transaction reference (optional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Record Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}