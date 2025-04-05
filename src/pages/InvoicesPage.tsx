
import { AppLayout } from '@/components/layout/AppLayout';
import { InvoicesList } from '@/components/invoice/InvoicesList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Invoice, InvoiceSummary } from '@/types/invoice';

const InvoicesPage = () => {
  const [storedInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  
  // Convert full invoices to summaries for the list component
  const invoiceSummaries: InvoiceSummary[] = storedInvoices.map(invoice => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    client: {
      name: invoice.client.name
    },
    createdDate: invoice.createdDate,
    dueDate: invoice.dueDate,
    grandTotal: invoice.grandTotal,
    status: invoice.status
  }));

  return (
    <AppLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <Button asChild>
            <Link to="/invoice/new">
              <Plus className="h-4 w-4 mr-1" /> New Invoice
            </Link>
          </Button>
        </div>
        
        <InvoicesList invoices={invoiceSummaries} />
      </div>
    </AppLayout>
  );
};

export default InvoicesPage;
