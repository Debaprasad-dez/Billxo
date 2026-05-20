import { LineItem, Invoice, InvoiceStatus } from '@/types/invoice';

export const formatCurrency = (amount: number, currency: string = '$') => {
  return `${currency}${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

export const calculateLineItemTotal = (lineItem: LineItem): number => {
  const subtotal = lineItem.quantity * lineItem.unitPrice;
  const tax = subtotal * (lineItem.tax / 100);
  return subtotal + tax;
};

export const calculateSubtotal = (lineItems: LineItem[]): number => {
  return lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
};

export const calculateTaxTotal = (lineItems: LineItem[]): number => {
  return lineItems.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    return sum + (subtotal * (item.tax / 100));
  }, 0);
};

export const calculateGrandTotal = (
  subtotal: number, 
  taxTotal: number, 
  discount: number, 
  discountType: 'percentage' | 'fixed'
): number => {
  const discountAmount = discountType === 'percentage' 
    ? subtotal * (discount / 100) 
    : discount;
  
  return (subtotal + taxTotal) - discountAmount;
};

export const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
};

export const generateQuoteNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QTE-${year}${month}-${random}`;
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  office: 'Office', travel: 'Travel', software: 'Software', hardware: 'Hardware',
  marketing: 'Marketing', utilities: 'Utilities', salary: 'Salary',
  contractor: 'Contractor', meals: 'Meals & Entertainment', other: 'Other',
};

export const CURRENCIES: { code: string; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export const getDueDateFromTerms = (terms: string, startDate?: Date) => {
  const date = startDate || new Date();
  let days = 0;
  
  if (terms === 'net-7') days = 7;
  else if (terms === 'net-15') days = 15;
  else if (terms === 'net-30') days = 30;
  else if (terms === 'net-60') days = 60;
  else if (terms === 'due-on-receipt') days = 0;
  
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const getStatusFromDates = (dueDate: string, isPaid: boolean): 'draft' | 'sent' | 'paid' | 'overdue' => {
  if (isPaid) return 'paid';
  
  const now = new Date();
  const due = new Date(dueDate);
  
  if (due < now) {
    return 'overdue';
  }
  
  return 'sent';
};

export const getStatusColor = (status: InvoiceStatus): string => {
  switch (status) {
    case 'draft':   return 'status-badge draft';
    case 'sent':    return 'status-badge sent';
    case 'paid':    return 'status-badge paid';
    case 'overdue': return 'status-badge overdue';
    case 'partial': return 'status-badge partial';
    default:        return 'status-badge draft';
  }
};

export const getStatusLabel = (status: InvoiceStatus): string => {
  switch (status) {
    case 'draft':   return 'Draft';
    case 'sent':    return 'Sent';
    case 'paid':    return '✓ Paid';
    case 'overdue': return '⚠ Overdue';
    case 'partial': return '◐ Partial';
    default:        return status;
  }
};

// ── Payments / balance ──
export const getAmountPaid = (invoice: Invoice): number =>
  (invoice.payments ?? []).reduce((s, p) => s + p.amount, 0);

export const getBalance = (invoice: Invoice): number =>
  Math.max(0, invoice.grandTotal - getAmountPaid(invoice));

// Effective status accounts for partial payments + overdue dates
export const getDisplayStatus = (invoice: Invoice): InvoiceStatus => {
  const paid = getAmountPaid(invoice);
  if (paid >= invoice.grandTotal && invoice.grandTotal > 0) return 'paid';
  if (invoice.status === 'draft') return 'draft';
  const overdue = new Date(invoice.dueDate) < new Date();
  if (paid > 0) return overdue ? 'overdue' : 'partial';
  return overdue ? 'overdue' : 'sent';
};

export const daysBetween = (a: string, b: string): number =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  'bank-transfer': 'Bank Transfer',
  card: 'Card',
  cash: 'Cash',
  cheque: 'Cheque',
  paypal: 'PayPal',
  other: 'Other',
};
