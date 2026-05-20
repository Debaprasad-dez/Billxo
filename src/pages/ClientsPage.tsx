
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useBilling } from '@/hooks/useBilling';
import { Client } from '@/types/invoice';
import { formatCurrency, getAmountPaid } from '@/utils/helpers';
import { Search, UserPlus, Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react';

const EMPTY: Client = { id: '', name: '', email: '', address: '', city: '', state: '', zip: '', phone: '', company: '' };

const ClientsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients, invoices, upsertClient, deleteClient } = useBilling();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Client>(EMPTY);
  const [editing, setEditing] = useState(false);

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; billed: number; collected: number }>();
    invoices.forEach(i => {
      const key = i.client.name.toLowerCase();
      const e = map.get(key) ?? { count: 0, billed: 0, collected: 0 };
      e.count++; e.billed += i.grandTotal; e.collected += getAmountPaid(i);
      map.set(key, e);
    });
    return map;
  }, [invoices]);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return clients
      .filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company ?? '').toLowerCase().includes(q))
      .map(c => ({ client: c, stat: stats.get(c.name.toLowerCase()) ?? { count: 0, billed: 0, collected: 0 } }));
  }, [clients, search, stats]);

  const set = (k: keyof Client, v: string) => setDraft(p => ({ ...p, [k]: v }));

  const save = () => {
    if (!draft.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    upsertClient(draft);
    toast({ title: editing ? 'Client updated' : 'Client added', description: draft.name });
    setOpen(false); setDraft(EMPTY); setEditing(false);
  };

  const edit = (c: Client) => { setDraft(c); setEditing(true); setOpen(true); };
  const add = () => { setDraft(EMPTY); setEditing(false); setOpen(true); };
  const remove = (c: Client) => {
    if (window.confirm(`Delete client "${c.name}"?`)) { deleteClient(c.id); toast({ title: 'Client deleted' }); }
  };

  const totalBilled = [...stats.values()].reduce((s, x) => s + x.billed, 0);

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Clients</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{clients.length} clients · {formatCurrency(totalBilled)} billed</p>
          </div>
          <Button size="sm" className="gap-1.5 rounded-lg font-display font-semibold" onClick={add}>
            <UserPlus size={15} /> Add Client
          </Button>
        </div>

        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" className="pl-8 h-9 text-sm" />
        </div>

        {rows.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map(({ client, stat }) => (
              <div key={client.id} className="rounded-xl border bg-card p-4 transition-all hover:shadow-md group" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-foreground truncate">{client.name}</p>
                    {client.company && <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Building2 size={11} /> {client.company}</p>}
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => edit(client)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil size={13} /></button>
                    <button onClick={() => remove(client)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {client.email && <p className="flex items-center gap-1.5 truncate"><Mail size={11} /> {client.email}</p>}
                  {client.phone && <p className="flex items-center gap-1.5"><Phone size={11} /> {client.phone}</p>}
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{stat.count} invoice{stat.count !== 1 ? 's' : ''}</span>
                  <span className="font-mono font-semibold text-foreground">{formatCurrency(stat.billed)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-16 text-center px-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <UserPlus size={28} className="text-muted-foreground/40 mb-3" />
            <h3 className="font-display font-semibold text-foreground mb-1 text-sm">{clients.length === 0 ? 'No clients yet' : 'No matches'}</h3>
            <p className="text-xs text-muted-foreground mb-4">{clients.length === 0 ? 'Add your first client to reuse on invoices.' : 'Try a different search.'}</p>
            {clients.length === 0 && <Button size="sm" className="gap-1.5 rounded-lg" onClick={add}><UserPlus size={14} /> Add Client</Button>}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit Client' : 'Add Client'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Name *</Label><Input value={draft.name} onChange={e => set('name', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Company</Label><Input value={draft.company ?? ''} onChange={e => set('company', e.target.value)} className="h-9" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input type="email" value={draft.email} onChange={e => set('email', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={draft.phone} onChange={e => set('phone', e.target.value)} className="h-9" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Address</Label><Input value={draft.address} onChange={e => set('address', e.target.value)} className="h-9" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">City</Label><Input value={draft.city} onChange={e => set('city', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">State</Label><Input value={draft.state} onChange={e => set('state', e.target.value)} className="h-9" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Zip</Label><Input value={draft.zip} onChange={e => set('zip', e.target.value)} className="h-9" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save Changes' : 'Add Client'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ClientsPage;
