'use client';

import { useEffect, useState } from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import { saveDraft, StoredDraft } from '@/lib/drafts';
import { PrdInput } from '@/lib/prd';
import {
  Clipboard,
  CheckCircle,
  Eye,
  Save,
  Download,
  Copy,
  Check
} from 'lucide-react';

interface PRDDisplayProps {
  content: string;
  isLivePreview?: boolean;
  productName?: string;
  prdInputs?: PrdInput;
  model?: string;
  onSaved?: () => void;
  onFullPageView?: () => void;
}

export function PRDDisplay({
  content,
  isLivePreview = false,
  productName = 'PRD',
  prdInputs,
  model = 'gemini-flash-latest',
  onSaved,
  onFullPageView
}: PRDDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  useEffect(() => {
    if (!isSaved) return;
    const timer = window.setTimeout(() => setIsSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isSaved]);

  const handleCopy = async () => {
    const plainText = content
      .replace(/###\s/g, '')
      .replace(/##\s/g, '')
      .replace(/#\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/---\s/g, '\n')
      .replace(/-\s/g, '');

    try {
      await navigator.clipboard.writeText(plainText);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  const handleDownload = () => {
    // Create a sanitized filename
    const sanitizedName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitizedName}_prd_${new Date().toISOString().split('T')[0]}.md`;

    // Create blob and download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!prdInputs) {
      return;
    }

    setIsSaving(true);
    try {
      const draft: StoredDraft = {
        id: crypto.randomUUID(),
        title: productName || 'Untitled PRD',
        createdAt: new Date().toISOString(),
        model: model,
        inputs: prdInputs,
        markdown: content
      };

      await saveDraft(draft);
      setIsSaved(true);
      if (onSaved) {
        onSaved();
      }
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`flex min-h-0 flex-col rounded-xl border border-[#e5e7eb] bg-white shadow-sm ${!isLivePreview ? 'generated-prd overflow-hidden' : ''} group relative`}
    >
      <div className="flex flex-shrink-0 items-center justify-between rounded-t-xl border-b border-[#e5e7eb] bg-white px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-[#374151]">
          {isLivePreview ? (
            <>
              <Clipboard className="h-4 w-4 text-[#6366f1]" /> Live Preview
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-[#10b981]" /> Generated PRD
            </>
          )}
        </h2>
        {!isLivePreview && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !prdInputs}
              className="flex items-center rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-all hover:border-[#d1d5db] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
              title="Save to browser storage"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg
                    className="mr-1.5 -ml-1 h-3 w-3 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : isSaved ? (
                <span className="flex items-center text-[#10b981]">
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Saved
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save
                </span>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center rounded-lg bg-[#6366f1] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#4f46e5]"
              title="Download as Markdown"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-all hover:border-[#d1d5db] hover:bg-[#f9fafb]"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <span className="flex items-center text-[#10b981]">
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Copied
                </span>
              ) : (
                <span className="flex items-center">
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy
                </span>
              )}
            </button>
            {onFullPageView && (
              <button
                onClick={onFullPageView}
                className="flex items-center rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-all hover:border-[#d1d5db] hover:bg-[#f9fafb]"
                title="View in full page"
              >
                <Eye className="mr-1 h-3 w-3" />
                Full Page
              </button>
            )}
          </div>
        )}
      </div>
      <div
        className={`neo-content-scrollable ${isLivePreview ? 'live-preview' : ''} ${isLivePreview ? 'flex-none' : 'flex-1'} min-h-0 bg-white`}
      >
        <div className="h-full p-6 sm:p-8">
          <div className="markdown-content h-full">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
