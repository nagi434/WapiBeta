import React from 'react';

export function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition ${className}`}
    >
      {children}
    </button>
  );
}
