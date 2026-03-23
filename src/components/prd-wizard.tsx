'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Edit3,
  FileText,
  Camera,
  MessageSquare,
  Cloud,
  Bot,
  Smartphone,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import { PrdInput, DEFAULT_PRD_INPUT, ImageAttachment } from '@/lib/prd';
import { Button } from './button';
import { Loader } from './loader';
import { TextareaField } from './textarea-field';
import { PRDDisplay } from './prd-display';
import ImageAttachmentComponent from './image-attachment';

interface PRDWizardProps {
  apiKey: string;
  selectedModel: string;
  modelDisplayName: string;
  onGeneratedPRD: (prd: string, inputs: PrdInput) => void;
  onFullPageView?: () => void;
  currentStep?: 1 | 2 | 3 | 4;
  setCurrentStep?: (step: 1 | 2 | 3 | 4) => void;
  generatedPrd?: string;
  prdInput?: PrdInput;
  onResetState?: () => void;
}

export function PRDWizard({
  apiKey,
  selectedModel,
  modelDisplayName,
  onGeneratedPRD,
  onFullPageView,
  currentStep: externalCurrentStep,
  setCurrentStep: externalSetCurrentStep,
  generatedPrd: externalGeneratedPrd,
  prdInput: externalPrdInput,
  onResetState
}: PRDWizardProps) {
  const [internalCurrentStep, setInternalCurrentStep] = useState<1 | 2 | 3 | 4>(
    1
  );
  const [internalPrdInput, setInternalPrdInput] =
    useState<PrdInput>(DEFAULT_PRD_INPUT);
  const [internalGeneratedPrd, setInternalGeneratedPrd] = useState<string>('');

  const currentStep = externalCurrentStep ?? internalCurrentStep;
  const setCurrentStep = externalSetCurrentStep ?? setInternalCurrentStep;
  const prdInput =
    externalPrdInput && externalPrdInput.productName
      ? externalPrdInput
      : internalPrdInput;
  const generatedPrd = externalGeneratedPrd || internalGeneratedPrd;

  const [productIdea, setProductIdea] = useState<string>('');
  const [productIdeaImages, setProductIdeaImages] = useState<ImageAttachment[]>(
    []
  );
  const [clarificationQuestions, setClarificationQuestions] = useState<
    string[]
  >([]);
  const [userClarificationAnswers, setUserClarificationAnswers] = useState<
    string[]
  >([]);
  const [isClarifying, setIsClarifying] = useState<boolean>(false);
  const [isPrefilling, setIsPrefilling] = useState<boolean>(false);
  const [prefillError, setPrefillError] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string>('');

  const steps = [
    {
      id: 1,
      title: 'Idea Entry',
      description: 'Describe your product idea',
      icon: Sparkles
    },
    {
      id: 2,
      title: 'Clarification',
      description: 'AI-guided deep dive',
      icon: MessageSquare
    },
    {
      id: 3,
      title: 'Auto-fill & Edit',
      description: 'Review and customize details',
      icon: Edit3
    },
    {
      id: 4,
      title: 'PRD Preview',
      description: 'Your generated document',
      icon: FileText
    }
  ];

  const handleIdeaSubmit = async () => {
    if (!productIdea.trim()) return;

    setIsClarifying(true);
    setPrefillError('');

    const imageData = await Promise.all(
      productIdeaImages.map(async (img) => ({
        id: img.id,
        name: img.name,
        type: img.type,
        size: img.size,
        data: img.preview
      }))
    );

    try {
      const response = await fetch('/api/clarify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIdea: productIdea.trim(),
          images: imageData,
          productMode: prdInput.productMode,
          apiKey,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const { data } = await response.json();
      setClarificationQuestions(data);
      setUserClarificationAnswers(new Array(data.length).fill(''));
      setCurrentStep(2);
    } catch (err) {
      setPrefillError(
        err instanceof Error
          ? err.message
          : 'An error occurred while clarifying the idea.'
      );
    } finally {
      setIsClarifying(false);
    }
  };

  const handleClarificationSubmit = async () => {
    setIsPrefilling(true);
    setPrefillError('');

    const imageData = await Promise.all(
      productIdeaImages.map(async (img) => ({
        id: img.id,
        name: img.name,
        type: img.type,
        size: img.size,
        data: img.preview
      }))
    );

    const enrichedIdea = `
Initial Idea: ${productIdea}

Additional Context:
${clarificationQuestions
  .map((q, i) =>
    userClarificationAnswers[i]
      ? `Q: ${q}\nA: ${userClarificationAnswers[i]}`
      : ''
  )
  .filter(Boolean)
  .join('\n\n')}
    `.trim();

    try {
      const response = await fetch('/api/prefill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIdea: enrichedIdea,
          images: imageData,
          productMode: prdInput.productMode,
          apiKey,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prefill form');
      }

      const responseJson = await response.json();
      const { data } = responseJson;
      setInternalPrdInput(data);
      setCurrentStep(3);
    } catch (err) {
      setPrefillError(
        err instanceof Error
          ? err.message
          : 'An error occurred while prefilling the form.'
      );
    } finally {
      setIsPrefilling(false);
    }
  };

  const handleGeneratePRD = async () => {
    setIsGenerating(true);
    setGenerateError('');

    const inputsWithImages = {
      ...prdInput,
      productIdeaImages: productIdeaImages
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: inputsWithImages,
          apiKey,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PRD');
      }

      const { data } = await response.json();
      setInternalGeneratedPrd(data.prd);
      onGeneratedPRD(data.prd, prdInput);
      setCurrentStep(4);
    } catch (err) {
      setGenerateError(
        err instanceof Error
          ? err.message
          : 'An error occurred while generating the PRD.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (event) => {
    const { name, value } = event.target;
    setInternalPrdInput((previous) => ({ ...previous, [name]: value }));
  };

  const canGoToStep2 = productIdea.trim().length > 0;
  const canGoToStep4 =
    prdInput.productName.trim().length > 0 &&
    prdInput.problemStatement.trim().length > 0;

  const handleFullPageView = () => {
    if (onFullPageView) {
      onFullPageView();
    }
  };

  const handleFinish = () => {
    setCurrentStep(1);
    setProductIdea('');
    setProductIdeaImages([]);
    setClarificationQuestions([]);
    setUserClarificationAnswers([]);
    if (externalPrdInput) {
      onResetState?.();
    } else {
      setInternalPrdInput(DEFAULT_PRD_INPUT);
    }
    if (externalGeneratedPrd) {
      onResetState?.();
    } else {
      setInternalGeneratedPrd('');
    }
    setPrefillError('');
    setGenerateError('');
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === 1) {
      setCurrentStep(1);
      if (externalPrdInput && currentStep === 4) {
        onResetState?.();
      }
    } else if (stepId === 2 && canGoToStep2) {
      setCurrentStep(2);
    } else if (stepId === 3 && canGoToStep2) {
      setCurrentStep(3);
    } else if (stepId === 4 && canGoToStep4) {
      setCurrentStep(4);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const nextAnswers = [...userClarificationAnswers];
    nextAnswers[index] = answer;
    setUserClarificationAnswers(nextAnswers);
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6 bg-transparent md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full flex-shrink-0 md:w-64 lg:w-72">
        <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 px-2">
            <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              PRD Creation Flow
            </h3>
          </div>
          <div className="space-y-1">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = step.id < currentStep;
              const isClickable =
                step.id === 1 ||
                (step.id === 2 && canGoToStep2) ||
                (step.id === 3 && canGoToStep2) ||
                (step.id === 4 && canGoToStep4);

              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && handleStepClick(step.id)}
                  disabled={!isClickable}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : isCompleted
                        ? 'text-gray-900 hover:bg-gray-100'
                        : isClickable
                          ? 'text-gray-600 hover:bg-gray-50'
                          : 'cursor-not-allowed text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                  ) : (
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                  )}
                  <span className="flex-1 truncate">{step.title}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
                Active Model
              </div>
              <div className="mt-1 truncate text-sm font-semibold text-gray-900">
                {modelDisplayName || selectedModel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-[500px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          {currentStep === 1 && (
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#6366f1]/10">
                  <Sparkles className="h-7 w-7 text-[#6366f1]" />
                </div>
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#111827]">
                  What&apos;s Your Product Idea?
                </h2>
                <p className="text-[#6b7280]">
                  Tell us about your product in a few sentences, and we&apos;ll
                  help you build a comprehensive PRD.
                </p>
              </div>

              <div className="space-y-8 text-left">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-[#374151]">
                    Product Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(
                      [
                        { id: 'SaaS Product', icon: Cloud, label: 'SaaS' },
                        { id: 'AI Product', icon: Bot, label: 'AI App' },
                        { id: 'Mobile App', icon: Smartphone, label: 'Mobile' },
                        {
                          id: 'Feature Enhancement',
                          icon: Wand2,
                          label: 'Feature'
                        }
                      ] as const
                    ).map((mode) => {
                      const ModeIcon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() =>
                            setInternalPrdInput((prev) => ({
                              ...prev,
                              productMode: mode.id as PrdInput['productMode']
                            }))
                          }
                          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                            prdInput.productMode === mode.id
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <ModeIcon
                            className={`h-6 w-6 ${prdInput.productMode === mode.id ? 'text-blue-600' : 'text-gray-400'}`}
                          />
                          <span className="text-sm font-semibold">
                            {mode.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#9ca3af]">
                    Select the mode that best fits your product idea to get
                    tailored results.
                  </p>
                </div>

                <TextareaField
                  label="Product Idea"
                  id="productIdea"
                  name="productIdea"
                  value={productIdea}
                  onChange={(e) => setProductIdea(e.target.value)}
                  placeholder="e.g., A mobile app that helps remote workers find and book coworking spaces with real-time availability..."
                  rows={8}
                  description="Describe your product concept, target users, and key features in your own words."
                />

                <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-6">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-[#374151]">
                    <Camera className="h-4 w-4 text-[#6b7280]" />
                    Add Visual Context{' '}
                    <span className="text-xs font-normal text-[#9ca3af]">
                      (Optional)
                    </span>
                  </h3>
                  <p className="mb-4 text-xs text-[#9ca3af]">
                    Attach mockups, diagrams, wireframes, or reference photos to
                    help the AI better understand your product idea.
                  </p>
                  <ImageAttachmentComponent
                    images={productIdeaImages}
                    onImagesChange={setProductIdeaImages}
                    maxImages={5}
                    maxFileSize={10 * 1024 * 1024}
                  />
                </div>
              </div>

              {prefillError && currentStep === 1 && (
                <div className="rounded-lg bg-[#fef2f2] p-4 text-sm text-[#dc2626]">
                  <span className="font-medium">Error:</span> {prefillError}
                </div>
              )}

              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                <Button
                  onClick={handleIdeaSubmit}
                  disabled={!canGoToStep2 || isClarifying}
                  isLoading={isClarifying}
                  variant="primary"
                  className="px-8"
                >
                  Analyze Idea <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#8b5cf6]/10">
                  <MessageSquare className="h-7 w-7 text-[#8b5cf6]" />
                </div>
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#111827]">
                  Let&apos;s Clarify a Few Things
                </h2>
                <p className="text-[#6b7280]">
                  Based on your idea, our AI strategist has identified a few
                  areas to dive deeper into.
                </p>
              </div>

              <div className="space-y-6 text-left">
                {clarificationQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#e5e7eb] bg-white p-5"
                  >
                    <label className="mb-3 block text-sm font-medium text-[#374151]">
                      {question}
                    </label>
                    <textarea
                      value={userClarificationAnswers[index]}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      className="flex min-h-[80px] w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm placeholder:text-[#d1d5db] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 focus:outline-none"
                      placeholder="Your answer (optional)..."
                      rows={3}
                    />
                  </div>
                ))}

                <div className="flex flex-col items-center gap-3 pt-4 pb-6">
                  <p className="text-xs text-[#9ca3af]">
                    Answering these will significantly improve the quality and
                    specificity of your PRD.
                  </p>
                </div>
              </div>

              {prefillError && currentStep === 2 && (
                <div className="rounded-lg bg-[#fef2f2] p-4 text-sm text-[#dc2626]">
                  <span className="font-medium">Error:</span> {prefillError}
                </div>
              )}

              <div className="mt-8 flex flex-col justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
                <Button
                  onClick={handleClarificationSubmit}
                  isLoading={isPrefilling}
                  disabled={isPrefilling}
                  variant="outline"
                  className="sm:w-auto"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Auto-fill Answers
                </Button>
                
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={isPrefilling}
                  variant="primary"
                  className="px-8 sm:w-auto"
                >
                  Submit & Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#06b6d4]/10">
                  <Edit3 className="h-7 w-7 text-[#06b6d4]" />
                </div>
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#111827]">
                  Review & Customize Details
                </h2>
                <p className="text-[#6b7280]">
                  We&apos;ve pre-filled your PRD based on your idea and answers.
                  Review and edit any section as needed.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="productName"
                      name="productName"
                      value={prdInput.productName}
                      onChange={handleChange}
                      className="flex h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm placeholder:text-[#d1d5db] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 focus:outline-none"
                      placeholder="e.g., Apollo - The AI Trip Planner"
                    />
                  </div>

                  <TextareaField
                    label="Problem Statement"
                    id="problemStatement"
                    name="problemStatement"
                    value={prdInput.problemStatement}
                    onChange={handleChange}
                    placeholder="What problem does your product solve?"
                    rows={6}
                  />
                </div>

                <div className="space-y-5">
                  <TextareaField
                    label="Target Audience"
                    id="targetAudience"
                    name="targetAudience"
                    value={prdInput.targetAudience}
                    onChange={handleChange}
                    placeholder="Who are your target users?"
                    rows={6}
                  />

                  {prdInput.productMode === 'Feature Enhancement' ? (
                    <>
                      <TextareaField
                        label="Current State (Before)"
                        id="currentState"
                        name="currentState"
                        value={prdInput.currentState}
                        onChange={handleChange}
                        placeholder="Describe the current implementation or feature set..."
                        rows={4}
                      />
                      <TextareaField
                        label="Proposed Changes (After)"
                        id="proposedChanges"
                        name="proposedChanges"
                        value={prdInput.proposedChanges}
                        onChange={handleChange}
                        placeholder="Describe the specific enhancements or changes..."
                        rows={4}
                      />
                    </>
                  ) : (
                    <TextareaField
                      label="Key Features"
                      id="keyFeatures"
                      name="keyFeatures"
                      value={prdInput.keyFeatures}
                      onChange={handleChange}
                      placeholder="What are the main features that differentiate your product?"
                      rows={6}
                      description="List the key differentiating features that make your product unique and valuable."
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <TextareaField
                    label="Success Metrics"
                    id="successMetrics"
                    name="successMetrics"
                    value={prdInput.successMetrics}
                    onChange={handleChange}
                    placeholder="How will you measure success?"
                    rows={4}
                    description="Define specific, measurable KPIs and targets to track product success (e.g., User retention > 40%, 10k MAU in 6 months)."
                  />
                </div>

                <div className="space-y-6">
                  <TextareaField
                    label="Timeline & Milestones"
                    id="timeline"
                    name="timeline"
                    value={prdInput.timeline}
                    onChange={handleChange}
                    placeholder="What is the expected timeline for this project?"
                    rows={4}
                    description="Outline key phases, milestones, or target launch dates."
                  />
                </div>

                <div className="space-y-6">
                  <TextareaField
                    label="Budget & Resources"
                    id="budget"
                    name="budget"
                    value={prdInput.budget}
                    onChange={handleChange}
                    placeholder="What is the budget or resource allocation?"
                    rows={4}
                    description="Specify team size, financial constraints, or required resources."
                  />
                </div>
              </div>
              {generateError && (
                <div className="rounded-lg bg-[#fef2f2] p-4 text-sm text-[#dc2626]">
                  <span className="font-medium">Error:</span> {generateError}
                </div>
              )}

              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                <Button
                  onClick={handleGeneratePRD}
                  disabled={!canGoToStep4 || isGenerating}
                  isLoading={isGenerating}
                  variant="primary"
                  className="px-8"
                >
                  Generate Final PRD <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                      Your PRD is Ready!
                    </h2>
                    <p className="text-sm text-gray-500">
                      Review, save, or download your document below.
                    </p>
                  </div>
                </div>
                {!isGenerating && (
                  <Button
                    onClick={handleFinish}
                    variant="outline"
                    size="sm"
                    className="w-full text-gray-600 sm:w-auto"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    New Idea
                  </Button>
                )}
              </div>

              {isGenerating ? (
                <div className="flex justify-center py-16">
                  <Loader />
                </div>
              ) : (
                <PRDDisplay
                  content={generatedPrd}
                  productName={prdInput.productName || 'PRD'}
                  prdInputs={prdInput}
                  model={selectedModel}
                  onFullPageView={handleFullPageView}
                />
              )}
            </div>
          )}{' '}
        </div>
      </div>
    </div>
  );
}
