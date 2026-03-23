import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, label, description, id, required, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-sm font-medium text-[#374151]">
          {label} {required && <span className="text-[#dc2626]">*</span>}
        </label>
        <input
          id={id}
          className={cn(
            'flex h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-[#374151] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f9fafb] disabled:text-[#9ca3af]',
            className
          )}
          ref={ref}
          required={required}
          {...props}
        />
        {description && <p className="text-xs text-[#6b7280]">{description}</p>}
      </div>
    );
  }
);
InputField.displayName = 'InputField';

export { InputField };
