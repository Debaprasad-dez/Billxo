
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { InvoiceActions } from '@/components/invoice/InvoiceActions';
import { InvoiceTabs } from '@/components/invoice/InvoiceTabs';
import { useInvoiceEditor } from '@/hooks/useInvoiceEditor';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

const InvoiceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const {
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
  } = useInvoiceEditor(id);
  
  const handlePreviewClick = () => {
    setActiveTab('preview');
    window.scrollTo(0, 0);
  };

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNewInvoice ? 'Create Invoice' : `Edit Invoice #${invoice.invoiceNumber}`}
          </h1>
          <InvoiceActions
            isNewInvoice={isNewInvoice}
            invoice={invoice}
            onSave={handleSaveInvoice}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
        
        <InvoiceTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          invoice={invoice}
          onUpdateBusiness={handleUpdateBusiness}
          onUpdateClient={handleUpdateClient}
          onUpdateInvoice={handleUpdateInvoice}
          onUpdateLineItems={handleUpdateLineItems}
          onUpdateDiscount={handleUpdateDiscount}
          onUpdateDiscountType={handleUpdateDiscountType}
          onUpdateCurrency={handleUpdateCurrency}
          onSave={handleSaveInvoice}
        />

        {activeTab === 'details' && (
          <div className="flex justify-end mt-8">
            <Button 
              onClick={handlePreviewClick} 
              className="gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Eye size={18} /> Preview Invoice
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default InvoiceEditor;
