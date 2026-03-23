'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa_install_dismissed', new Date().toISOString());
  };

  useEffect(() => {
    // Check if user dismissed recently (within 7 days)
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowInstallButton(false);
      }
    }
  }, []);

  if (isInstalled || !showInstallButton) return null;

  return (
    <div className="animate-slide-up fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:max-w-md">
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#6366f1]/10">
            <Smartphone className="h-6 w-6 text-[#6366f1]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-sm font-semibold text-[#111827]">
              Install AI PRD Creator
            </h3>
            <p className="mb-3 text-xs text-[#6b7280]">
              Install this app on your device for quick access and offline
              support
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="rounded-lg bg-[#6366f1] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#4f46e5]"
              >
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg bg-[#f3f4f6] px-4 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#e5e7eb]"
              >
                Maybe Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-lg p-1 text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#6b7280]"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
