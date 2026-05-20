
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useBilling } from '@/hooks/useBilling';
import { Invoice, InvoiceStatus } from '@/types/invoice';
import {
  formatCurrency, getStatusColor, getStatusLabel, getDisplayStatus, getBalance,
} from '@/utils/helpers';
import { generateInvoicePDF } from '@/utils/pdf';
import {
  Plus, Search, Download, MoreHorizontal, FileText, Copy, Trash2, FileDown,
  ArrowUpDown, Check,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type SortKey = 'date' | 'amount' | 'client' | 'due';

const FILTERS: { id: InvoiceStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'partial', label: 'Partial' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
];

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invoices, upsertInvoice, deleteInvoice, deleteInvoices } = useBilling();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('date');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    let r = invoices.map(inv => ({ inv, status: getDisplayStatus(inv), balance: getBalance(inv) }));
    if (filter !== 'all') r = r.filter(x => x.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(x =>
        x.inv.invoiceNumber.toLowerCase().includes(q) ||
        x.inv.client.name.toLowerCase().includes(q) ||
        x.inv.client.email.toLowerCase().includes(q)
      );
    }
    r.sort((a, b) => {
      switch (sort) {
        case 'amount': return b.inv.grandTotal - a.inv.grandTotal;
        case 'client': return a.inv.client.name.localeCompare(b.inv.client.name);
        case 'due': return new Date(a.inv.dueDate).getTime() - new Date(b.inv.dueDate).getTime();
        default: return new Date(b.inv.createdDate).getTime() - new Date(a.inv.createdDate).getTime();
      }
    });
    return r;
  }, [invoices, filter, query, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: invoices.length };
    invoices.forEach(i => { const s = getDisplayStatus(i); c[s] = (c[s] ?? 0) + 1; });
    return c;
  }, [invoices]);

  const allSelected = rows.length > 0 && rows.every(r => selected.has(r.inv.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map(r => r.inv.id)));
  };
  const toggleOne = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const duplicate = (inv: Invoice) => {
    const copy: Invoice = {
      ...inv, id: uuidv4(),
      invoiceNumber: inv.invoiceNumber.replace(/(\d+)$/, n => String(Number(n) + 1).padStart(n.length, '0')) + '-C',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'draft', payments: [], recurringId: undefined,
    };
    upsertInvoice(copy);
    toast({ title: 'Invoice duplicated' });
  };

  const exportCSV = () => {
    const header = ['Invoice #', 'Client', 'Email', 'Created', 'Due', 'Status', 'Total', 'Paid', 'Balance', 'Currency'];
    const lines = rows.map(({ inv, status, balance }) => [
      inv.invoiceNumber, inv.client.name, inv.client.email, inv.createdDate, inv.dueDate,
      getStatusLabel(status).replace(/[^\w ]/g, '').trim(),
      inv.grandTotal.toFixed(2), (inv.grandTotal - balance).toFixed(2), balance.toFixed(2), inv.currency,
    ].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${rows.length} invoices` });
  };

  const bulkDelete = () => {
    if (!window.confirm(`Delete ${selected.size} selected invoice(s)?`)) return;
    deleteInvoices([...selected]);
    setSelected(new Set());
    toast({ title: 'Invoices deleted' });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Invoices</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{rows.length} of {invoices.length} shown</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={exportCSV} disabled={!rows.length}>
              <Download size={14} /> CSV
            </Button>
            <Button size="sm" className="gap-1.5 rounded-lg font-display font-semibold" onClick={() => navigate('/invoice/new')}>
              <Plus size={15} /> New Invoice
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`filter-chip ${filter === f.id ? 'active' : ''}`}>
                {f.label}
                {counts[f.id] != null && <span className="opacity-70">{counts[f.id] ?? 0}</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="pl-8 h-9 w-48 text-sm" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg"><ArrowUpDown size={13} /> Sort</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {([['date', 'Newest'], ['amount', 'Amount'], ['client', 'Client'], ['due', 'Due date']] as [SortKey, string][]).map(([k, l]) => (
                  <DropdownMenuItem key={k} onClick={() => setSort(k)}>
                    {sort === k && <Check size={13} className="mr-1" />} {l}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-accent/50 px-3 py-2 animate-fade-in">
            <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={bulkDelete}>
                <Trash2 size={13} /> Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></th>
                    <th>Invoice #</th><th>Client</th><th className="hidden md:table-cell">Created</th>
                    <th className="hidden lg:table-cell">Due</th><th className="text-right">Total</th>
                    <th className="text-right hidden sm:table-cell">Balance</th><th>Status</th><th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ inv, status, balance }) => (
                    <tr key={inv.id} className={`cursor-pointer ${selected.has(inv.id) ? 'bg-accent/40' : ''}`} onClick={() => navigate(`/invoice/${inv.id}`)}>
                      <td onClick={e => e.stopPropagation()}><Checkbox checked={selected.has(inv.id)} onCheckedChange={() => toggleOne(inv.id)} /></td>
                      <td className="font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</td>
                      <td className="font-medium text-foreground">{inv.client.name}</td>
                      <td className="hidden md:table-cell text-muted-foreground text-xs">{new Date(inv.createdDate).toLocaleDateString()}</td>
                      <td className="hidden lg:table-cell text-muted-foreground text-xs">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="text-right font-mono font-semibold text-foreground">{formatCurrency(inv.grandTotal, inv.currency)}</td>
                      <td className="text-right font-mono text-xs hidden sm:table-cell text-muted-foreground">{balance > 0 ? formatCurrency(balance, inv.currency) : '—'}</td>
                      <td><span className={getStatusColor(status)}>{getStatusLabel(status)}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-muted text-muted-foreground"><MoreHorizontal size={15} /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/invoice/${inv.id}`)}><FileText size={13} className="mr-2" /> Open</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generateInvoicePDF(inv)}><FileDown size={13} className="mr-2" /> Download PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicate(inv)}><Copy size={13} className="mr-2" /> Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => { if (window.confirm('Delete this invoice?')) { deleteInvoice(inv.id); toast({ title: 'Invoice deleted' }); } }}>
                              <Trash2 size={13} className="mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <FileText size={28} className="text-muted-foreground/40 mb-3" />
              <h3 className="font-display font-semibold text-foreground mb-1 text-sm">
                {query || filter !== 'all' ? 'No matching invoices' : 'No invoices yet'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {query || filter !== 'all' ? 'Adjust your filters or search.' : 'Create your first invoice to get started.'}
              </p>
              <Button size="sm" asChild className="gap-1.5 rounded-lg"><Link to="/invoice/new"><Plus size={14} /> New Invoice</Link></Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default InvoicesPage;
