import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring transition ${className}`}
    />
  );
}
