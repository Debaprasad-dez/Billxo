
import 'react-to-print';

declare module 'react-to-print' {
  interface UseReactToPrintOptions {
    /** The document title to use when printing */
    documentTitle?: string;
    /** Callback function called when printing fails */
    onPrintError?: (errorLocation: string, error: Error) => void;
    /** Function that returns the element to be printed */
    printRef?: () => HTMLElement | null;
    /** Function that returns the element to be printed (alternate version used in the codebase) */
    content?: () => HTMLElement | null;
    /** Callback function executed before printing starts */
    onBeforeGetContent?: () => Promise<any> | void;
    /** Callback function executed after printing */
    onAfterPrint?: () => void;
    /** Whether to remove the iframe after printing (defaults to true) */
    removeAfterPrint?: boolean;
  }
  
  export function useReactToPrint(options: UseReactToPrintOptions): () => void;
}
