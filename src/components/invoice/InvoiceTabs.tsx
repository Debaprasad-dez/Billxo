
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Invoice, Business, Client, LineItem } from '@/types/invoice';
import { BusinessForm } from '@/components/invoice/BusinessForm';
import { ClientForm } from '@/components/invoice/ClientForm';
import { InvoiceDetails } from '@/components/invoice/InvoiceDetails';
import { LineItemsTable } from '@/components/invoice/LineItemsTable';
import { InvoiceSummary } from '@/components/invoice/InvoiceSummary';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { Button } from '@/components/ui/button';

interface InvoiceTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  invoice: Invoice;
  onUpdateBusiness: (business: Business) => void;
  onUpdateClient: (client: Client) => void;
  onUpdateInvoice: (invoice: Partial<Invoice>) => void;
  onUpdateLineItems: (lineItems: LineItem[]) => void;
  onUpdateDiscount: (discount: number) => void;
  onUpdateDiscountType: (type: 'percentage' | 'fixed') => void;
  onUpdateCurrency: (currency: string) => void;
  onSave: () => void;
}

export const InvoiceTabs = ({
  activeTab,
  setActiveTab,
  invoice,
  onUpdateBusiness,
  onUpdateClient,
  onUpdateInvoice,
  onUpdateLineItems,
  onUpdateDiscount,
  onUpdateDiscountType,
  onUpdateCurrency,
  onSave,
}: InvoiceTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Edit Invoice</TabsTrigger>
        <TabsTrigger value="preview">Preview Invoice</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="mt-6">
        <BusinessForm business={invoice.business} onUpdate={onUpdateBusiness} />
        <ClientForm client={invoice.client} onUpdate={onUpdateClient} />
        <InvoiceDetails invoice={invoice} onUpdate={onUpdateInvoice} />
        <LineItemsTable 
          lineItems={invoice.lineItems} 
          currency={invoice.currency}
          onUpdate={onUpdateLineItems} 
        />
        <InvoiceSummary 
          subTotal={invoice.subTotal}
          taxTotal={invoice.taxTotal}
          discount={invoice.discount}
          discountType={invoice.discountType}
          grandTotal={invoice.grandTotal}
          currency={invoice.currency}
          onUpdateDiscount={onUpdateDiscount}
          onUpdateDiscountType={onUpdateDiscountType}
          onUpdateCurrency={onUpdateCurrency}
        />
      </TabsContent>
      
      <TabsContent value="preview" className="mt-6">
        <InvoicePreview invoice={invoice} />
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setActiveTab('details')}>
            Back to Edit
          </Button>
          <Button onClick={onSave}>
            Save Invoice
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};
