import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label?: string;
  helper?: string;
  error?: string;
  id: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {}

export const Input: React.FC<InputProps> = ({
  label,
  helper,
  error,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 tracking-tight">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {!error && helper && <span className="text-xs text-slate-500">{helper}</span>}
    </div>
  );
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps {}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helper,
  error,
  id,
  className = '',
  rows = 3,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 tracking-tight">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-500 resize-none ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {!error && helper && <span className="text-xs text-slate-500">{helper}</span>}
    </div>
  );
};
