
import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBilling } from '@/hooks/useBilling';
import { Expense, ExpenseCategory } from '@/types/invoice';
import { EXPENSE_CATEGORY_LABELS, formatCurrency } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus, Trash2, Receipt, TrendingDown, TrendingUp, DollarSign,
  Edit2, X, Check, BarChart3, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

const CATEGORIES = Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][];

const CAT_COLORS: Record<string, string> = {
  office: '#6366f1', travel: '#f59e0b', software: '#3b82f6', hardware: '#8b5cf6',
  marketing: '#ec4899', utilities: '#14b8a6', salary: '#10b981', contractor: '#f97316',
  meals: '#ef4444', other: '#9ca3af',
};

const BLANK: Omit<Expense, 'id' | 'createdAt'> = {
  date: new Date().toISOString().split('T')[0],
  description: '',
  category: 'other',
  amount: 0,
  currency: '$',
  vendor: '',
  notes: '',
};

interface FormState extends Omit<Expense, 'id' | 'createdAt'> {}

const ExpenseForm = ({
  initial, onSave, onCancel,
}: {
  initial: FormState;
  onSave: (e: FormState) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<FormState>(initial);
  const set = (k: keyof FormState, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-md)' }}>
      <h3 className="font-display font-semibold text-foreground">{initial.description ? 'Edit Expense' : 'New Expense'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
          <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. AWS monthly bill" className="rounded-lg" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Vendor</label>
          <Input value={form.vendor ?? ''} onChange={e => set('vendor', e.target.value)} placeholder="e.g. Amazon" className="rounded-lg" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Category</label>
          <select
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            value={form.category}
            onChange={e => set('category', e.target.value as ExpenseCategory)}
          >
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Date</label>
          <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="rounded-lg" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Amount *</label>
          <Input
            type="number" min={0} step="0.01"
            value={form.amount || ''}
            onChange={e => set('amount', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="rounded-lg"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Currency</label>
          <select
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            value={form.currency}
            onChange={e => set('currency', e.target.value)}
          >
            {['$', '€', '£', '₹', 'CA$', 'A$', '¥'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
          <Input value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" className="rounded-lg" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={onCancel}><X size={13} /> Cancel</Button>
        <Button size="sm" className="rounded-lg gap-1.5" onClick={() => onSave(form)} disabled={!form.description || form.amount <= 0}>
          <Check size={13} /> Save Expense
        </Button>
      </div>
    </div>
  );
};

const ExpensesPage = () => {
  const { expenses, upsertExpense, deleteExpense, deleteExpenses, invoices } = useBilling();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterCat, setFilterCat] = useState<ExpenseCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const m = useMemo(() => {
    const now = new Date();
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const totalMTD = thisMonth.reduce((s, e) => s + e.amount, 0);
    const totalAll = expenses.reduce((s, e) => s + e.amount, 0);

    const totalRevenue = invoices.flatMap(i => i.payments ?? []).reduce((s, p) => s + p.amount, 0);
    const netProfit = totalRevenue - totalAll;

    // by category
    const byCat: Record<string, number> = {};
    expenses.forEach(e => { byCat[e.category] = (byCat[e.category] ?? 0) + e.amount; });
    const catPie = Object.entries(byCat).map(([name, value]) => ({ name: EXPENSE_CATEGORY_LABELS[name] ?? name, value, cat: name }));

    // last 6 months trend
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const amount = expenses.filter(e => {
        const ed = new Date(e.date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      }).reduce((s, e) => s + e.amount, 0);
      months.push({ month: label, amount });
    }

    return { totalMTD, totalAll, netProfit, totalRevenue, catPie, months };
  }, [expenses, invoices]);

  const filtered = useMemo(() => {
    return expenses
      .filter(e => filterCat === 'all' || e.category === filterCat)
      .filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()) || (e.vendor ?? '').toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filterCat, search]);

  const handleSave = (form: FormState) => {
    if (editId) {
      const orig = expenses.find(e => e.id === editId)!;
      upsertExpense({ ...orig, ...form });
      setEditId(null);
    } else {
      upsertExpense({ ...form, id: uuidv4(), createdAt: new Date().toISOString() });
      setShowForm(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleBulkDelete = () => {
    deleteExpenses([...selected]);
    setSelected(new Set());
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Expenses</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track business costs and monitor profit margins.</p>
          </div>
          <Button size="sm" className="gap-1.5 rounded-xl font-display font-semibold" onClick={() => { setShowForm(true); setEditId(null); }}>
            <Plus size={14} /> Add Expense
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Expenses', value: formatCurrency(m.totalAll), icon: TrendingDown, color: 'text-red-500' },
            { label: 'This Month', value: formatCurrency(m.totalMTD), icon: Receipt, color: 'text-amber-500' },
            { label: 'Total Revenue', value: formatCurrency(m.totalRevenue), icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Net Profit', value: formatCurrency(m.netProfit), icon: DollarSign, color: m.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500' },
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 size={14} /> 6-Month Trend</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.months} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="amount" name="Expenses" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Filter size={14} /> By Category</h2>
            {m.catPie.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={m.catPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                        {m.catPie.map((entry) => (
                          <Cell key={entry.cat} fill={CAT_COLORS[entry.cat] ?? '#9ca3af'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5 overflow-auto max-h-48">
                  {m.catPie.sort((a, b) => b.value - a.value).map(e => (
                    <div key={e.cat} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CAT_COLORS[e.cat] ?? '#9ca3af' }} />
                      <span className="text-muted-foreground flex-1 truncate">{e.name}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(e.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No expenses yet</div>
            )}
          </div>
        </div>

        {/* Add form */}
        {showForm && !editId && (
          <ExpenseForm initial={BLANK} onSave={handleSave} onCancel={() => setShowForm(false)} />
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search expenses…"
            className="h-8 text-sm rounded-lg w-48"
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCat('all')}
              className={cn('filter-chip', filterCat === 'all' && 'active')}
            >All</button>
            {CATEGORIES.map(([v, l]) => (
              <button key={v} onClick={() => setFilterCat(v)} className={cn('filter-chip', filterCat === v && 'active')}>
                {l}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" className="rounded-lg gap-1.5 ml-auto" onClick={handleBulkDelete}>
              <Trash2 size={13} /> Delete {selected.size}
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-8">
                  <input type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={e => setSelected(e.target.checked ? new Set(filtered.map(x => x.id)) : new Set())}
                    className="rounded"
                  />
                </th>
                <th>Date</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No expenses found</td></tr>
              ) : filtered.map(exp => (
                editId === exp.id ? (
                  <tr key={exp.id}>
                    <td colSpan={7} className="p-3">
                      <ExpenseForm
                        initial={{ date: exp.date, description: exp.description, category: exp.category, amount: exp.amount, currency: exp.currency, vendor: exp.vendor, notes: exp.notes }}
                        onSave={handleSave}
                        onCancel={() => setEditId(null)}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={exp.id}>
                    <td>
                      <input type="checkbox" checked={selected.has(exp.id)} onChange={() => toggleSelect(exp.id)} className="rounded" />
                    </td>
                    <td className="font-mono text-xs text-muted-foreground">{exp.date}</td>
                    <td className="font-medium text-foreground">{exp.description}</td>
                    <td className="text-muted-foreground">{exp.vendor || '—'}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[exp.category] ?? '#9ca3af' }} />
                        {EXPENSE_CATEGORY_LABELS[exp.category]}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-foreground">{formatCurrency(exp.amount, exp.currency)}</td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setEditId(exp.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteExpense(exp.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default ExpensesPage;
