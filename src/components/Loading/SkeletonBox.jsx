import React from 'react';

/**
 * Simple skeleton placeholder used while loading content.
 * Accepts a height (e.g., '2rem', '150px') and optional additional Tailwind classes.
 */
export default function SkeletonBox({ height = '1rem', className = '' }) {
  return (
    <div
      className={`bg-gray-700 animate-pulse rounded ${className}`}
      style={{ height }}
    />
  );
}
