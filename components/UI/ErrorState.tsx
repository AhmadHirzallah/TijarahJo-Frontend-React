
import React from 'react';
import { AlertCircle, RefreshCcw, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "We're having trouble connecting to our servers. Please check your internet connection and try again.", 
  onRetry,
  title = "Connection Issue"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
        <WifiOff size={40} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-8 flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <RefreshCcw size={18} /> Retry Connection
        </button>
      )}
      <div className="mt-12 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3 text-left max-w-sm">
        <AlertCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400">
          If you are a developer, please ensure your local API server is running and CORS is correctly configured for your origin.
        </p>
      </div>
    </div>
  );
};

export default ErrorState;
