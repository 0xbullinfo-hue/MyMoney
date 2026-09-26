'use client';

import { useState, useCallback, useEffect } from 'react';

interface MonoConnectOptions {
  onSuccess: (code: string) => void;
  onClose?: () => void;
  onLoad?: () => void;
}

export function useMonoConnect() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).Connect) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://connect.withmono.com/connect.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Keep script in document to avoid reloading
    };
  }, []);

  const openMonoConnect = useCallback(
    ({ onSuccess, onClose, onLoad }: MonoConnectOptions) => {
      const publicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;

      // If Mono Connect script is loaded and a real public key is present
      if (typeof window !== 'undefined' && (window as any).Connect && publicKey) {
        const monoConnect = new (window as any).Connect({
          key: publicKey,
          onSuccess: ({ code }: { code: string }) => {
            onSuccess(code);
          },
          onClose: () => {
            if (onClose) onClose();
          },
          onLoad: () => {
            if (onLoad) onLoad();
          },
        });

        monoConnect.setup();
        monoConnect.open();
        return;
      }

      // ── Development / Sandbox fallback simulation ──
      // When NEXT_PUBLIC_MONO_PUBLIC_KEY is not yet supplied, simulate the Mono authentication modal
      setIsLoading(true);
      const simulatedCode = `code_demo_${Date.now().toString(36)}`;
      
      // Simulate user selecting GTBank / Zenith / Kuda in the Mono Connect modal
      const confirmed = window.confirm(
        '🏦 [MyMoney Mono Connect Sandbox]\n\n' +
        'Connect your Nigerian Bank Account via Mono Open Banking?\n\n' +
        '• Supported: GTBank, Zenith, Access, Kuda, Stanbic IBTC, FirstBank\n' +
        '• Secure 256-bit encryption (CBN compliant)\n\n' +
        'Click OK to authorize account linking.'
      );

      setIsLoading(false);
      if (confirmed) {
        onSuccess(simulatedCode);
      } else if (onClose) {
        onClose();
      }
    },
    []
  );

  return {
    openMonoConnect,
    isLoaded,
    isLoading,
  };
}
