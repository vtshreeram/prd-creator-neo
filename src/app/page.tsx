'use client';

import React, { useState, useEffect } from 'react';
import { PrdInput, DEFAULT_PRD_INPUT } from '@/lib/prd';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PRDWizard } from '@/components/prd-wizard';
import { FullPagePRDViewer } from '@/components/full-page-prd-viewer';
import { SettingsModal } from '@/components/settings-modal';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { SavedDraftsModal } from '@/components/saved-drafts-modal';
import { StoredDraft } from '@/lib/drafts';

export default function Home() {
  // Settings state
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(
    'gemini-flash-latest'
  );
  const [modelDisplayName, setModelDisplayName] =
    useState<string>('Gemini 2.5 Flash');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showSetupPrompt, setShowSetupPrompt] = useState<boolean>(false);
  const [isSavedDraftsOpen, setIsSavedDraftsOpen] = useState<boolean>(false);
  const [isFullPageViewOpen, setIsFullPageViewOpen] = useState<boolean>(false);

  const [prdInput, setPrdInput] = useState<PrdInput>(DEFAULT_PRD_INPUT);
  const [generatedPrd, setGeneratedPrd] = useState<string>('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    const storedModel = localStorage.getItem('gemini_model');
    const storedModelDisplayName = localStorage.getItem(
      'gemini_model_display_name'
    );

    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setShowSetupPrompt(true);
    }

    if (storedModel) {
      setSelectedModel(storedModel);
    } else {
      // Set default to gemini-flash-latest
      setSelectedModel('gemini-flash-latest');
    }

    if (storedModelDisplayName) {
      setModelDisplayName(storedModelDisplayName);
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('gemini_model', selectedModel);
    localStorage.setItem('gemini_model_display_name', modelDisplayName);
  }, [selectedModel, modelDisplayName]);

  const handleSaveSettings = (
    newApiKey: string,
    newModel: string,
    newModelDisplayName?: string
  ) => {
    setApiKey(newApiKey);
    setSelectedModel(newModel);
    setModelDisplayName(newModelDisplayName || newModel);
    setIsSettingsOpen(false);
    setShowSetupPrompt(false);
  };

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const handleLoadDraft = (draft: StoredDraft) => {
    // Ensure all required fields exist (especially for older drafts)
    const sanitizedInputs = {
      ...DEFAULT_PRD_INPUT,
      ...draft.inputs
    };
    setPrdInput(sanitizedInputs);
    setGeneratedPrd(draft.markdown);
    setSelectedModel(draft.model);
    setCurrentStep(4); // Switch to last step to show the loaded PRD
  };

  const handleResetState = () => {
    setPrdInput(DEFAULT_PRD_INPUT);
    setGeneratedPrd('');
    setCurrentStep(1);
  };

  const handleFullPageView = () => {
    setIsFullPageViewOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Header
        onSettingsClick={() => setIsSettingsOpen(true)}
        onSavedDraftsClick={() => setIsSavedDraftsOpen(true)}
      />

      <main className="container mx-auto min-h-0 flex-grow px-4 py-8">
        <div className="mx-auto flex h-full min-h-0 max-w-7xl flex-col">
          {/* Setup Prompt Banner */}
          {showSetupPrompt && (
            <div className="mb-6 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#6366f1]/10">
                    <svg
                      className="h-5 w-5 text-[#6366f1]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-0.5 text-sm font-semibold text-[#111827]">
                      Setup Required
                    </h3>
                    <p className="text-sm text-[#6b7280]">
                      Add your Gemini API key to start generating PRDs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#4f46e5]"
                >
                  Configure API Key
                </button>
              </div>
            </div>
          )}

          {/* Main Content - Wizard Only */}
          <div className="mx-auto w-full max-w-6xl">
            <PRDWizard
              apiKey={apiKey}
              selectedModel={selectedModel}
              modelDisplayName={modelDisplayName}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              generatedPrd={generatedPrd}
              prdInput={prdInput}
              onGeneratedPRD={(prd, inputs) => {
                setGeneratedPrd(prd);
                setPrdInput(inputs);
              }}
              onFullPageView={handleFullPageView}
              onResetState={handleResetState}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
        currentModel={selectedModel}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Saved Drafts Modal */}
      <SavedDraftsModal
        isOpen={isSavedDraftsOpen}
        onClose={() => setIsSavedDraftsOpen(false)}
        onLoadDraft={handleLoadDraft}
      />

      {/* Full Page PRD Viewer */}
      <FullPagePRDViewer
        isOpen={isFullPageViewOpen}
        onClose={() => setIsFullPageViewOpen(false)}
        content={generatedPrd}
        productName={prdInput.productName || 'PRD'}
        model={selectedModel}
        productMode={prdInput.productMode}
        prdInput={prdInput}
        apiKey={apiKey}
        onUpdatePRD={(newPrd, newInputs) => {
          setGeneratedPrd(newPrd);
          setPrdInput(newInputs);
        }}
      />
    </div>
  );
}
