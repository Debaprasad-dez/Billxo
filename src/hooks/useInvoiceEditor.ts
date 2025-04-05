
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Invoice, Business, Client, LineItem } from '@/types/invoice';
import useLocalStorage from '@/hooks/useLocalStorage';
import { 
  calculateSubtotal, 
  calculateTaxTotal, 
  calculateGrandTotal,
  generateInvoiceNumber,
  getDueDateFromTerms,
  getStatusFromDates
} from '@/utils/helpers';

export const useInvoiceEditor = (id: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [storedInvoices, setStoredInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [storedBusinesses] = useLocalStorage<Business[]>('businesses', []);
  
  const isNewInvoice = id === 'new';
  
  // Default empty invoice structure
  const emptyInvoice: Invoice = {
    id: uuidv4(),
    invoiceNumber: generateInvoiceNumber(),
    createdDate: new Date().toISOString().split('T')[0],
    dueDate: getDueDateFromTerms('net-30'),
    paymentTerms: 'net-30',
    notes: '',
    business: storedBusinesses[0] || {
      name: '',
      logo: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
    },
    client: {
      id: '',
      name: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
    },
    lineItems: [],
    subTotal: 0,
    taxTotal: 0,
    discount: 0,
    discountType: 'percentage',
    grandTotal: 0,
    currency: '$',
    status: 'draft' as const,
  };
  
  const [invoice, setInvoice] = useState<Invoice>(emptyInvoice);
  const [activeTab, setActiveTab] = useState('details');
  
  // Load existing invoice or initialize new one
  useEffect(() => {
    if (isNewInvoice) {
      setInvoice(emptyInvoice);
    } else if (id) {
      const foundInvoice = storedInvoices.find(inv => inv.id === id);
      if (foundInvoice) {
        setInvoice(foundInvoice);
      } else {
        toast({
          title: "Invoice not found",
          description: "The requested invoice could not be found.",
          variant: "destructive",
        });
        navigate('/invoices');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Update calculations whenever line items, discount, or discount type changes
  useEffect(() => {
    const subTotal = calculateSubtotal(invoice.lineItems);
    const taxTotal = calculateTaxTotal(invoice.lineItems);
    const grandTotal = calculateGrandTotal(subTotal, taxTotal, invoice.discount, invoice.discountType);
    
    setInvoice(prev => ({
      ...prev,
      subTotal,
      taxTotal,
      grandTotal,
      status: getStatusFromDates(prev.dueDate, prev.status === 'paid') as 'draft' | 'sent' | 'paid' | 'overdue'
    }));
  }, [invoice.lineItems, invoice.discount, invoice.discountType]);
  
  // Update invoice business
  const handleUpdateBusiness = (business: Business) => {
    setInvoice(prev => ({ ...prev, business }));
  };
  
  // Update invoice client
  const handleUpdateClient = (client: Client) => {
    setInvoice(prev => ({ ...prev, client }));
  };
  
  // Update invoice details
  const handleUpdateInvoice = (updates: Partial<Invoice>) => {
    setInvoice(prev => ({ ...prev, ...updates }));
  };
  
  // Update line items
  const handleUpdateLineItems = (lineItems: LineItem[]) => {
    setInvoice(prev => ({ ...prev, lineItems }));
  };
  
  // Update discount amount
  const handleUpdateDiscount = (discount: number) => {
    setInvoice(prev => ({ ...prev, discount }));
  };
  
  // Update discount type
  const handleUpdateDiscountType = (discountType: 'percentage' | 'fixed') => {
    setInvoice(prev => ({ ...prev, discountType }));
  };
  
  // Update currency
  const handleUpdateCurrency = (currency: string) => {
    setInvoice(prev => ({ ...prev, currency }));
  };
  
  // Save invoice
  const handleSaveInvoice = () => {
    // Check if it's a new invoice or updating existing
    const existingIndex = storedInvoices.findIndex(inv => inv.id === invoice.id);
    
    if (existingIndex >= 0) {
      // Update existing invoice
      const updatedInvoices = [...storedInvoices];
      updatedInvoices[existingIndex] = invoice;
      setStoredInvoices(updatedInvoices);
    } else {
      // Add new invoice
      setStoredInvoices([...storedInvoices, invoice]);
    }
    
    toast({
      title: isNewInvoice ? "Invoice Created" : "Invoice Updated",
      description: isNewInvoice ? "Your invoice has been successfully created." : "Your invoice has been updated.",
    });
    
    if (isNewInvoice) {
      navigate(`/invoice/${invoice.id}`);
    }
  };
  
  // Mark invoice as paid
  const handleMarkAsPaid = () => {
    const status: 'paid' = 'paid';
    setInvoice(prev => ({ ...prev, status }));
    
    // Auto-save when marking as paid
    const updatedInvoice = { ...invoice, status: 'paid' as const };
    const existingIndex = storedInvoices.findIndex(inv => inv.id === invoice.id);
    
    if (existingIndex >= 0) {
      const updatedInvoices = [...storedInvoices];
      updatedInvoices[existingIndex] = updatedInvoice;
      setStoredInvoices(updatedInvoices);
    }
    
    toast({
      title: "Status Updated",
      description: "Invoice has been marked as paid.",
    });
  };

  return {
    invoice,
    isNewInvoice,
    activeTab,
    setActiveTab,
    handleUpdateBusiness,
    handleUpdateClient,
    handleUpdateInvoice,
    handleUpdateLineItems,
    handleUpdateDiscount,
    handleUpdateDiscountType,
    handleUpdateCurrency,
    handleSaveInvoice,
    handleMarkAsPaid,
  };
};
