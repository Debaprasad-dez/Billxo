
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBilling } from '@/hooks/useBilling';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/helpers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Moon, Sun, Receipt, DollarSign, TrendingDown, Calculator, AlertTriangle,
} from 'lucide-react';
import { useMemo } from 'react';

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { invoices, expenses } = useBilling();
  const [taxPeriod, setTaxPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');

  const taxSummary = useMemo(() => {
    const now = new Date();
    let start: Date;
    let label: string;

    if (taxPeriod === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      label = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (taxPeriod === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
      label = `Q${q + 1} ${now.getFullYear()}`;
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      label = `FY ${now.getFullYear()}`;
    }

    const periodInvoices = invoices.filter(i => new Date(i.createdDate) >= start);
    const totalRevenue = periodInvoices.reduce((s, i) => s + i.grandTotal, 0);
    const totalTaxCollected = periodInvoices.reduce((s, i) => s + i.taxTotal, 0);
    const netRevenue = periodInvoices.reduce((s, i) => s + i.subTotal, 0);

    const periodExpenses = expenses.filter(e => new Date(e.date) >= start);
    const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0);

    const byCurrency: Record<string, { taxCollected: number; revenue: number }> = {};
    periodInvoices.forEach(i => {
      const cur = i.currency || '$';
      if (!byCurrency[cur]) byCurrency[cur] = { taxCollected: 0, revenue: 0 };
      byCurrency[cur].taxCollected += i.taxTotal;
      byCurrency[cur].revenue += i.grandTotal;
    });

    return { label, totalRevenue, totalTaxCollected, netRevenue, totalExpenses, grossProfit: totalRevenue - totalExpenses, byCurrency };
  }, [invoices, expenses, taxPeriod]);

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Preferences and financial summary.</p>
        </div>

        {/* Appearance */}
        <div className="rounded-xl border bg-card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-display text-sm font-semibold text-foreground">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={18} className="text-muted-foreground" /> : <Sun size={18} className="text-muted-foreground" />}
              <div>
                <Label htmlFor="dark-mode" className="text-sm font-medium text-foreground cursor-pointer">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
              </div>
            </div>
            <Switch id="dark-mode" checked={isDark} onCheckedChange={toggleTheme} />
          </div>
        </div>

        {/* Tax Summary */}
        <div className="rounded-xl border bg-card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <Calculator size={15} className="text-primary" /> Tax Summary
            </h2>
            <div className="flex gap-1">
              {(['month', 'quarter', 'year'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setTaxPeriod(p)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${taxPeriod === p ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  {p === 'month' ? 'Month' : p === 'quarter' ? 'Quarter' : 'Year'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground -mt-2">{taxSummary.label}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Gross Revenue', value: formatCurrency(taxSummary.totalRevenue), icon: Receipt, color: 'text-primary bg-primary/10' },
              { label: 'Net Revenue (ex. tax)', value: formatCurrency(taxSummary.netRevenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
              { label: 'Tax Collected', value: formatCurrency(taxSummary.totalTaxCollected), icon: Calculator, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
              { label: 'Total Expenses', value: formatCurrency(taxSummary.totalExpenses), icon: TrendingDown, color: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
              { label: 'Gross Profit', value: formatCurrency(taxSummary.grossProfit), icon: DollarSign, color: taxSummary.grossProfit >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'text-red-600 bg-red-50 dark:bg-red-950/40' },
            ].map(item => (
              <div key={item.label} className="rounded-lg border bg-background p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.color}`}>
                    <item.icon size={12} />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                </div>
                <p className="font-display font-bold text-base text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          {Object.keys(taxSummary.byCurrency).length > 1 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax by Currency</p>
              {Object.entries(taxSummary.byCurrency).map(([cur, v]) => (
                <div key={cur} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{cur}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">Revenue: <span className="text-foreground font-medium">{formatCurrency(v.revenue, cur)}</span></span>
                    <span className="text-xs text-muted-foreground">Tax: <span className="text-blue-600 dark:text-blue-400 font-semibold">{formatCurrency(v.taxCollected, cur)}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            <span>This is an estimate for reference only. Consult a tax professional for official filings.</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
