import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { seedDemoInvoices } from './data/demoData'

seedDemoInvoices();

createRoot(document.getElementById("root")!).render(<App />);
