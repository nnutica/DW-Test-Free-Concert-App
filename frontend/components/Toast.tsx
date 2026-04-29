import { X, XCircle } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className={`fixed top-6 right-6 md:top-8 md:right-8 z-100 flex items-center px-4 py-3 rounded-md shadow-md min-w-[280px] transition-all transform duration-300 ease-out border ${
      isSuccess ? 'bg-[#D2E7D6] text-black border-[#b5d5bd]' : 'bg-[#FCE4E4] text-black border-[#f8caca]'
    }`}>
      {isSuccess ? (
        <svg className="mr-3 shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#00A859" strokeWidth="2"/>
          <path d="M7 12.5L10.5 16L17 8" stroke="#00A859" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <XCircle className="w-6 h-6 text-[#E63946] mr-3 shrink-0" strokeWidth={2} />
      )}
      
      <span className="font-medium text-sm flex-1">{message}</span>
      
      <button onClick={onClose} className="ml-3 hover:opacity-70 shrink-0">
        <X className={`w-5 h-5 ${isSuccess ? 'text-[#1e3a29]' : 'text-[#8a1c24]'}`} strokeWidth={2} />
      </button>
    </div>
  );
}
