
import { Invoice, Client, RecurringProfile, Expense, Quote } from '@/types/invoice';

const now = new Date();
const d = (daysAgo: number) => {
  const x = new Date(now);
  x.setDate(x.getDate() - daysAgo);
  return x.toISOString().split('T')[0];
};

const BUSINESS = {
  name: 'Acme Design Studio',
  logo: '',
  address: '123 Creative Lane',
  city: 'San Francisco',
  state: 'CA',
  zip: '94103',
  phone: '+1 (415) 555-0100',
  email: 'billing@acmedesign.com',
};

export const DEMO_CLIENTS: Client[] = [
  { id: 'client-1', name: 'TechCorp Inc.', company: 'TechCorp', email: 'accounts@techcorp.com', address: '456 Silicon Ave', city: 'Palo Alto', state: 'CA', zip: '94301', phone: '+1 (650) 555-0200', createdAt: d(120) },
  { id: 'client-2', name: 'Startup Ventures LLC', company: 'Startup Ventures', email: 'finance@startupventures.io', address: '789 Innovation Blvd', city: 'Austin', state: 'TX', zip: '78701', phone: '+1 (512) 555-0300', createdAt: d(100) },
  { id: 'client-3', name: 'GlobalRetail Co.', company: 'GlobalRetail', email: 'ap@globalretail.com', address: '321 Commerce St', city: 'New York', state: 'NY', zip: '10001', phone: '+1 (212) 555-0400', createdAt: d(90) },
  { id: 'client-4', name: 'Boutique Agency', company: 'Boutique', email: 'hello@boutiqueagency.co', address: '55 Design District', city: 'Miami', state: 'FL', zip: '33127', phone: '+1 (305) 555-0500', createdAt: d(60) },
  { id: 'client-5', name: 'Nimbus SaaS', company: 'Nimbus', email: 'billing@nimbus.app', address: '900 Cloud Way', city: 'Seattle', state: 'WA', zip: '98101', phone: '+1 (206) 555-0600', createdAt: d(40) },
];

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'demo-inv-1', invoiceNumber: 'INV-2501-001', createdDate: d(40), dueDate: d(10),
    paymentTerms: 'net-30', notes: 'Thank you for your business!', status: 'paid', currency: '$',
    business: BUSINESS, client: DEMO_CLIENTS[0],
    lineItems: [
      { id: 'li-1', description: 'Brand Identity Design', quantity: 1, unitPrice: 3500, tax: 0, total: 3500 },
      { id: 'li-2', description: 'Website Redesign', quantity: 1, unitPrice: 8000, tax: 0, total: 8000 },
    ],
    subTotal: 11500, taxTotal: 0, discount: 0, discountType: 'fixed', grandTotal: 11500,
    payments: [{ id: 'p1', invoiceId: 'demo-inv-1', amount: 11500, date: d(12), method: 'bank-transfer', reference: 'TXN-88421' }],
  },
  {
    id: 'demo-inv-2', invoiceNumber: 'INV-2502-002', createdDate: d(35), dueDate: d(5),
    paymentTerms: 'net-30', notes: 'Payment past due — please remit.', status: 'overdue', currency: '$',
    business: BUSINESS, client: DEMO_CLIENTS[1],
    lineItems: [
      { id: 'li-3', description: 'UX Research & Strategy', quantity: 40, unitPrice: 85, tax: 0, total: 3400 },
      { id: 'li-4', description: 'Prototype Development', quantity: 1, unitPrice: 2200, tax: 0, total: 2200 },
    ],
    subTotal: 5600, taxTotal: 0, discount: 0, discountType: 'fixed', grandTotal: 5600,
    payments: [],
  },
  {
    id: 'demo-inv-3', invoiceNumber: 'INV-2503-003', createdDate: d(20), dueDate: d(-10),
    paymentTerms: 'net-30', notes: 'Monthly retainer.', status: 'sent', currency: '$',
    business: BUSINESS, client: DEMO_CLIENTS[2],
    lineItems: [
      { id: 'li-5', description: 'Monthly Design Retainer', quantity: 1, unitPrice: 4000, tax: 8, total: 4320 },
      { id: 'li-6', description: 'Social Media Assets (20 posts)', quantity: 20, unitPrice: 75, tax: 8, total: 1620 },
    ],
    subTotal: 5500, taxTotal: 440, discount: 5, discountType: 'percentage', grandTotal: 5665,
    payments: [{ id: 'p2', invoiceId: 'demo-inv-3', amount: 2500, date: d(8), method: 'card', reference: 'CARD-4471' }],
  },
  {
    id: 'demo-inv-4', invoiceNumber: 'INV-2504-004', createdDate: d(3), dueDate: d(-27),
    paymentTerms: 'net-30', notes: '', status: 'draft', currency: '$',
    business: BUSINESS, client: DEMO_CLIENTS[3],
    lineItems: [{ id: 'li-7', description: 'Logo Design Package', quantity: 1, unitPrice: 1800, tax: 0, total: 1800 }],
    subTotal: 1800, taxTotal: 0, discount: 0, discountType: 'fixed', grandTotal: 1800, payments: [],
  },
  {
    id: 'demo-inv-5', invoiceNumber: 'INV-2504-005', createdDate: d(8), dueDate: d(-22),
    paymentTerms: 'net-30', notes: 'Recurring monthly subscription design.', status: 'paid', currency: '$',
    business: BUSINESS, client: DEMO_CLIENTS[4],
    lineItems: [{ id: 'li-8', description: 'Product Design Retainer', quantity: 1, unitPrice: 6000, tax: 0, total: 6000 }],
    subTotal: 6000, taxTotal: 0, discount: 0, discountType: 'fixed', grandTotal: 6000,
    payments: [{ id: 'p3', invoiceId: 'demo-inv-5', amount: 6000, date: d(2), method: 'paypal' }],
    recurringId: 'rec-1',
  },
];

export const DEMO_RECURRING: RecurringProfile[] = [
  { id: 'rec-1', templateInvoiceId: 'demo-inv-5', frequency: 'monthly', nextRunDate: d(-22), active: true, occurrences: 3, lastGeneratedDate: d(8) },
];

export const DEMO_EXPENSES: Expense[] = [
  { id: 'exp-1', date: d(35), description: 'AWS Cloud Infrastructure', category: 'software', amount: 420, currency: '$', vendor: 'Amazon Web Services', createdAt: d(35) },
  { id: 'exp-2', date: d(30), description: 'Figma Team License', category: 'software', amount: 45, currency: '$', vendor: 'Figma Inc.', createdAt: d(30) },
  { id: 'exp-3', date: d(28), description: 'SFO → NYC Flight', category: 'travel', amount: 380, currency: '$', vendor: 'Delta Airlines', notes: 'Client presentation trip', createdAt: d(28) },
  { id: 'exp-4', date: d(25), description: 'Office Rent - April', category: 'utilities', amount: 1200, currency: '$', vendor: 'WeWork', createdAt: d(25) },
  { id: 'exp-5', date: d(20), description: 'Freelance Developer', category: 'contractor', amount: 2400, currency: '$', vendor: 'Alex Chen', notes: 'React components for client project', createdAt: d(20) },
  { id: 'exp-6', date: d(18), description: 'Client Dinner', category: 'meals', amount: 215, currency: '$', vendor: 'Zuni Café', notes: 'TechCorp Q2 planning', createdAt: d(18) },
  { id: 'exp-7', date: d(14), description: 'LinkedIn Ads', category: 'marketing', amount: 300, currency: '$', vendor: 'LinkedIn', createdAt: d(14) },
  { id: 'exp-8', date: d(10), description: 'Office Supplies', category: 'office', amount: 85, currency: '$', vendor: 'Staples', createdAt: d(10) },
  { id: 'exp-9', date: d(5), description: 'Slack Pro', category: 'software', amount: 12, currency: '$', vendor: 'Slack', createdAt: d(5) },
  { id: 'exp-10', date: d(3), description: 'Hardware - Webcam', category: 'hardware', amount: 129, currency: '$', vendor: 'Best Buy', createdAt: d(3) },
];

export const DEMO_QUOTES: Quote[] = [
  {
    id: 'demo-qte-1', quoteNumber: 'QTE-2501-001',
    createdDate: d(25), expiryDate: d(-5),
    status: 'accepted', convertedInvoiceId: 'demo-inv-1',
    business: BUSINESS, client: DEMO_CLIENTS[0],
    lineItems: [
      { id: 'qli-1', description: 'Brand Identity Design', quantity: 1, unitPrice: 3500, tax: 0, total: 3500 },
      { id: 'qli-2', description: 'Website Redesign', quantity: 1, unitPrice: 8000, tax: 0, total: 8000 },
    ],
    subTotal: 11500, taxTotal: 0, discount: 0, discountType: 'fixed', grandTotal: 11500,
    currency: '$', notes: 'Estimate valid for 30 days.',
  },
  {
    id: 'demo-qte-2', quoteNumber: 'QTE-2502-002',
    createdDate: d(15), expiryDate: d(15),
    status: 'sent',
    business: BUSINESS, client: DEMO_CLIENTS[2],
    lineItems: [
      { id: 'qli-3', description: 'E-commerce Platform Redesign', quantity: 1, unitPrice: 9500, tax: 0, total: 9500 },
      { id: 'qli-4', description: 'Mobile App UI Design', quantity: 1, unitPrice: 4500, tax: 0, total: 4500 },
    ],
    subTotal: 14000, taxTotal: 0, discount: 10, discountType: 'percentage', grandTotal: 12600,
    currency: '$', notes: 'Includes 2 revision rounds.',
  },
  {
    id: 'demo-qte-3', quoteNumber: 'QTE-2503-003',
    createdDate: d(8), expiryDate: d(22),
    status: 'draft',
    business: BUSINESS, client: DEMO_CLIENTS[4],
    lineItems: [
      { id: 'qli-5', description: 'SaaS Dashboard Design System', quantity: 1, unitPrice: 6800, tax: 0, total: 6800 },
    ],
    subTotal: 6800, taxTotal: 0, discount: 0, discountType: 'fixed', grandTotal: 6800,
    currency: '$', notes: '',
  },
  {
    id: 'demo-qte-4', quoteNumber: 'QTE-2503-004',
    createdDate: d(40), expiryDate: d(10),
    status: 'declined',
    business: BUSINESS, client: DEMO_CLIENTS[1],
    lineItems: [{ id: 'qli-6', description: 'Full Brand Package', quantity: 1, unitPrice: 18000, tax: 0, total: 18000 }],
    subTotal: 18000, taxTotal: 0, discount: 0, discountType: 'fixed', grandTotal: 18000,
    currency: '$', notes: '',
  },
];

export function seedDemoInvoices(): void {
  if (!localStorage.getItem('billxo-seeded-v3')) {
    localStorage.removeItem('billxo-seeded-v2');
    const existing = localStorage.getItem('invoices');
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem('invoices', JSON.stringify(DEMO_INVOICES));
    }
    if (!localStorage.getItem('clients') || JSON.parse(localStorage.getItem('clients')!).length === 0) {
      localStorage.setItem('clients', JSON.stringify(DEMO_CLIENTS));
    }
    if (!localStorage.getItem('recurring')) {
      localStorage.setItem('recurring', JSON.stringify(DEMO_RECURRING));
    }
    if (!localStorage.getItem('expenses') || JSON.parse(localStorage.getItem('expenses')!).length === 0) {
      localStorage.setItem('expenses', JSON.stringify(DEMO_EXPENSES));
    }
    if (!localStorage.getItem('quotes') || JSON.parse(localStorage.getItem('quotes')!).length === 0) {
      localStorage.setItem('quotes', JSON.stringify(DEMO_QUOTES));
    }
    localStorage.setItem('billxo-seeded-v3', 'true');
  }
}
