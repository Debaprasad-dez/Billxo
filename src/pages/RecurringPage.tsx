
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useBilling } from '@/hooks/useBilling';
import { RecurringFrequency, RecurringProfile } from '@/types/invoice';
import { formatCurrency } from '@/utils/helpers';
import { Repeat, Plus, Play, Trash2, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly',
};

const RecurringPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invoices, recurring, upsertRecurring, deleteRecurring, runRecurring } = useBilling();
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [freq, setFreq] = useState<RecurringFrequency>('monthly');
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);

  const create = () => {
    if (!templateId) { toast({ title: 'Pick a template invoice', variant: 'destructive' }); return; }
    const profile: RecurringProfile = {
      id: uuidv4(), templateInvoiceId: templateId, frequency: freq,
      nextRunDate: nextDate, active: true, occurrences: 0,
    };
    upsertRecurring(profile);
    toast({ title: 'Recurring schedule created' });
    setOpen(false); setTemplateId('');
  };

  const run = (id: string) => {
    const inv = runRecurring(id);
    if (inv) { toast({ title: 'Invoice generated', description: inv.invoiceNumber }); navigate(`/invoice/${inv.id}`); }
  };

  const toggle = (p: RecurringProfile) => upsertRecurring({ ...p, active: !p.active });

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Recurring Invoices</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{recurring.length} active schedules</p>
          </div>
          <Button size="sm" className="gap-1.5 rounded-lg font-display font-semibold" onClick={() => setOpen(true)} disabled={!invoices.length}>
            <Plus size={15} /> New Schedule
          </Button>
        </div>

        {recurring.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recurring.map(p => {
              const tpl = invoices.find(i => i.id === p.templateInvoiceId);
              return (
                <div key={p.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Repeat size={16} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-foreground truncate">{tpl?.client.name ?? 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{FREQ_LABELS[p.frequency]} · {tpl ? formatCurrency(tpl.grandTotal, tpl.currency) : '—'}</p>
                      </div>
                    </div>
                    <Switch checked={p.active} onCheckedChange={() => toggle(p)} />
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar size={11} /> Next: {new Date(p.nextRunDate).toLocaleDateString()}
                    </span>
                    <span className="text-muted-foreground">{p.occurrences} generated</span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 rounded-lg flex-1" onClick={() => run(p.id)} disabled={!tpl}>
                      <Play size={13} /> Generate Now
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { deleteRecurring(p.id); toast({ title: 'Schedule removed' }); }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-16 text-center px-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <Repeat size={28} className="text-muted-foreground/40 mb-3" />
            <h3 className="font-display font-semibold text-foreground mb-1 text-sm">No recurring schedules</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">Automate repeat billing — pick an invoice as a template and set a frequency.</p>
            {invoices.length === 0
              ? <p className="text-xs text-muted-foreground">Create an invoice first.</p>
              : <Button size="sm" className="gap-1.5 rounded-lg" onClick={() => setOpen(true)}><Plus size={14} /> New Schedule</Button>}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">New Recurring Schedule</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Template Invoice</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select an invoice" /></SelectTrigger>
                <SelectContent>
                  {invoices.map(i => <SelectItem key={i.id} value={i.id}>{i.invoiceNumber} — {i.client.name} ({formatCurrency(i.grandTotal, i.currency)})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Frequency</Label>
                <Select value={freq} onValueChange={v => setFreq(v as RecurringFrequency)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQ_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Next Run Date</Label>
                <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default RecurringPage;
