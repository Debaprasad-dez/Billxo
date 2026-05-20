import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Invoice, Client, Payment, RecurringProfile, RecurringFrequency, Expense, Quote } from '@/types/invoice';
import { generateInvoiceNumber } from '@/utils/helpers';

const addToDate = (iso: string, freq: RecurringFrequency): string => {
  const d = new Date(iso);
  if (freq === 'weekly') d.setDate(d.getDate() + 7);
  else if (freq === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (freq === 'quarterly') d.setMonth(d.getMonth() + 3);
  else if (freq === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

export function useBilling() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [recurring, setRecurring] = useLocalStorage<RecurringProfile[]>('recurring', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [quotes, setQuotes] = useLocalStorage<Quote[]>('quotes', []);

  // ── Invoices ──
  const upsertInvoice = (inv: Invoice) => {
    setInvoices(prev => {
      const i = prev.findIndex(x => x.id === inv.id);
      if (i >= 0) { const c = [...prev]; c[i] = inv; return c; }
      return [...prev, inv];
    });
  };

  const deleteInvoice = (id: string) =>
    setInvoices(prev => prev.filter(x => x.id !== id));

  const deleteInvoices = (ids: string[]) =>
    setInvoices(prev => prev.filter(x => !ids.includes(x.id)));

  // ── Payments ──
  const addPayment = (invoiceId: string, payment: Omit<Payment, 'id' | 'invoiceId'>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const payments = [...(inv.payments ?? []), { ...payment, id: uuidv4(), invoiceId }];
      const paid = payments.reduce((s, p) => s + p.amount, 0);
      const status = paid >= inv.grandTotal ? 'paid' : inv.status === 'draft' ? 'sent' : inv.status;
      return { ...inv, payments, status: status as Invoice['status'] };
    }));
  };

  const removePayment = (invoiceId: string, paymentId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const payments = (inv.payments ?? []).filter(p => p.id !== paymentId);
      const paid = payments.reduce((s, p) => s + p.amount, 0);
      const status = paid >= inv.grandTotal ? 'paid' : 'sent';
      return { ...inv, payments, status: status as Invoice['status'] };
    }));
  };

  // ── Clients ──
  const upsertClient = (client: Client) => {
    setClients(prev => {
      const i = prev.findIndex(c => c.id === client.id);
      if (i >= 0) { const c = [...prev]; c[i] = client; return c; }
      return [...prev, { ...client, id: client.id || uuidv4(), createdAt: client.createdAt || new Date().toISOString() }];
    });
  };

  const deleteClient = (id: string) =>
    setClients(prev => prev.filter(c => c.id !== id));

  // ── Recurring ──
  const upsertRecurring = (profile: RecurringProfile) => {
    setRecurring(prev => {
      const i = prev.findIndex(r => r.id === profile.id);
      if (i >= 0) { const c = [...prev]; c[i] = profile; return c; }
      return [...prev, profile];
    });
  };

  const deleteRecurring = (id: string) =>
    setRecurring(prev => prev.filter(r => r.id !== id));

  const runRecurring = (profileId: string): Invoice | null => {
    const profile = recurring.find(r => r.id === profileId);
    if (!profile) return null;
    const template = invoices.find(i => i.id === profile.templateInvoiceId);
    if (!template) return null;

    const today = new Date().toISOString().split('T')[0];
    const newInv: Invoice = {
      ...template,
      id: uuidv4(),
      invoiceNumber: generateInvoiceNumber(),
      createdDate: today,
      status: 'sent',
      payments: [],
      recurringId: profile.id,
    };
    upsertInvoice(newInv);

    setRecurring(prev => prev.map(r => r.id === profileId ? {
      ...r,
      lastGeneratedDate: today,
      nextRunDate: addToDate(r.nextRunDate, r.frequency),
      occurrences: r.occurrences + 1,
    } : r));

    return newInv;
  };

  // ── Expenses ──
  const upsertExpense = (expense: Expense) => {
    setExpenses(prev => {
      const i = prev.findIndex(e => e.id === expense.id);
      if (i >= 0) { const c = [...prev]; c[i] = expense; return c; }
      return [...prev, expense];
    });
  };

  const deleteExpense = (id: string) =>
    setExpenses(prev => prev.filter(e => e.id !== id));

  const deleteExpenses = (ids: string[]) =>
    setExpenses(prev => prev.filter(e => !ids.includes(e.id)));

  // ── Quotes ──
  const upsertQuote = (quote: Quote) => {
    setQuotes(prev => {
      const i = prev.findIndex(q => q.id === quote.id);
      if (i >= 0) { const c = [...prev]; c[i] = quote; return c; }
      return [...prev, quote];
    });
  };

  const deleteQuote = (id: string) =>
    setQuotes(prev => prev.filter(q => q.id !== id));

  const convertQuoteToInvoice = (quoteId: string): Invoice | null => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return null;

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const inv: Invoice = {
      id: uuidv4(),
      invoiceNumber: generateInvoiceNumber(),
      createdDate: today,
      dueDate: dueDate.toISOString().split('T')[0],
      paymentTerms: 'net-30',
      notes: quote.notes,
      business: quote.business,
      client: quote.client,
      lineItems: quote.lineItems,
      subTotal: quote.subTotal,
      taxTotal: quote.taxTotal,
      discount: quote.discount,
      discountType: quote.discountType,
      grandTotal: quote.grandTotal,
      currency: quote.currency,
      status: 'sent',
      payments: [],
    };

    upsertInvoice(inv);
    upsertQuote({ ...quote, status: 'accepted', convertedInvoiceId: inv.id });
    return inv;
  };

  return {
    invoices, clients, recurring, expenses, quotes,
    upsertInvoice, deleteInvoice, deleteInvoices,
    addPayment, removePayment,
    upsertClient, deleteClient,
    upsertRecurring, deleteRecurring, runRecurring,
    upsertExpense, deleteExpense, deleteExpenses,
    upsertQuote, deleteQuote, convertQuoteToInvoice,
  };
}
