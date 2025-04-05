
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Download, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview = ({ invoice }: InvoicePreviewProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Enhanced print functionality
  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice.invoiceNumber}`,
    onPrintError: (error) => {
      console.error('Print failed:', error);
      toast({
        title: "Print Failed",
        description: "There was an error printing your invoice.",
        variant: "destructive",
      });
    },
    content: () => printRef.current,
    onAfterPrint: () => {
      toast({
        title: "Print Successful",
        description: "Your invoice has been sent to the printer.",
      });
    },
    removeAfterPrint: true
  });
  
  // Enhanced download functionality
  const handleDownload = async () => {
    toast({
      title: "Preparing Download",
      description: "Your invoice download is starting...",
    });

    if (!printRef.current) {
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Using a higher scale factor for better quality
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      
      toast({
        title: "Download Complete",
        description: "Your invoice has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your PDF.",
        variant: "destructive",
      });
    }
  };
  
  const handleEmail = () => {
    try {
      const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${invoice.business.name}`);
      const body = encodeURIComponent(`Dear ${invoice.client.name},\n\nPlease find attached invoice ${invoice.invoiceNumber} for your review.\n\nTotal amount due: ${formatCurrency(invoice.grandTotal, invoice.currency)}\nDue date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nThank you for your business.\n\n${invoice.business.name}`);
      
      window.open(`mailto:${invoice.client.email}?subject=${subject}&body=${body}`, '_blank');
      
      toast({
        title: "Email Client Opened",
        description: "Your default email application has been opened.",
      });
    } catch (error) {
      console.error('Email failed:', error);
      toast({
        title: "Email Failed",
        description: "There was an error opening your email client.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <Card className="mb-6 print:shadow-none">
        <div className="p-6">
          <div className="flex justify-end space-x-2 mb-6 no-print">
            <Button onClick={handleEmail} variant="outline">
              <Mail className="h-4 w-4 mr-2" /> Email
            </Button>
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>

          <div ref={printRef} className="invoice-modern p-0 bg-white dark:bg-gray-800 print-section">
            {/* Modern Invoice Header */}
            <div className="invoice-header">
              <div className="flex justify-between items-start">
                <div className="invoice-logo-section">
                  {invoice.business.logo && (
                    <img 
                      src={invoice.business.logo} 
                      alt={`${invoice.business.name} logo`} 
                      className="h-16 object-contain mb-2"
                    />
                  )}
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
                  <p className="text-md opacity-90"># {invoice.invoiceNumber}</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium opacity-80 mb-1">FROM</h3>
                  <h4 className="text-lg font-bold">{invoice.business.name}</h4>
                  <div className="opacity-90">
                    <p>{invoice.business.address}</p>
                    <p>{invoice.business.city}, {invoice.business.state} {invoice.business.zip}</p>
                    <p>Phone: {invoice.business.phone}</p>
                    <p>Email: {invoice.business.email}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <h3 className="text-sm font-medium opacity-80 mb-1">TO</h3>
                  <h4 className="text-lg font-bold">{invoice.client.name}</h4>
                  <div className="opacity-90">
                    <p>{invoice.client.address}</p>
                    <p>{invoice.client.city}, {invoice.client.state} {invoice.client.zip}</p>
                    <p>Phone: {invoice.client.phone}</p>
                    <p>Email: {invoice.client.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Invoice Body */}
            <div className="invoice-body bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between mb-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">INVOICE DATE</p>
                  <p className="font-medium">{formatDate(invoice.createdDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">DUE DATE</p>
                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">STATUS</p>
                  <p className={`font-medium ${
                    invoice.status === 'paid' ? 'text-green-500' : 
                    invoice.status === 'overdue' ? 'text-red-500' : 
                    'text-amber-500'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-8 overflow-hidden">
                <table className="w-full invoice-table">
                  <thead className="border-t border-b border-gray-200 dark:border-gray-600">
                    <tr className="text-left">
                      <th className="text-gray-700 dark:text-gray-200 font-semibold">Description</th>
                      <th className="text-gray-700 dark:text-gray-200 font-semibold text-right">Qty</th>
                      <th className="text-gray-700 dark:text-gray-200 font-semibold text-right">Unit Price</th>
                      <th className="text-gray-700 dark:text-gray-200 font-semibold text-right">Tax %</th>
                      <th className="text-gray-700 dark:text-gray-200 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.description}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 text-right">{item.tax}%</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 text-right">{formatCurrency(item.total, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end mb-8">
                <div className="invoice-total w-full max-w-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(invoice.subTotal, invoice.currency)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-300">Tax:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(invoice.taxTotal, invoice.currency)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 dark:text-gray-300">Discount 
                        {invoice.discountType === 'percentage' ? ` (${invoice.discount}%)` : ''}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        -{formatCurrency(
                          invoice.discountType === 'percentage' 
                            ? (invoice.subTotal * (invoice.discount / 100))
                            : invoice.discount,
                          invoice.currency
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t border-gray-200 dark:border-gray-600 mt-2">
                    <span className="font-bold text-gray-900 dark:text-white">Total Due:</span>
                    <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mb-8">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Notes</h4>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="invoice-footer text-center text-gray-600 dark:text-gray-300">
              <p>Thank you for your business!</p>
              <p className="text-sm mt-1">{invoice.business.name}</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
