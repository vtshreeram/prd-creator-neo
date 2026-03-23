import { ChangeEvent } from 'react';
import { Button } from './button';
import { TextareaField } from './textarea-field';

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  sectionTitle: string;
  feedback: string;
  setFeedback: (value: string) => void;
  error?: string;
}

export function RefineModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  sectionTitle,
  feedback,
  setFeedback,
  error
}: RefineModalProps) {
  if (!isOpen) return null;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setFeedback(event.target.value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              Refine &ldquo;{sectionTitle}&rdquo;
            </h3>
            <div className="mt-4">
              <TextareaField
                label="Your Feedback"
                id="refineFeedback"
                value={feedback}
                onChange={handleChange}
                placeholder={`e.g., "Make the tone more formal" or "Add a feature for social media sharing."`}
                rows={4}
                description="Provide instructions for the AI to edit this section."
              />
            </div>
            {error ? (
              <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                <span className="font-semibold">Error:</span> {error}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            isLoading={isLoading}
            disabled={isLoading || !feedback.trim()}
            variant="primary"
            className="sm:w-auto"
          >
            {isLoading ? 'Refining...' : 'Refine with AI'}
          </Button>
        </div>
      </div>
    </div>
  );
}
