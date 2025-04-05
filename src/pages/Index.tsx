
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Invoice, InvoiceSummary } from '@/types/invoice';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [storedInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  
  // Get invoices for dashboard stats
  const invoiceSummaries = storedInvoices.map(invoice => ({
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
  
  // Calculate statistics
  const totalOutstanding = storedInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
    
  const totalPaid = storedInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
    
  const overdue = storedInvoices
    .filter(inv => inv.status === 'overdue')
    .length;
  
  // Recent invoices
  const recentInvoices = [...invoiceSummaries]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);
  
  // Chart data
  const getMonthName = (monthIndex: number) => {
    return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'short' });
  };
  
  // Generate last 6 months for chart
  const generateLastSixMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      months.push({
        month: getMonthName(date.getMonth()),
        paid: 0,
        pending: 0,
      });
    }
    
    // Fill data from invoices
    storedInvoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.createdDate);
      const monthIndex = months.findIndex(m => 
        m.month === getMonthName(invoiceDate.getMonth()) &&
        Math.abs(new Date().getMonth() - invoiceDate.getMonth()) <= 5
      );
      
      if (monthIndex !== -1) {
        if (invoice.status === 'paid') {
          months[monthIndex].paid += invoice.grandTotal;
        } else {
          months[monthIndex].pending += invoice.grandTotal;
        }
      }
    });
    
    return months;
  };
  
  const chartData = generateLastSixMonths();
  
  // Status distribution data for pie chart
  const statusCounts = {
    paid: storedInvoices.filter(inv => inv.status === 'paid').length,
    sent: storedInvoices.filter(inv => inv.status === 'sent').length,
    overdue: storedInvoices.filter(inv => inv.status === 'overdue').length,
    draft: storedInvoices.filter(inv => inv.status === 'draft').length,
  };
  
  const pieData = [
    { name: 'Paid', value: statusCounts.paid },
    { name: 'Sent', value: statusCounts.sent },
    { name: 'Overdue', value: statusCounts.overdue },
    { name: 'Draft', value: statusCounts.draft },
  ].filter(item => item.value > 0);
  
  // Enhanced chart colors
  const COLORS = ['#4ade80', '#60a5fa', '#f87171', '#d1d5db'];
  
  // Custom tooltip formatter for currency
  const currencyFormatter = (value: number) => formatCurrency(value);
  
  return (
    <AppLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <Button onClick={() => navigate('/invoice/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold dark:text-white">{formatCurrency(totalOutstanding)}</div>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Outstanding Balance</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</div>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Total Paid</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold dark:text-white">{invoiceSummaries.length}</div>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Total Invoices</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500">{overdue}</div>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Overdue Invoices</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <Card className="col-span-2 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="dark:text-white">Invoice Activity</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9ca3af" 
                      tick={{fill: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#6b7280'}}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      tick={{fill: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#6b7280'}}
                      tickFormatter={currencyFormatter}
                    />
                    <Tooltip 
                      formatter={(value) => [`${formatCurrency(value as number)}`, '']}
                      contentStyle={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      name="Paid" 
                      dataKey="paid" 
                      stroke="#4ade80" 
                      strokeWidth={3}
                      dot={{ stroke: '#4ade80', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ r: 6, stroke: '#4ade80', strokeWidth: 2, fill: 'white' }}
                      fillOpacity={1}
                      fill="url(#paidGradient)"
                    />
                    <Line 
                      type="monotone" 
                      name="Pending" 
                      dataKey="pending" 
                      stroke="#f87171" 
                      strokeWidth={3}
                      dot={{ stroke: '#f87171', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ r: 6, stroke: '#f87171', strokeWidth: 2, fill: 'white' }}
                      fillOpacity={1}
                      fill="url(#pendingGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No invoice data to display
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pie Chart */}
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="dark:text-white">Invoice Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={40} // Added innerRadius for donut chart effect
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      stroke={document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'}
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))' }}
                        />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      formatter={(value) => (
                        <span style={{ color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827' }}>
                          {value}
                        </span>
                      )}
                    />
                    <Tooltip 
                      formatter={(value) => [value, '']}
                      contentStyle={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No invoices created yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Invoices */}
        <Card className="shadow-sm hover:shadow transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="dark:text-white">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left">Invoice #</th>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentInvoices.map((invoice) => (
                      <tr 
                        key={invoice.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                        onClick={() => navigate(`/invoice/${invoice.id}`)}
                      >
                        <td className="px-4 py-3 dark:text-gray-200">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-3 dark:text-gray-200">{invoice.client.name}</td>
                        <td className="px-4 py-3 dark:text-gray-200">{new Date(invoice.createdDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 dark:text-gray-200">{formatCurrency(invoice.grandTotal)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No invoices created yet. Create your first invoice to get started.
              </div>
            )}
            
            {recentInvoices.length > 0 && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={() => navigate('/invoices')}>
                  View All Invoices
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
