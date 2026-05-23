import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function EmptyState({ message = 'No results found.', onReset }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0c10]/80 backdrop-blur-md text-text-muted p-6 rounded-xl">
      <div className="flex flex-col items-center gap-4">
        {/* Optional placeholder icon */}
        <RefreshCw className="w-12 h-12 text-text-muted animate-spin" />
        <p className="text-center text-sm font-medium">{message}</p>
        {onReset && (
          <button
            onClick={onReset}
            className="mt-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
