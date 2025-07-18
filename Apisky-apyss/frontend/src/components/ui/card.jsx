import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      {...props}
      className={`border border-border rounded-lg shadow-sm bg-card text-card-foreground ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      {...props}
      className={`px-4 py-2 border-b border-border font-semibold ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      {...props}
      className={`text-lg font-medium px-4 pt-4 ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p
      {...props}
      className={`text-sm text-muted-foreground px-4 pb-4 ${className}`}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div
      {...props}
      className={`p-4 pt-0 ${className}`}
    >
      {children}
    </div>
  );
}
