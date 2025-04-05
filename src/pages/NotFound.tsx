
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-6xl font-bold text-invoice-blue mb-6">404</h1>
        <p className="text-2xl font-medium text-gray-700 mb-4">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        <Button asChild className="px-6">
          <a href="/">Back to Dashboard</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
