import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextValue {
  showToast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, message };
    
    setToasts((prev) => [...prev, toast]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container - Top Center */}
      <div className="pointer-events-none fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl',
              'animate-in slide-in-from-top-2 fade-in duration-300',
              'min-w-[320px] max-w-md',
              toast.type === 'success' && 'border-profit/20 bg-profit/10',
              toast.type === 'error' && 'border-loss/20 bg-loss/10',
              toast.type === 'info' && 'border-white/10 bg-[#121212]/90'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-profit" />}
            {toast.type === 'error' && <AlertTriangle className="h-5 w-5 flex-shrink-0 text-loss" />}
            {toast.type === 'info' && <Info className="h-5 w-5 flex-shrink-0 text-white/70" />}
            
            <p className={cn(
              'flex-1 text-sm font-medium',
              toast.type === 'success' && 'text-profit',
              toast.type === 'error' && 'text-loss',
              toast.type === 'info' && 'text-white'
            )}>
              {toast.message}
            </p>
            
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-white/40 transition-colors hover:text-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
