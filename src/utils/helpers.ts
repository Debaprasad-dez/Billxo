import { LineItem } from '@/types/invoice';

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

export const getStatusColor = (status: 'draft' | 'sent' | 'paid' | 'overdue'): string => {
  switch (status) {
    case 'draft': return 'bg-gray-200 text-gray-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};
