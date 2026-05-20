
export interface Business {
  name: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt?: string;
}

export type PaymentMethod = 'bank-transfer' | 'card' | 'cash' | 'cheque' | 'paypal' | 'other';

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringProfile {
  id: string;
  templateInvoiceId: string;
  frequency: RecurringFrequency;
  nextRunDate: string;
  active: boolean;
  lastGeneratedDate?: string;
  occurrences: number;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  business: Business;
  client: Client;
  lineItems: LineItem[];
  subTotal: number;
  taxTotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  grandTotal: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  payments?: Payment[];
  recurringId?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'partial';

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  client: {
    name: string;
  };
  createdDate: string;
  dueDate: string;
  grandTotal: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export type ExpenseCategory =
  | 'office' | 'travel' | 'software' | 'hardware' | 'marketing'
  | 'utilities' | 'salary' | 'contractor' | 'meals' | 'other';

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  vendor?: string;
  receipt?: string;
  notes?: string;
  createdAt: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export interface Quote {
  id: string;
  quoteNumber: string;
  createdDate: string;
  expiryDate: string;
  status: QuoteStatus;
  business: Business;
  client: Client;
  lineItems: LineItem[];
  subTotal: number;
  taxTotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  grandTotal: number;
  currency: string;
  notes: string;
  convertedInvoiceId?: string;
}
