import React, { useEffect, useState } from 'react';

export const InstallHint: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSHint, setShowIOSHint] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);
        if (isStandaloneMode) return;

        // Android / Desktop Chrome
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // iOS Detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
            setShowIOSHint(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                setDeferredPrompt(null);
            });
        }
    };

    if (isStandalone) return null;

    if (deferredPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 bg-lime-700 text-white p-4 rounded-[1.5rem] shadow-xl flex justify-between items-center z-50 animate-fade-in border-4 border-lime-300">
                <div className="flex-1 mr-4">
                    <p className="font-black text-sm">Install FocusFlow 🌱</p>
                    <p className="text-xs text-lime-100 font-bold">Add to home screen!</p>
                </div>
                <button
                    onClick={handleInstallClick}
                    className="bg-white text-lime-700 px-4 py-2 rounded-full text-sm font-black hover:bg-lime-100 transition shadow-md"
                >
                    INSTALL
                </button>
            </div>
        );
    }

    if (showIOSHint) {
        // Show hint only once per session or handle state more persistently if needed.
        // For now, always show if not standalone to force awareness.
        return (
            <div className="fixed bottom-4 left-4 right-4 bg-lime-800/90 backdrop-blur-md text-white p-4 rounded-[1.5rem] shadow-xl z-50 animate-fade-in border-4 border-lime-400 text-sm font-bold">
                <p className="mb-2 font-black flex items-center gap-2">
                    <span className="text-xl">📲</span> Install App
                </p>
                <p className="text-lime-100">
                    Tap <span className="inline-block px-2 bg-lime-600 rounded-lg mx-1 shadow-sm">Share</span> then <span className="font-black text-white">"Add to Home Screen"</span>
                </p>
                <button
                    onClick={() => setShowIOSHint(false)}
                    className="absolute top-2 right-2 text-lime-400 hover:text-white p-1"
                >
                    ✕
                </button>
            </div>
        );
    }

    return null;
};
