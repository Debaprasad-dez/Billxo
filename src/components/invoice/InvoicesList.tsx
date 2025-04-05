
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InvoiceSummary } from '@/types/invoice';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency, getStatusColor } from '@/utils/helpers';
import { Search, Filter, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoicesListProps {
  invoices: InvoiceSummary[];
}

export const InvoicesList = ({ invoices }: InvoicesListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = invoices.filter(invoice => {
    // Search term filter
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice #</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issue Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{invoice.client.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{new Date(invoice.createdDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(invoice.grandTotal)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/invoice/${invoice.id}`}>
                            <FileText className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No Invoices Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {invoices.length === 0
                ? "Get started by creating a new invoice."
                : "No invoices match your search criteria."}
            </p>
            {invoices.length === 0 && (
              <div className="mt-6">
                <Button asChild>
                  <Link to="/invoice/new">
                    Create New Invoice
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
