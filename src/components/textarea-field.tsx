import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ className, label, description, id, required, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor={id}
          className="text-sm font-bold tracking-wide uppercase"
        >
          {label} {required && <span className="text-[#F44336]">*</span>}
        </label>
        <textarea
          id={id}
          className={cn(
            'flex min-h-[100px] w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-[#2196F3] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50',
            className
          )}
          ref={ref}
          required={required}
          {...props}
        />
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    );
  }
);
TextareaField.displayName = 'TextareaField';

export { TextareaField };
