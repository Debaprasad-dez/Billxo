
import { useMemo, useState } from 'react';
import { useBilling } from '@/hooks/useBilling';
import { getDisplayStatus, getBalance, daysBetween } from '@/utils/helpers';
import { AlertTriangle, Clock, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationsBanner = () => {
  const { invoices } = useBilling();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const result: { id: string; type: 'overdue' | 'due-soon'; message: string; invoiceId: string }[] = [];

    invoices.forEach(inv => {
      const status = getDisplayStatus(inv);
      const balance = getBalance(inv);
      if (balance <= 0) return;

      if (status === 'overdue') {
        const days = daysBetween(inv.dueDate, today);
        result.push({
          id: `overdue-${inv.id}`,
          type: 'overdue',
          message: `${inv.invoiceNumber} (${inv.client.name}) overdue by ${days} day${days !== 1 ? 's' : ''}`,
          invoiceId: inv.id,
        });
      } else if (status === 'sent' || status === 'partial') {
        const daysLeft = daysBetween(today, inv.dueDate);
        if (daysLeft >= 0 && daysLeft <= 3) {
          result.push({
            id: `due-soon-${inv.id}`,
            type: 'due-soon',
            message: `${inv.invoiceNumber} (${inv.client.name}) due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
            invoiceId: inv.id,
          });
        }
      }
    });

    return result.filter(a => !dismissed.has(a.id)).slice(0, 5);
  }, [invoices, dismissed]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-1.5 mb-4">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={cn(
            'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border',
            alert.type === 'overdue'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400',
          )}
        >
          {alert.type === 'overdue'
            ? <AlertTriangle size={14} className="shrink-0" />
            : <Clock size={14} className="shrink-0" />
          }
          <span className="flex-1 text-xs">{alert.message}</span>
          <button
            onClick={() => setDismissed(s => new Set([...s, alert.id]))}
            className="p-0.5 rounded hover:opacity-70 transition-opacity shrink-0"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationsBanner;
