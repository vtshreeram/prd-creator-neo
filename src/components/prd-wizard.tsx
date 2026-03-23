'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Edit3,
  FileText,
  Camera,
  MessageSquare,
  RefreshCw
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
  // Use external state if provided (when loading from saved drafts), otherwise use internal state
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

    // Convert images to base64 for API transmission
    const imageData = await Promise.all(
      productIdeaImages.map(async (img) => ({
        id: img.id,
        name: img.name,
        type: img.type,
        size: img.size,
        data: img.preview // This is already base64 from the FileReader
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

    // Convert images to base64 for API transmission
    const imageData = await Promise.all(
      productIdeaImages.map(async (img) => ({
        id: img.id,
        name: img.name,
        type: img.type,
        size: img.size,
        data: img.preview // This is already base64 from the FileReader
      }))
    );

    // Combine idea with clarification context
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

    // Include images in the generation request
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

  const handleNext = () => {
    if (currentStep === 1 && canGoToStep2) {
      handleIdeaSubmit();
    } else if (currentStep === 2) {
      handleClarificationSubmit();
    } else if (currentStep === 3 && canGoToStep4) {
      handleGeneratePRD();
    } else if (currentStep === 4) {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
    }
  };

  const handleFullPageView = () => {
    if (onFullPageView) {
      onFullPageView();
    }
  };

  const handleFinish = () => {
    // Reset to step 1 to start a new idea
    setCurrentStep(1);
    setProductIdea('');
    setProductIdeaImages([]);
    setClarificationQuestions([]);
    setUserClarificationAnswers([]);
    if (externalPrdInput) {
      // If using external state, notify parent to reset
      onResetState?.();
    } else {
      setInternalPrdInput(DEFAULT_PRD_INPUT);
    }
    if (externalGeneratedPrd) {
      // If using external state, notify parent to reset
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
      // Reset to fresh state when going back to step 1 from a loaded draft
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
    <div className="mx-auto flex w-full max-w-6xl flex-col bg-white">
      {/* Progress Steps */}
      <div className="mb-8 p-4">
        <div className="relative">
          {/* Background Progress Line */}
          <div className="absolute top-8 right-0 left-0 h-2 border-2 border-black bg-gray-200">
            <div
              className="h-full border-r-2 border-black bg-[#FFEB3B] transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
              }}
            />
          </div>

          {/* Step Indicators */}
          <div className="relative flex items-center justify-between">
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
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`relative z-10 flex h-16 w-16 transform items-center justify-center border-4 transition-all duration-300 ${
                      isActive
                        ? 'border-black bg-[#FFEB3B] shadow-[4px_4px_0px_#000]'
                        : isCompleted
                          ? 'border-black bg-[#4CAF50] text-white shadow-[4px_4px_0px_#000]'
                          : isClickable
                            ? 'border-black bg-white hover:bg-gray-50 hover:shadow-[2px_2px_0px_#000]'
                            : 'cursor-not-allowed border-gray-300 bg-gray-100'
                    } `}
                  >
                    <span
                      className={`absolute -top-6 text-xs font-black ${isActive ? 'text-black' : isCompleted ? 'text-black' : 'text-gray-400'}`}
                    >
                      {String(step.id).padStart(2, '0')}
                    </span>
                    <Icon
                      className={`h-6 w-6 ${
                        isActive
                          ? 'text-black'
                          : isCompleted
                            ? 'text-white'
                            : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <div className="mt-6 text-center">
                    <p
                      className={`text-sm font-black tracking-wide uppercase ${
                        isActive
                          ? 'text-black'
                          : isCompleted
                            ? 'text-[#4CAF50]'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500 sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center border-2 border-black bg-[#FFEB3B] px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0px_#000]">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-black"></div>
            <span className="text-black">Model:</span>
            <span className="text-black">
              {modelDisplayName || selectedModel}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-40 mb-6 border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#000]">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm font-black tracking-wide uppercase">
            <span className="text-lg text-black">Step {currentStep}</span>
            <span className="text-gray-400">/ {steps.length}</span>
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !canGoToStep2) ||
              (currentStep === 3 && isGenerating)
            }
            isLoading={isClarifying || isPrefilling || isGenerating}
            className="flex items-center gap-2"
          >
            {currentStep === 4 ? 'Start New Idea' : 'Next'}
            {currentStep < 4 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px] border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000] sm:p-10">
        {currentStep === 1 && (
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-4 border-black bg-[#FFEB3B] shadow-[4px_4px_0px_#000]">
                <Sparkles className="h-8 w-8 text-black" />
              </div>
              <h2 className="mb-3 text-3xl font-black tracking-tight text-black uppercase">
                What&apos;s Your Product Idea?
              </h2>
              <p className="text-lg font-medium text-gray-700">
                Tell us about your product in a few sentences, and we&apos;ll
                help you build a comprehensive PRD.
              </p>
            </div>

            <div className="space-y-8 text-left">
              <div className="space-y-4">
                <label className="text-sm leading-none font-black tracking-wide text-black uppercase">
                  Product Mode
                </label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(
                    [
                      'SaaS Product',
                      'AI Product',
                      'Mobile App',
                      'Feature Enhancement'
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode}
                      onClick={() =>
                        setInternalPrdInput((prev) => ({
                          ...prev,
                          productMode: mode
                        }))
                      }
                      className={`flex flex-col items-center justify-center border-2 border-black p-4 text-center text-sm font-bold tracking-wide uppercase transition-all ${
                        prdInput.productMode === mode
                          ? 'bg-[#FFEB3B] text-black shadow-[4px_4px_0px_#000]'
                          : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-gray-50'
                      }`}
                    >
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm font-medium text-gray-600">
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

              <div className="border-4 border-black bg-[#F5F5F5] p-6 shadow-[4px_4px_0px_#000]">
                <h3 className="mb-2 flex items-center gap-2 font-black tracking-wide text-black uppercase">
                  <Camera className="h-5 w-5" />
                  Add Visual Context{' '}
                  <span className="text-sm font-normal text-gray-600">
                    (Optional)
                  </span>
                </h3>
                <p className="mb-6 text-sm font-medium text-gray-600">
                  Attach mockups, diagrams, wireframes, or reference photos to
                  help the AI better understand your product idea.
                </p>
                <ImageAttachmentComponent
                  images={productIdeaImages}
                  onImagesChange={setProductIdeaImages}
                  maxImages={5}
                  maxFileSize={10 * 1024 * 1024} // 10MB
                />
              </div>
            </div>

            {prefillError && (
              <div className="border-2 border-[#F44336] bg-[#FFEBEE] p-4 text-sm font-bold text-[#D32F2F]">
                <span className="font-black">Error:</span> {prefillError}
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-4 border-black bg-[#E91E63] shadow-[4px_4px_0px_#000]">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-3 text-3xl font-black tracking-wide text-black uppercase">
                Let&apos;s Clarify a Few Things
              </h2>
              <p className="text-lg font-medium text-gray-700">
                Based on your idea, our AI strategist has identified a few areas
                to dive deeper into.
              </p>
            </div>

            <div className="space-y-6 text-left">
              {clarificationQuestions.map((question, index) => (
                <div
                  key={index}
                  className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]"
                >
                  <label className="mb-4 block font-black tracking-wide text-black uppercase">
                    {question}
                  </label>
                  <textarea
                    value={userClarificationAnswers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="flex min-h-[80px] w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium placeholder:text-gray-500 focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63] focus:ring-offset-2 focus:outline-none"
                    placeholder="Your answer (optional)..."
                    rows={3}
                  />
                </div>
              ))}

              <div className="flex flex-col items-center gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => handleNext()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Skip and Use Current Details
                </Button>
                <p className="text-sm font-medium text-gray-600">
                  Answering these will significantly improve the quality and
                  specificity of your PRD.
                </p>
              </div>
            </div>

            {prefillError && (
              <div className="border-2 border-[#F44336] bg-[#FFEBEE] p-4 text-sm font-bold text-[#D32F2F]">
                <span className="font-black">Error:</span> {prefillError}
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-4 border-black bg-[#2196F3] shadow-[4px_4px_0px_#000]">
                <Edit3 className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-3 text-3xl font-black tracking-wide text-black uppercase">
                Review & Customize Details
              </h2>
              <p className="text-lg font-medium text-gray-700">
                We&apos;ve pre-filled your PRD based on your idea and answers.
                Review and edit any section as needed.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm leading-none font-black tracking-wide text-black uppercase">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={prdInput.productName}
                    onChange={handleChange}
                    className="flex h-12 w-full border-2 border-black bg-white px-4 py-2 text-sm font-medium placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-2 focus:ring-[#2196F3] focus:ring-offset-2 focus:outline-none"
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

              <div className="space-y-6">
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
            </div>

            {generateError && (
              <div className="border-2 border-[#F44336] bg-[#FFEBEE] p-4 text-sm font-bold text-[#D32F2F]">
                <span className="font-black">Error:</span> {generateError}
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-4 border-black bg-[#4CAF50] shadow-[4px_4px_0px_#000]">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-3 text-3xl font-black tracking-wide text-black uppercase">
                Your PRD is Ready!
              </h2>
              <p className="text-lg font-medium text-gray-700">
                Here&apos;s your generated Product Requirements Document. You
                can download it, copy it, or view in full page mode.
              </p>
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
        )}
      </div>
    </div>
  );
}
