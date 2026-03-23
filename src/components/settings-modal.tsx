'use client';

import React, { useState, useEffect } from 'react';
import { GEMINI_MODELS } from '@/lib/models';
import { Settings, Check, X, Info } from 'lucide-react';
import { Button } from './button';

interface Model {
  value: string;
  label: string;
  description: string;
  displayName?: string;
  inputTokenLimit?: number | null;
  outputTokenLimit?: number | null;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string, modelDisplayName?: string) => void;
  currentApiKey: string;
  currentModel: string;
}

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  currentApiKey,
  currentModel
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [model, setModel] = useState(currentModel);
  const [showApiKey, setShowApiKey] = useState(false);
  const [models, setModels] = useState<Model[]>(GEMINI_MODELS);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState('');

  useEffect(() => {
    setApiKey(currentApiKey);
    setModel(currentModel);
  }, [currentApiKey, currentModel, isOpen]);

  // Fetch models when API key is entered and modal is opened
  useEffect(() => {
    if (isOpen && apiKey && apiKey.trim().length > 20) {
      fetchModels(apiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, apiKey]);

  const fetchModels = async (key: string) => {
    setLoadingModels(true);
    setModelsError('');

    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: key })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();

      if (data.models && data.models.length > 0) {
        setModels(data.models);
        // If current model is not in the list, select the first one
        if (!data.models.find((m: Model) => m.value === model)) {
          setModel(data.models[0].value);
        }
      }
    } catch {
      setModelsError('Could not fetch models. Using default list.');
      // Fallback to static list
      setModels(GEMINI_MODELS);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = () => {
    if (apiKey.trim()) {
      const selectedModelData = models.find((m) => m.value === model);
      const displayName =
        selectedModelData?.displayName || selectedModelData?.label || model;
      onSave(apiKey.trim(), model, displayName);
      onClose();
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);

    // Auto-fetch models when API key looks valid (basic length check)
    if (newKey.trim().length > 20) {
      // Debounce the fetch
      const timeoutId = setTimeout(() => {
        fetchModels(newKey);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#111827]">
              <Settings className="h-5 w-5 text-[#6b7280]" />
              Settings
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* API Key Section */}
          <div className="mb-8 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-[#374151]"
              >
                Gemini API Key <span className="text-[#dc2626]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your Gemini API key"
                  className="flex h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-[#374151] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md bg-[#f3f4f6] px-2.5 py-1 text-xs font-medium text-[#374151] transition-colors hover:bg-[#e5e7eb]"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-sm text-[#6b7280]">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#6366f1] hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-[#374151]"
                >
                  Model Selection
                </label>
                {loadingModels && (
                  <span className="flex items-center text-xs font-medium text-[#6366f1]">
                    <svg
                      className="mr-1.5 h-3.5 w-3.5 animate-spin"
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
                    Fetching models...
                  </span>
                )}
                {!loadingModels && models.length > GEMINI_MODELS.length && (
                  <span className="flex items-center gap-1 text-xs font-medium text-[#10b981]">
                    <Check className="h-3 w-3" />
                    {models.length} loaded
                  </span>
                )}
              </div>

              {modelsError && (
                <div className="rounded-lg bg-[#fef3c7] p-3 text-sm text-[#92400e]">
                  {modelsError}
                </div>
              )}

              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={loadingModels}
                className="flex h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-[#374151] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
              >
                {models.map((modelOption) => (
                  <option key={modelOption.value} value={modelOption.value}>
                    {modelOption.displayName || modelOption.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-[#6b7280]">
                  {models.find((m) => m.value === model)?.description}
                </p>
                {models.find((m) => m.value === model)?.inputTokenLimit && (
                  <p className="text-xs text-[#9ca3af]">
                    Context Window:{' '}
                    {models
                      .find((m) => m.value === model)
                      ?.inputTokenLimit?.toLocaleString()}{' '}
                    tokens
                  </p>
                )}
              </div>
            </div>

            {/* Token Info */}
            <div className="rounded-lg bg-[#f9fafb] p-4">
              <div className="flex items-start">
                <Info className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-[#6b7280]" />
                <div>
                  <h4 className="text-sm font-medium text-[#374151]">
                    Unlimited Token Generation
                  </h4>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Token limits are removed for maximum flexibility. The API
                    will generate as much content as needed for comprehensive
                    PRDs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] pt-6 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="w-full sm:w-auto"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
