// frontend/src/components/ui/alert.jsx
import React from 'react';

export function Alert({ children, className = '', ...props }) {
  return (
    <div
      role="alert"
      className={`p-4 rounded border border-destructive bg-destructive/10 text-destructive ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '', ...props }) {
  return (
    <p className={`mt-2 text-sm ${className}`} {...props}>
      {children}
    </p>
  );
}
