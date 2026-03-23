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
    <header className="sticky top-0 z-50 border-b-4 border-black bg-white shadow-[0_4px_0px_#000]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center border-2 border-black bg-[#FFEB3B] p-2 shadow-[2px_2px_0px_#000]">
              <FileText className="h-5 w-5 text-black" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-black md:text-2xl">
              PRD Creator
            </h1>
            <span className="ml-2 hidden rounded-none border-2 border-black bg-[#E91E63] px-2.5 py-0.5 text-xs font-bold text-white shadow-[2px_2px_0px_#000] md:inline-block">
              Beta
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onSavedDraftsClick && (
              <Button
                variant="secondary"
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
                variant="secondary"
                size="icon"
                onClick={onSavedDraftsClick}
                className="sm:hidden"
                aria-label="Saved Drafts"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="outline"
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
