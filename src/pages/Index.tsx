
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { useBilling } from '@/hooks/useBilling';
import {
  formatCurrency, getStatusColor, getStatusLabel, getDisplayStatus,
  getBalance, getAmountPaid, daysBetween,
} from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import {
  Plus, TrendingUp, DollarSign, Clock, AlertTriangle, ArrowRight, Globe,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  paid: '#10b981', sent: '#3b82f6', overdue: '#ef4444', draft: '#9ca3af', partial: '#f59e0b',
};

const Index = () => {
  const navigate = useNavigate();
  const { invoices } = useBilling();

  const m = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const withStatus = invoices.map(i => ({ inv: i, status: getDisplayStatus(i), balance: getBalance(i), paid: getAmountPaid(i) }));

    const outstanding = withStatus.reduce((s, x) => s + x.balance, 0);
    const overdueAmt = withStatus.filter(x => x.status === 'overdue').reduce((s, x) => s + x.balance, 0);
    const overdueCount = withStatus.filter(x => x.status === 'overdue').length;
    const paidMTD = invoices.flatMap(i => i.payments ?? [])
      .filter(p => new Date(p.date) >= monthStart)
      .reduce((s, p) => s + p.amount, 0);

    // multi-currency breakdown
    const byCurrency = new Map<string, { billed: number; collected: number; outstanding: number }>();
    invoices.forEach(i => {
      const cur = i.currency || '$';
      const entry = byCurrency.get(cur) ?? { billed: 0, collected: 0, outstanding: 0 };
      entry.billed += i.grandTotal;
      entry.collected += getAmountPaid(i);
      entry.outstanding += getBalance(i);
      byCurrency.set(cur, entry);
    });
    const currencyBreakdown = [...byCurrency.entries()].map(([cur, v]) => ({ cur, ...v })).sort((a, b) => b.billed - a.billed);

    // avg days to pay (fully paid invoices)
    const payDurations: number[] = [];
    invoices.forEach(i => {
      const paid = getAmountPaid(i);
      if (paid >= i.grandTotal && (i.payments?.length)) {
        const last = i.payments!.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
        payDurations.push(Math.max(0, daysBetween(i.createdDate, last.date)));
      }
    });
    const avgDays = payDurations.length ? Math.round(payDurations.reduce((a, b) => a + b, 0) / payDurations.length) : 0;

    // 6-month revenue (collected from payments)
    const months: { month: string; collected: number; billed: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.toLocaleString('default', { month: 'short' }), collected: 0, billed: 0 });
    }
    const monthIdx = (iso: string) => {
      const d = new Date(iso);
      return months.findIndex((_, k) => {
        const md = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
        return d.getFullYear() === md.getFullYear() && d.getMonth() === md.getMonth();
      });
    };
    invoices.forEach(i => {
      const bi = monthIdx(i.createdDate);
      if (bi >= 0) months[bi].billed += i.grandTotal;
      (i.payments ?? []).forEach(p => {
        const pi = monthIdx(p.date);
        if (pi >= 0) months[pi].collected += p.amount;
      });
    });

    // status breakdown
    const statusCounts: Record<string, number> = {};
    withStatus.forEach(x => { statusCounts[x.status] = (statusCounts[x.status] ?? 0) + 1; });
    const pie = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // aging buckets (unpaid balances)
    const buckets = [
      { label: 'Current', min: -99999, max: 0, amount: 0 },
      { label: '1-30d', min: 1, max: 30, amount: 0 },
      { label: '31-60d', min: 31, max: 60, amount: 0 },
      { label: '60d+', min: 61, max: 99999, amount: 0 },
    ];
    withStatus.filter(x => x.balance > 0 && x.status !== 'draft').forEach(x => {
      const overdueDays = daysBetween(x.inv.dueDate, now.toISOString());
      const b = buckets.find(bk => overdueDays >= bk.min && overdueDays <= bk.max) ?? buckets[0];
      b.amount += x.balance;
    });

    // top clients by collected
    const clientTotals = new Map<string, number>();
    invoices.forEach(i => {
      const collected = getAmountPaid(i);
      if (collected > 0) clientTotals.set(i.client.name, (clientTotals.get(i.client.name) ?? 0) + collected);
    });
    const topClients = [...clientTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const recent = [...invoices]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 7);

    return { outstanding, overdueAmt, overdueCount, paidMTD, avgDays, months, pie, buckets, topClients, recent, withStatus, currencyBreakdown };
  }, [invoices]);

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const tick = isDark ? '#9ca3af' : '#6b7280';
  const grid = isDark ? '#1f2937' : '#eef2f0';

  const kpis = [
    { label: 'Outstanding', value: formatCurrency(m.outstanding), icon: DollarSign, accent: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Overdue', value: formatCurrency(m.overdueAmt), sub: `${m.overdueCount} invoice${m.overdueCount !== 1 ? 's' : ''}`, icon: AlertTriangle, accent: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40' },
    { label: 'Collected (MTD)', value: formatCurrency(m.paidMTD), icon: TrendingUp, accent: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Avg. Days to Pay', value: `${m.avgDays}d`, icon: Clock, accent: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{invoices.length} invoices · {formatCurrency(m.withStatus.reduce((s, x) => s + x.inv.grandTotal, 0))} billed</p>
          </div>
          <Button onClick={() => navigate('/invoice/new')} size="sm" className="gap-1.5 rounded-lg font-display font-semibold">
            <Plus size={15} /> New Invoice
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(({ label, value, sub, icon: Icon, accent, bg }, i) => (
            <div key={label} className="kpi-card stagger-item" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon size={14} className={accent} />
                </div>
              </div>
              <p className={`font-display text-xl font-bold ${accent}`}>{value}</p>
              {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Multi-currency breakdown */}
        {m.currencyBreakdown.length > 1 && (
          <div className="rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Globe size={14} /> Multi-Currency Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {m.currencyBreakdown.map(c => (
                <div key={c.cur} className="rounded-lg bg-muted/50 px-3 py-2.5 space-y-1">
                  <span className="text-xs font-semibold text-primary">{c.cur}</span>
                  <div className="flex justify-between text-[11px] text-muted-foreground"><span>Billed</span><span className="font-mono font-semibold text-foreground">{formatCurrency(c.billed, c.cur)}</span></div>
                  <div className="flex justify-between text-[11px] text-muted-foreground"><span>Collected</span><span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.collected, c.cur)}</span></div>
                  <div className="flex justify-between text-[11px] text-muted-foreground"><span>Outstanding</span><span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(c.outstanding, c.cur)}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold text-foreground">Cash Flow</h2>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Collected</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Billed</span>
              </div>
            </div>
            <div className="h-56">
              {m.months.some(d => d.collected || d.billed) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={m.months} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: tick, fontSize: 10 }} axisLine={false} tickLine={false} width={48} tickFormatter={v => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(v as number)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="billed" stroke="#3b82f6" strokeWidth={2} fill="url(#gB)" />
                    <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2.5} fill="url(#gC)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Empty />}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-display text-sm font-semibold text-foreground mb-3">By Status</h2>
            <div className="h-56">
              {m.pie.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={m.pie} cx="50%" cy="50%" outerRadius={72} innerRadius={42} dataKey="value" paddingAngle={2} stroke="hsl(var(--background))" strokeWidth={2}>
                      {m.pie.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.name] ?? '#9ca3af'} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Empty />}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {m.pie.map(d => (
                <span key={d.name} className="flex items-center gap-1 text-[11px] text-muted-foreground capitalize">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[d.name] }} /> {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Aging + Top clients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-display text-sm font-semibold text-foreground mb-3">Receivables Aging</h2>
            <div className="h-48">
              {m.buckets.some(b => b.amount > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={m.buckets} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: tick, fontSize: 10 }} axisLine={false} tickLine={false} width={48} tickFormatter={v => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(v as number)} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {m.buckets.map((_, i) => <Cell key={i} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <Empty label="No outstanding receivables" />}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-display text-sm font-semibold text-foreground mb-3">Top Clients</h2>
            {m.topClients.length ? (
              <div className="space-y-2.5">
                {m.topClients.map(([name, total], i) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-foreground truncate flex-1">{name}</span>
                    <span className="font-mono text-xs font-semibold text-foreground">{formatCurrency(total)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground py-8 text-center">No payments recorded yet</p>}
          </div>
        </div>

        {/* Recent invoices */}
        <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-display text-sm font-semibold text-foreground">Recent Invoices</h2>
            <button onClick={() => navigate('/invoices')} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {m.recent.length ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th><th>Client</th><th className="hidden sm:table-cell">Date</th>
                    <th className="text-right">Total</th><th className="text-right hidden md:table-cell">Balance</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {m.recent.map(inv => {
                    const st = getDisplayStatus(inv);
                    const bal = getBalance(inv);
                    return (
                      <tr key={inv.id} className="cursor-pointer" onClick={() => navigate(`/invoice/${inv.id}`)}>
                        <td className="font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</td>
                        <td className="font-medium text-foreground">{inv.client.name}</td>
                        <td className="hidden sm:table-cell text-muted-foreground text-xs">{new Date(inv.createdDate).toLocaleDateString()}</td>
                        <td className="text-right font-mono font-semibold text-foreground">{formatCurrency(inv.grandTotal, inv.currency)}</td>
                        <td className="text-right font-mono text-xs hidden md:table-cell text-muted-foreground">{bal > 0 ? formatCurrency(bal, inv.currency) : '—'}</td>
                        <td><span className={getStatusColor(st)}>{getStatusLabel(st)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Plus size={20} className="text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1 text-sm">No invoices yet</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs">Create your first invoice to start tracking revenue.</p>
              <Button size="sm" onClick={() => navigate('/invoice/new')} className="gap-1.5 rounded-lg">
                <Plus size={14} /> Create Invoice
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

const Empty = ({ label = 'No data yet' }: { label?: string }) => (
  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">{label}</div>
);

export default Index;
