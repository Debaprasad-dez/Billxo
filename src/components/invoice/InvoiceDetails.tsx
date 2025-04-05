
import { Invoice } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDueDateFromTerms } from '@/utils/helpers';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onUpdate: (invoice: Partial<Invoice>) => void;
}

const paymentTermsOptions = [
  { value: 'due-on-receipt', label: 'Due on Receipt' },
  { value: 'net-7', label: 'Net 7 Days' },
  { value: 'net-15', label: 'Net 15 Days' },
  { value: 'net-30', label: 'Net 30 Days' },
  { value: 'net-60', label: 'Net 60 Days' },
];

export const InvoiceDetails = ({ invoice, onUpdate }: InvoiceDetailsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const handlePaymentTermsChange = (value: string) => {
    const dueDate = getDueDateFromTerms(value, new Date(invoice.createdDate));
    onUpdate({ 
      paymentTerms: value,
      dueDate
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Invoice Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={invoice.invoiceNumber}
              onChange={handleChange}
              placeholder="INV-0001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="createdDate">Issue Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !invoice.createdDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoice.createdDate ? format(new Date(invoice.createdDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={invoice.createdDate ? new Date(invoice.createdDate) : undefined}
                  onSelect={(date) => date && onUpdate({ createdDate: date.toISOString().split('T')[0] })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Select 
              value={invoice.paymentTerms} 
              onValueChange={handlePaymentTermsChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                {paymentTermsOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !invoice.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoice.dueDate ? format(new Date(invoice.dueDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={invoice.dueDate ? new Date(invoice.dueDate) : undefined}
                  onSelect={(date) => date && onUpdate({ dueDate: date.toISOString().split('T')[0] })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 sm:col-span-2 md:col-span-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={invoice.notes}
              onChange={handleChange}
              placeholder="Any additional notes for the client..."
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { Button } from '../ui/button';
