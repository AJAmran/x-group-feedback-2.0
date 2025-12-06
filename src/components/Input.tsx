import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  isTextArea?: boolean;
  error?: boolean;
}

export const Input: React.FC<InputProps> = React.memo(({ label, isTextArea, error, className, ...props }) => {
  const baseClasses = `w-full bg-white/60 backdrop-blur-md text-slate-800 text-[15px] rounded-xl px-4 py-3.5 border border-white/40 shadow-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white/90 focus:border-[hsl(var(--brand-glow))] focus:shadow-[0_0_0_3px_hsl(var(--brand-glow)/15%),0_4px_16px_hsl(var(--brand-glow)/20%)] focus:-translate-y-0.5 ${error ? 'border-2 !border-red-500 focus:!border-red-500 focus:ring-2 focus:ring-red-200' : ''
    }`;

  return (
    <div className="flex flex-col space-y-2 w-full group">
      <div className="flex justify-between items-baseline ml-1">
        <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${error ? 'text-red-600' : 'text-slate-500 group-focus-within:text-[hsl(var(--brand-primary))]'
          }`}>
          {label}
        </label>
        {props.required && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider ${error ? 'text-red-700 bg-red-50' : 'text-[hsl(var(--brand-primary))]/70 bg-[hsl(var(--brand-primary))]/5'
            }`}>
            REQUIRED
          </span>
        )}
      </div>
      {isTextArea ? (
        <textarea
          className={`${baseClasses} min-h-[100px] resize-none ${className || ''}`}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
        />
      ) : (
        <input
          className={`${baseClasses} ${className || ''}`}
          {...props}
        />
      )}
    </div>
  );
});

Input.displayName = 'Input';