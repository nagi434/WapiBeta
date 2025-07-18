// frontend/src/components/ui/label.jsx
import React from 'react';

export function Label({ htmlFor, children, className = '', ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
