import { Loader2 } from 'lucide-react';

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-black bg-white p-12 text-center shadow-[4px_4px_0px_#000]">
      <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-black bg-[#FFEB3B] shadow-[4px_4px_0px_#000]">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
      <p className="text-xl font-black text-black">Generating your PRD...</p>
      <p className="mt-2 text-sm font-medium text-gray-700">
        The AI is thinking. This may take a moment.
      </p>
    </div>
  );
}
