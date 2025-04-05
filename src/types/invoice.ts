
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
}

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
