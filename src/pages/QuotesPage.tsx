
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBilling } from '@/hooks/useBilling';
import { Quote, QuoteStatus, Client, Business } from '@/types/invoice';
import { formatCurrency, generateQuoteNumber, calculateSubtotal, calculateTaxTotal, calculateGrandTotal } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus, FileText, ArrowRight, CheckCircle2, XCircle, Clock, Send,
  Trash2, Copy, Eye, TrendingUp, DollarSign, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  declined: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  expired: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
};

const STATUS_ICONS: Record<QuoteStatus, React.FC<{ size?: number }>> = {
  draft: Clock, sent: Send, accepted: CheckCircle2, declined: XCircle, expired: Clock,
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Draft', sent: 'Sent', accepted: 'Accepted', declined: 'Declined', expired: 'Expired',
};

const defaultBusiness: Business = {
  name: '', logo: '', address: '', city: '', state: '', zip: '', phone: '', email: '',
};

const defaultClient: Client = {
  id: '', name: '', email: '', address: '', city: '', state: '', zip: '', phone: '',
};

const emptyQuote = (): Quote => ({
  id: uuidv4(),
  quoteNumber: generateQuoteNumber(),
  createdDate: new Date().toISOString().split('T')[0],
  expiryDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; })(),
  status: 'draft',
  business: defaultBusiness,
  client: { ...defaultClient, id: uuidv4() },
  lineItems: [{ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, tax: 0, total: 0 }],
  subTotal: 0, taxTotal: 0, discount: 0, discountType: 'percentage', grandTotal: 0,
  currency: '$', notes: '',
});

const QuoteDetailModal = ({
  quote, onClose, onStatusChange, onConvert,
}: {
  quote: Quote;
  onClose: () => void;
  onStatusChange: (id: string, s: QuoteStatus) => void;
  onConvert: (id: string) => void;
}) => {
  const expired = new Date(quote.expiryDate) < new Date() && quote.status === 'sent';
  const Icon = STATUS_ICONS[quote.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{quote.quoteNumber}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">For {quote.client.name || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', STATUS_COLORS[quote.status])}>
              <Icon size={11} /> {STATUS_LABELS[quote.status]}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">×</button>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-muted-foreground text-xs">Created</p><p className="font-medium text-foreground">{quote.createdDate}</p></div>
          <div><p className="text-muted-foreground text-xs">Expires</p><p className={cn('font-medium', expired ? 'text-red-500' : 'text-foreground')}>{quote.expiryDate}</p></div>
          <div><p className="text-muted-foreground text-xs">Total</p><p className="font-display font-bold text-foreground text-base">{formatCurrency(quote.grandTotal, quote.currency)}</p></div>
        </div>

        {/* Line items */}
        <div className="rounded-xl border overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Description</th><th className="text-right">Qty</th><th className="text-right">Unit Price</th><th className="text-right">Tax</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {quote.lineItems.map(li => (
                <tr key={li.id}>
                  <td>{li.description || '—'}</td>
                  <td className="text-right">{li.quantity}</td>
                  <td className="text-right">{formatCurrency(li.unitPrice, quote.currency)}</td>
                  <td className="text-right">{li.tax}%</td>
                  <td className="text-right font-semibold">{formatCurrency(li.total, quote.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="space-y-1 text-sm w-56">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(quote.subTotal, quote.currency)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{formatCurrency(quote.taxTotal, quote.currency)}</span></div>
            {quote.discount > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>-{formatCurrency(quote.discountType === 'percentage' ? quote.subTotal * (quote.discount / 100) : quote.discount, quote.currency)}</span></div>}
            <div className="flex justify-between font-display font-bold text-foreground border-t border-border pt-2"><span>Total</span><span>{formatCurrency(quote.grandTotal, quote.currency)}</span></div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{quote.notes}</div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap border-t border-border pt-4">
          {quote.status === 'draft' && (
            <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => onStatusChange(quote.id, 'sent')}>
              <Send size={13} /> Mark Sent
            </Button>
          )}
          {quote.status === 'sent' && (
            <>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-emerald-600" onClick={() => onStatusChange(quote.id, 'accepted')}>
                <CheckCircle2 size={13} /> Accept
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-red-500" onClick={() => onStatusChange(quote.id, 'declined')}>
                <XCircle size={13} /> Decline
              </Button>
            </>
          )}
          {(quote.status === 'accepted' || quote.status === 'sent') && !quote.convertedInvoiceId && (
            <Button size="sm" className="gap-1.5 rounded-lg font-display font-semibold ml-auto" onClick={() => onConvert(quote.id)}>
              <ArrowRight size={13} /> Convert to Invoice
            </Button>
          )}
          {quote.convertedInvoiceId && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ml-auto">
              <CheckCircle2 size={12} /> Converted to Invoice
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const QuoteEditorModal = ({
  initial, clients, onSave, onClose,
}: {
  initial: Quote;
  clients: Client[];
  onSave: (q: Quote) => void;
  onClose: () => void;
}) => {
  const [q, setQ] = useState<Quote>(initial);

  const setField = (k: keyof Quote, v: unknown) => {
    setQ(prev => {
      const next = { ...prev, [k]: v };
      const sub = calculateSubtotal(next.lineItems);
      const tax = calculateTaxTotal(next.lineItems);
      return { ...next, subTotal: sub, taxTotal: tax, grandTotal: calculateGrandTotal(sub, tax, next.discount, next.discountType) };
    });
  };

  const setClient = (clientId: string) => {
    const c = clients.find(x => x.id === clientId);
    if (c) setQ(prev => ({ ...prev, client: c }));
  };

  const addLine = () => setField('lineItems', [...q.lineItems, { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, tax: 0, total: 0 }]);

  const updateLine = (id: string, k: string, v: string | number) => {
    setField('lineItems', q.lineItems.map(li => {
      if (li.id !== id) return li;
      const updated = { ...li, [k]: v };
      updated.total = updated.quantity * updated.unitPrice * (1 + updated.tax / 100);
      return updated;
    }));
  };

  const removeLine = (id: string) => setField('lineItems', q.lineItems.filter(l => l.id !== id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl border max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">{initial.quoteNumber}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground text-lg">×</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Client</label>
            {clients.length > 0 ? (
              <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                value={q.client.id} onChange={e => setClient(e.target.value)}>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <Input value={q.client.name} onChange={e => setQ(prev => ({ ...prev, client: { ...prev.client, name: e.target.value } }))} placeholder="Client name" className="rounded-lg" />
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Currency</label>
            <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
              value={q.currency} onChange={e => setField('currency', e.target.value)}>
              {['$', '€', '£', '₹', 'CA$', 'A$', '¥'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Created Date</label>
            <Input type="date" value={q.createdDate} onChange={e => setField('createdDate', e.target.value)} className="rounded-lg" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Expiry Date</label>
            <Input type="date" value={q.expiryDate} onChange={e => setField('expiryDate', e.target.value)} className="rounded-lg" />
          </div>
        </div>

        {/* Line items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Line Items</label>
            <Button size="sm" variant="outline" className="gap-1 rounded-lg text-xs h-7" onClick={addLine}><Plus size={11} /> Add</Button>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Description</th><th className="w-20 text-right">Qty</th><th className="w-28 text-right">Price</th><th className="w-20 text-right">Tax%</th><th className="w-8"></th></tr></thead>
              <tbody>
                {q.lineItems.map(li => (
                  <tr key={li.id}>
                    <td><Input value={li.description} onChange={e => updateLine(li.id, 'description', e.target.value)} placeholder="Description" className="h-7 text-xs rounded-md border-0 bg-transparent px-0 focus-visible:ring-0" /></td>
                    <td><Input type="number" min={0} value={li.quantity} onChange={e => updateLine(li.id, 'quantity', +e.target.value)} className="h-7 text-xs rounded-md text-right w-full border-0 bg-transparent px-0 focus-visible:ring-0" /></td>
                    <td><Input type="number" min={0} step="0.01" value={li.unitPrice} onChange={e => updateLine(li.id, 'unitPrice', +e.target.value)} className="h-7 text-xs rounded-md text-right w-full border-0 bg-transparent px-0 focus-visible:ring-0" /></td>
                    <td><Input type="number" min={0} max={100} value={li.tax} onChange={e => updateLine(li.id, 'tax', +e.target.value)} className="h-7 text-xs rounded-md text-right w-full border-0 bg-transparent px-0 focus-visible:ring-0" /></td>
                    <td><button onClick={() => removeLine(li.id)} className="p-1 text-muted-foreground hover:text-red-500"><Trash2 size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <textarea value={q.notes} onChange={e => setField('notes', e.target.value)} rows={3}
              placeholder="Terms, conditions, or special notes…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(q.subTotal, q.currency)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{formatCurrency(q.taxTotal, q.currency)}</span></div>
            <div className="flex justify-between font-display font-bold text-foreground border-t border-border pt-2"><span>Total</span><span>{formatCurrency(q.grandTotal, q.currency)}</span></div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" className="rounded-lg" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="rounded-lg font-display font-semibold gap-1.5" onClick={() => onSave(q)}>
            <CheckCircle2 size={13} /> Save Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

const QuotesPage = () => {
  const navigate = useNavigate();
  const { quotes, clients, upsertQuote, deleteQuote, convertQuoteToInvoice } = useBilling();
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [newQuote, setNewQuote] = useState<Quote | null>(null);

  const m = useMemo(() => {
    const total = quotes.reduce((s, q) => s + q.grandTotal, 0);
    const accepted = quotes.filter(q => q.status === 'accepted').reduce((s, q) => s + q.grandTotal, 0);
    const rate = quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100) : 0;
    const pending = quotes.filter(q => q.status === 'sent').reduce((s, q) => s + q.grandTotal, 0);
    return { total, accepted, rate, pending };
  }, [quotes]);

  const filtered = useMemo(() =>
    quotes
      .filter(q => filter === 'all' || q.status === filter)
      .filter(q => !search || q.quoteNumber.toLowerCase().includes(search.toLowerCase()) || q.client.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate)),
    [quotes, filter, search],
  );

  const handleStatusChange = (id: string, status: QuoteStatus) => {
    const q = quotes.find(x => x.id === id);
    if (q) upsertQuote({ ...q, status });
  };

  const handleConvert = (id: string) => {
    const inv = convertQuoteToInvoice(id);
    if (inv) navigate(`/invoice/${inv.id}`);
    setViewId(null);
  };

  const handleNew = () => {
    setNewQuote(emptyQuote());
    setNewOpen(true);
  };

  const handleSaveNew = (q: Quote) => {
    upsertQuote(q);
    setNewOpen(false);
    setNewQuote(null);
  };

  const viewQuote = quotes.find(q => q.id === viewId) ?? null;
  const editQuote = quotes.find(q => q.id === editId) ?? null;

  return (
    <AppLayout>
      <div className="space-y-5 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Quotes & Estimates</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Create quotes, track acceptance, convert to invoices.</p>
          </div>
          <Button size="sm" className="gap-1.5 rounded-xl font-display font-semibold" onClick={handleNew}>
            <Plus size={14} /> New Quote
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Quoted', value: formatCurrency(m.total), icon: DollarSign, color: 'text-primary' },
            { label: 'Accepted Value', value: formatCurrency(m.accepted), icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Pending Value', value: formatCurrency(m.pending), icon: Clock, color: 'text-amber-500' },
            { label: 'Win Rate', value: `${m.rate}%`, icon: TrendingUp, color: m.rate >= 50 ? 'text-emerald-500' : 'text-orange-500' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
                <kpi.icon size={15} className={kpi.color} />
              </div>
              <p className="font-display text-xl font-bold text-foreground">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotes…" className="h-8 text-sm rounded-lg w-48" />
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'draft', 'sent', 'accepted', 'declined', 'expired'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)} className={cn('filter-chip capitalize', filter === s && 'active')}>
                {s === 'all' ? 'All' : STATUS_LABELS[s] ?? s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Client</th>
                <th>Created</th>
                <th>Expires</th>
                <th>Status</th>
                <th className="text-right">Total</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No quotes found</td></tr>
              ) : filtered.map(q => {
                const Icon = STATUS_ICONS[q.status];
                const isExpired = new Date(q.expiryDate) < new Date() && q.status === 'sent';
                return (
                  <tr key={q.id}>
                    <td className="font-mono text-xs font-semibold text-foreground">{q.quoteNumber}</td>
                    <td className="font-medium text-foreground">{q.client.name || '—'}</td>
                    <td className="text-muted-foreground text-xs">{q.createdDate}</td>
                    <td className={cn('text-xs', isExpired ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>{q.expiryDate}</td>
                    <td>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', STATUS_COLORS[q.status])}>
                        <Icon size={10} /> {STATUS_LABELS[q.status]}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-foreground">{formatCurrency(q.grandTotal, q.currency)}</td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewId(q.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all" title="View">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => setEditId(q.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all" title="Edit">
                          <FileText size={13} />
                        </button>
                        {!q.convertedInvoiceId && q.status === 'accepted' && (
                          <button onClick={() => handleConvert(q.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all" title="Convert to Invoice">
                            <ArrowRight size={13} />
                          </button>
                        )}
                        <button onClick={() => deleteQuote(q.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-all" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewQuote && (
        <QuoteDetailModal
          quote={viewQuote}
          onClose={() => setViewId(null)}
          onStatusChange={handleStatusChange}
          onConvert={handleConvert}
        />
      )}

      {editQuote && (
        <QuoteEditorModal
          initial={editQuote}
          clients={clients}
          onSave={q => { upsertQuote(q); setEditId(null); }}
          onClose={() => setEditId(null)}
        />
      )}

      {newOpen && newQuote && (
        <QuoteEditorModal
          initial={newQuote}
          clients={clients}
          onSave={handleSaveNew}
          onClose={() => { setNewOpen(false); setNewQuote(null); }}
        />
      )}
    </AppLayout>
  );
};

export default QuotesPage;
