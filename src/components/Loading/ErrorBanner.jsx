import React from 'react';
import { XCircle } from 'lucide-react';

export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-700/90 border border-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
      <span className="text-sm font-medium">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-2 text-white hover:text-gray-200">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
