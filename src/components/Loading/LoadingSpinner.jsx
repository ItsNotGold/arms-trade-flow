import React from 'react';

export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-4 border-dashed rounded-full border-accent animate-spin" />
    </div>
  );
}
