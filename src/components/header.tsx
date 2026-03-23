import { FileText, Settings, Bookmark } from 'lucide-react';
import { Button } from './button';

interface HeaderProps {
  onSettingsClick: () => void;
  currentModel?: string;
  modelDisplayName?: string;
  onSavedDraftsClick?: () => void;
}

export function Header({ onSettingsClick, onSavedDraftsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-[#6366f1] p-2">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-[#111827] md:text-2xl">
              PRD Creator
            </h1>
            <span className="ml-2 rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-xs font-medium text-[#6b7280]">
              Beta
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onSavedDraftsClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSavedDraftsClick}
                className="hidden sm:flex"
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Saved Drafts
              </Button>
            )}
            {onSavedDraftsClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSavedDraftsClick}
                className="sm:hidden"
                aria-label="Saved Drafts"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
