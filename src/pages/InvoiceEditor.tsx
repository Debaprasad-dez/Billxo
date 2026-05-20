
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { InvoiceTabs } from '@/components/invoice/InvoiceTabs';
import { PaymentsPanel } from '@/components/invoice/PaymentsPanel';
import { useInvoiceEditor } from '@/hooks/useInvoiceEditor';
import { useBilling } from '@/hooks/useBilling';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Eye, Save, FileDown, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/pdf';
import { getDisplayStatus, getStatusColor, getStatusLabel } from '@/utils/helpers';

const InvoiceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    invoice, isNewInvoice, activeTab, setActiveTab,
    handleUpdateBusiness, handleUpdateClient, handleUpdateInvoice,
    handleUpdateLineItems, handleUpdateDiscount, handleUpdateDiscountType,
    handleUpdateCurrency, handleSaveInvoice, handleMarkAsPaid,
  } = useInvoiceEditor(id);

  // Persisted copy for payments (payments mutate storage directly)
  const { invoices } = useBilling();
  const persisted = invoices.find(i => i.id === invoice.id);
  const displayStatus = getDisplayStatus(persisted ?? invoice);

  const handlePreviewClick = () => { setActiveTab('preview'); window.scrollTo(0, 0); };

  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/invoices')} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground shrink-0">
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold text-foreground truncate">
                {isNewInvoice ? 'Create Invoice' : invoice.invoiceNumber}
              </h1>
              {!isNewInvoice && <span className={getStatusColor(displayStatus)}>{getStatusLabel(displayStatus)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isNewInvoice && (
              <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={() => generateInvoicePDF(persisted ?? invoice)}>
                <FileDown size={14} /> PDF
              </Button>
            )}
            {!isNewInvoice && displayStatus !== 'paid' && (
              <Button variant="outline" size="sm" className="gap-1.5 rounded-lg text-emerald-600 dark:text-emerald-400" onClick={handleMarkAsPaid}>
                <CheckCircle2 size={14} /> Mark Paid
              </Button>
            )}
            <Button size="sm" className="gap-1.5 rounded-lg font-display font-semibold" onClick={handleSaveInvoice}>
              <Save size={14} /> Save
            </Button>
          </div>
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
          <div className="flex justify-end">
            <Button onClick={handlePreviewClick} variant="outline" className="gap-2 rounded-lg">
              <Eye size={16} /> Preview Invoice
            </Button>
          </div>
        )}

        {/* Payments — only for saved invoices */}
        {!isNewInvoice && persisted && activeTab === 'details' && (
          <PaymentsPanel invoice={persisted} />
        )}
        {!isNewInvoice && !persisted && activeTab === 'details' && (
          <p className="text-xs text-muted-foreground text-center rounded-lg border border-dashed py-4">
            Save this invoice to start recording payments.
          </p>
        )}
      </div>
    </AppLayout>
  );
};

export default InvoiceEditor;
