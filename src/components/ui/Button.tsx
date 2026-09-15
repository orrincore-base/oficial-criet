import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-6 py-3 gap-2.5 h-12',
  };

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 border border-blue-600/30',
    secondary:
      'bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-200/60',
    outline:
      'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs hover:border-slate-300',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger:
      'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
