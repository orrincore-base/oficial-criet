import React from 'react';

export interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      {(label || description) && (
        <label htmlFor={id} className="cursor-pointer text-left select-none">
          {label && <p className="text-sm font-semibold text-slate-800">{label}</p>}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'slate' | 'red' | 'green' | 'amber' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
}) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-bold tracking-wide uppercase',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  id,
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-2xl p-6 transition-all duration-200 ${
        hoverable ? 'hover:border-blue-400 hover:shadow-md cursor-pointer' : 'shadow-xs'
      } ${className}`}
    >
      {children}
    </div>
  );
};
