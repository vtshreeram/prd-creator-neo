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
    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
      <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-4">
        <h2 className="text-lg font-black text-black">{title}</h2>
        {onRefine ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onRefine}
            className="h-8 gap-1.5 text-xs"
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
