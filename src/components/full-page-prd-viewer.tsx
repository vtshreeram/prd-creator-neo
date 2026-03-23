'use client';

import { useEffect, useState, useMemo } from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import {
  X,
  List,
  ChevronRight,
  Sparkles,
  Wand2,
  ArrowRight,
  FileText,
  FileDown
} from 'lucide-react';
import { PrdInput } from '@/lib/prd';
import { RefineModal } from './refine-modal';
import { Button } from './button';
import { exportToWord } from '@/lib/export';

interface FullPagePRDViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  productName: string;
  model: string;
  productMode?: string;
  prdInput?: PrdInput;
  apiKey?: string;
  onUpdatePRD?: (newPrd: string, newInputs: PrdInput) => void;
}

interface Heading {
  id: string;
  text: string;
  level: number;
  sectionKey?: string;
}

// Map markdown heading text to SECTION_FIELD_MAPPING keys
const headingToSectionKey = (text: string): string | undefined => {
  const normalized = text.toLowerCase();
  if (
    normalized.includes('introduction') ||
    normalized.includes('vision') ||
    normalized.includes('problem')
  )
    return '1. Core Product Idea';
  if (
    normalized.includes('audience') ||
    normalized.includes('persona') ||
    normalized.includes('market')
  )
    return '2. Audience & Market';
  if (
    normalized.includes('feature') ||
    normalized.includes('requirement') ||
    normalized.includes('scope')
  )
    return '3. Features & Scope';
  if (
    normalized.includes('technical') ||
    normalized.includes('consideration') ||
    normalized.includes('constraint') ||
    normalized.includes('stack')
  )
    return '4. Technical Details (Optional)';
  return undefined;
};

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className || 'h-6 w-6'}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className || 'h-6 w-6'}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className || 'h-6 w-6'}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

export function FullPagePRDViewer({
  isOpen,
  onClose,
  content,
  productName,
  model,
  productMode,
  prdInput,
  apiKey,
  onUpdatePRD
}: FullPagePRDViewerProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  useEffect(() => {
    if (productMode === 'Feature Enhancement') {
      setIsComparisonMode(true);
    } else {
      setIsComparisonMode(false);
    }
  }, [productMode]);

  // Refinement state
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refineSectionTitle, setRefineSectionTitle] = useState('');
  const [refineFeedback, setRefineFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState('');

  const headings = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const extracted: Heading[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/\*\*/g, '').replace(/\*/g, '');
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const sectionKey = headingToSectionKey(text);
        extracted.push({ id, text, level, sectionKey });
      }
    });

    return extracted;
  }, [content]);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Observer for active heading
  useEffect(() => {
    if (!isOpen || !content) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    const headingElements = document.querySelectorAll(
      '.markdown-content h1, .markdown-content h2, .markdown-content h3'
    );
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isOpen, content]);

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
    const sanitizedName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitizedName}_prd_${new Date().toISOString().split('T')[0]}.md`;

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

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    const sanitizedName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitizedName}_prd_${new Date().toISOString().split('T')[0]}`;
    await exportToWord(content, fileName);
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveHeading(id);
    }
  };

  const handleRefineClick = (sectionTitle: string) => {
    setRefineSectionTitle(sectionTitle);
    setRefineFeedback('');
    setRefineError('');
    setIsRefineModalOpen(true);
  };

  const handleRefineSubmit = async () => {
    if (!prdInput || !apiKey || !onUpdatePRD) return;

    setIsRefining(true);
    setRefineError('');

    try {
      // 1. Refine the inputs
      const refineResponse = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentInputs: prdInput,
          sectionTitle: refineSectionTitle,
          userFeedback: refineFeedback,
          apiKey,
          model
        })
      });

      if (!refineResponse.ok) {
        const errorData = await refineResponse.json();
        throw new Error(errorData.error || 'Failed to refine section');
      }

      const { data: updatedFields } = await refineResponse.json();
      const updatedInputs = { ...prdInput, ...updatedFields };

      // 2. Re-generate the PRD with updated inputs
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: updatedInputs,
          apiKey,
          model
        })
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to re-generate PRD');
      }

      const { data: generateData } = await generateResponse.json();

      // 3. Update the main state
      onUpdatePRD(generateData.prd, updatedInputs);
      setIsRefineModalOpen(false);
    } catch (err) {
      setRefineError(
        err instanceof Error
          ? err.message
          : 'An error occurred during refinement.'
      );
    } finally {
      setIsRefining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="flex h-full w-full flex-col bg-white shadow-xl sm:h-[95vh] sm:w-[95vw] sm:overflow-hidden sm:rounded-xl print:h-auto print:w-auto sm:print:h-auto sm:print:w-auto">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white p-4 px-6 print:hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {productName} - PRD
            </h1>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {model}
              </span>
              {productMode && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  {productMode}
                </span>
              )}
              {productMode === 'Feature Enhancement' && (
                <button
                  onClick={() => setIsComparisonMode(!isComparisonMode)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isComparisonMode
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isComparisonMode ? 'Full View' : 'Compare View'}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="hidden sm:flex"
            >
              {isCopied ? (
                <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <CopyIcon className="mr-2 h-4 w-4" />
              )}
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>

            <div className="flex items-center rounded-md border border-gray-200 bg-white">
              <button
                onClick={handleDownload}
                className="flex items-center border-r border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                title="Download as Markdown"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                MD
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center border-r border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                title="Download as PDF"
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </button>
              <button
                onClick={handleDownloadWord}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                title="Download as Word"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Word
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-2 rounded-full hover:bg-gray-100"
              title="Close (Esc)"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden print:block print:overflow-visible">
          {/* Sidebar */}
          <div className="hidden w-72 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50/50 md:flex print:hidden">
            <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 text-sm font-semibold text-gray-900">
              <List className="h-4 w-4" />
              Table of Contents
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-1">
                {headings.map((heading) => (
                  <div key={heading.id} className="group relative">
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        activeHeading === heading.id
                          ? 'bg-blue-50 font-medium text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      } ${heading.level === 1 ? 'mt-2 font-semibold text-gray-900 first:mt-0' : heading.level === 2 ? 'pl-4' : 'pl-8'}`}
                    >
                      {heading.level === 1 ? (
                        <span className="flex-1">{heading.text}</span>
                      ) : (
                        <>
                          <ChevronRight
                            className={`h-3 w-3 flex-shrink-0 transition-transform ${activeHeading === heading.id ? 'rotate-90 text-blue-700' : 'text-gray-400'}`}
                          />
                          <span className="flex-1">{heading.text}</span>
                        </>
                      )}
                    </button>

                    {heading.sectionKey && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefineClick(heading.sectionKey!);
                        }}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-white p-1.5 text-gray-500 opacity-0 shadow-sm ring-1 ring-gray-200 transition-all ring-inset group-hover:opacity-100 hover:text-blue-600"
                        title={`Refine ${heading.sectionKey}`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Quick Actions at Sidebar Bottom */}
            <div className="border-t border-gray-200 bg-white/50 p-4">
              <Button
                variant="outline"
                className="w-full text-sm font-medium"
                onClick={() => handleRefineClick('1. Core Product Idea')}
                disabled={!apiKey}
              >
                <Wand2 className="mr-2 h-4 w-4 text-blue-600" />
                Refine Entire Document
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-white print:overflow-visible">
            <div className="mx-auto max-w-4xl p-8 pb-32 sm:p-12 print:p-0 print:pb-0">
              {isComparisonMode && prdInput?.currentState && (
                <div className="mb-12 rounded-xl border border-gray-200 bg-gray-50/50 p-6 print:mb-8 print:border-0 print:bg-transparent print:p-0">
                  <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 print:mb-4">
                    <ArrowRight className="h-5 w-5 text-gray-400 print:hidden" />
                    Comparison View
                  </div>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:grid-cols-2 print:gap-4">
                    <div className="space-y-3">
                      <div className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-600/10 ring-inset">
                        Before (Current State)
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:border-gray-300 print:shadow-none">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                          {prdInput.currentState}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-600/20 ring-inset">
                        After (Proposed Changes)
                      </div>
                      <div className="rounded-lg border border-green-200 bg-white p-5 shadow-sm ring-1 ring-green-50 print:border-gray-300 print:shadow-none print:ring-0">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                          {prdInput.proposedChanges}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {content && content.trim().length > 0 ? (
                <div className="markdown-content text-gray-800">
                  <MarkdownRenderer content={content} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <FileText className="mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900">
                    No PRD content to display
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Please generate a PRD first to see it here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RefineModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        onSubmit={handleRefineSubmit}
        isLoading={isRefining}
        sectionTitle={refineSectionTitle}
        feedback={refineFeedback}
        setFeedback={setRefineFeedback}
        error={refineError}
      />
    </div>
  );
}
