import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './button';

interface SectionProps {
  title: string;
  children: ReactNode;
  onRefine?: () => void;
}

export function Section({ title, children, onRefine }: SectionProps) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-[#f3f4f6] pb-4">
        <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
        {onRefine ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefine}
            className="h-8 gap-1.5 text-xs text-[#6366f1]"
            aria-label={`Refine ${title} section with AI`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Refine
          </Button>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
