
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '../../assets/logo.png'
interface SidebarProps {
  isMobile?: boolean;
}

export const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const location = useLocation();
  
  const menu = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];
  
  return (
    <div className={cn(
      "w-64 fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
      isMobile ? "relative w-full" : "hidden md:flex md:flex-col"
    )}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className=" items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">

          <img src={logo} className='mt-3' style={{width:'110px'}} alt="" />
          {/* <h1 className="text-xs font-semibold text-blue-600 dark:text-blue-400">Your own invoice generating platform</h1> */}
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 mb-6">
            <Button asChild className="w-full">
              <Link to="/invoice/new">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menu.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  item.path === location.pathname
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={cn(
                    item.path === location.pathname
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300',
                    'mr-3 flex-shrink-0 h-5 w-5'
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className='text-sm p-4 text-gray-500 dark:text-gray-400'>
        © 2024 Debaprasad.
        </div>
      </div>
    </div>
  );
};
