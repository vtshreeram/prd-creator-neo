import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    { className, label, description, id, required, rows = 6, ...props },
    ref
  ) => {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-[15px] font-semibold text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id={id}
          rows={rows}
          className={cn(
            'flex w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
            className
          )}
          ref={ref}
          required={required}
          {...props}
        />
        {description && (
          <p className="mt-1.5 text-[13px] text-gray-500">{description}</p>
        )}
      </div>
    );
  }
);
TextareaField.displayName = 'TextareaField';

export { TextareaField };
