
import { useState } from 'react';
import { Invoice, PaymentMethod } from '@/types/invoice';
import { useBilling } from '@/hooks/useBilling';
import { formatCurrency, getAmountPaid, getBalance, PAYMENT_METHOD_LABELS } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
  invoice: Invoice;
  onChanged?: () => void;
}

export const PaymentsPanel = ({ invoice, onChanged }: Props) => {
  const { addPayment, removePayment } = useBilling();
  const { toast } = useToast();
  const balance = getBalance(invoice);
  const paid = getAmountPaid(invoice);
  const pct = invoice.grandTotal > 0 ? Math.min(100, Math.round((paid / invoice.grandTotal) * 100)) : 0;

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('bank-transfer');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');

  const submit = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: 'Enter a valid amount', variant: 'destructive' });
      return;
    }
    addPayment(invoice.id, { amount: amt, method, date, reference: reference || undefined });
    setAmount(''); setReference('');
    toast({ title: 'Payment recorded', description: formatCurrency(amt, invoice.currency) });
    onChanged?.();
  };

  const payFull = () => {
    if (balance <= 0) return;
    addPayment(invoice.id, { amount: balance, method, date });
    toast({ title: 'Marked as paid in full' });
    onChanged?.();
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Payments</h3>
        {balance <= 0 && paid > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={14} /> Paid in full
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{formatCurrency(paid, invoice.currency)} of {formatCurrency(invoice.grandTotal, invoice.currency)}</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        {balance > 0 && <p className="text-xs text-muted-foreground">Balance due: <span className="font-semibold text-foreground">{formatCurrency(balance, invoice.currency)}</span></p>}
      </div>

      {/* Existing payments */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="space-y-1.5">
          {invoice.payments.map(p => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
              <span className="font-mono font-semibold text-foreground">{formatCurrency(p.amount, invoice.currency)}</span>
              <span className="text-xs text-muted-foreground">{PAYMENT_METHOD_LABELS[p.method]}</span>
              <span className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</span>
              {p.reference && <span className="text-xs text-muted-foreground truncate">· {p.reference}</span>}
              <button onClick={() => { removePayment(invoice.id, p.id); onChanged?.(); }} className="ml-auto p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Record payment */}
      {balance > 0 && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Amount</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={balance.toFixed(2)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Method</Label>
              <Select value={method} onValueChange={v => setMethod(v as PaymentMethod)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reference (optional)</Label>
              <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Txn ID / cheque #" className="h-9" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="gap-1.5 rounded-lg" onClick={submit}><Plus size={14} /> Record Payment</Button>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={payFull}>Pay Full Balance</Button>
          </div>
        </div>
      )}
    </div>
  );
};
