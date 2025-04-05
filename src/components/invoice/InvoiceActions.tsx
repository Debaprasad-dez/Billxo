
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice';
import { useToast } from '@/components/ui/use-toast';

interface InvoiceActionsProps {
  isNewInvoice: boolean;
  invoice: Invoice;
  onSave: () => void;
  onMarkAsPaid: () => void;
}

export const InvoiceActions = ({
  isNewInvoice,
  invoice,
  onSave,
  onMarkAsPaid,
}: InvoiceActionsProps) => {
  return (
    <div className="flex space-x-2">
      {!isNewInvoice && invoice.status !== 'paid' && (
        <Button 
          variant="outline" 
          className="bg-green-500 text-white hover:bg-green-600"
          onClick={onMarkAsPaid}
        >
          Mark as Paid
        </Button>
      )}
      <Button onClick={onSave}>
        Save Invoice
      </Button>
    </div>
  );
};
