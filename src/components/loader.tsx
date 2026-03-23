import { Loader2 } from 'lucide-react';

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-6 rounded-full bg-[#6366f1]/10 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#6366f1]" />
      </div>
      <p className="text-lg font-medium text-[#111827]">
        Generating your PRD...
      </p>
      <p className="mt-2 text-sm text-[#6b7280]">
        The AI is thinking. This may take a moment.
      </p>
    </div>
  );
}
