import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type AlertType = '1min' | '5min' | 'timeout' | 'default' | 'break-start' | 'break-end' | 'memo' | 'praise-1' | 'praise-2' | 'start';

interface NotificationContextType {
    isAlertPlaying: boolean;
    isReady: boolean;
    unlockAudio: () => Promise<void>;
    playAlert: (type?: AlertType) => void;
    stopAlert: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [isAlertPlaying, setIsAlertPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const timeoutRef = useRef<number | null>(null);

    // Initialize AudioContext and load sounds
    useEffect(() => {
        const initAudio = async () => {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContextClass();

                const sounds: Record<string, string> = {
                    'default': '/sounds/alert.mp3',
                    '1min': '/sounds/1min.mp3',
                    '5min': '/sounds/5min.mp3',
                    'timeout': '/sounds/timeout.mp3',
                    'break-start': '/sounds/break_start.mp3',
                    'break-end': '/sounds/break_end.mp3',
                    'memo': '/sounds/memo_save.mp3',
                    'praise-1': '/sounds/praise_1.mp3',
                    'praise-2': '/sounds/praise_2.mp3',
                    'start': '/sounds/start.mp3',
                };

                const loadPromises = Object.entries(sounds).map(async ([key, path]) => {
                    try {
                        const response = await fetch(path);
                        if (!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
                        const arrayBuffer = await response.arrayBuffer();
                        const decodedBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
                        audioBuffersRef.current[key] = decodedBuffer;
                        console.log(`Zundamon: ${key}.mp3 is ready!`);
                    } catch (e) {
                        console.warn(`Could not load sound: ${key} from ${path}`, e);
                    }
                });

                await Promise.all(loadPromises);
                setIsReady(true);
                console.log('Audio system initialized and all sounds loaded');
            } catch (error) {
                console.error('Failed to initialize audio:', error);
            }
        };

        const handleEx = () => {
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
        }
        window.addEventListener('click', handleEx, { once: true });
        window.addEventListener('touchstart', handleEx, { once: true });

        initAudio();

        return () => {
            window.removeEventListener('click', handleEx);
            window.removeEventListener('touchstart', handleEx);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const unlockAudio = async () => {
        if (!audioContextRef.current) return;

        try {
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
                console.log('AudioContext resumed (unlocked)');
            }

            // Robust Silent Unlock: Play ALL sounds at tiny volume to whitelist them
            const gainNode = audioContextRef.current.createGain();
            gainNode.gain.value = 0.001; // Inaudible
            gainNode.connect(audioContextRef.current.destination);

            const buffers = audioBuffersRef.current;
            const bufferKeys = Object.keys(buffers);

            if (bufferKeys.length === 0) {
                console.warn("Silent Unlock: No buffers loaded yet!");
                return;
            }

            const warmupPromises = bufferKeys.map(key => {
                return new Promise<void>((resolve) => {
                    const buffer = buffers[key];
                    if (!buffer) {
                        resolve();
                        return;
                    }
                    try {
                        const source = audioContextRef.current!.createBufferSource();
                        source.buffer = buffer;
                        source.connect(gainNode);
                        source.start(0);
                        source.stop(audioContextRef.current!.currentTime + 0.1); // Short duration
                        source.onended = () => resolve();
                    } catch (e) {
                        console.error(`Silent Unlock failed for ${key}:`, e);
                        resolve(); // Resolve anyway to not block
                    }
                });
            });

            await Promise.all(warmupPromises);
            console.log(`Silent Unlock: All ${bufferKeys.length} sounds warmed up and whitelisted.`);

        } catch (error) {
            console.error('Failed to unlock/warmup AudioContext:', error);
        }
    };

    const playAlert = async (type: AlertType = 'default') => {
        if (!audioContextRef.current) return;

        if (audioContextRef.current.state === 'suspended') {
            console.log('AudioContext is suspended, attempting to resume...');
            await unlockAudio();
        }

        if (sourceNodeRef.current) {
            stopAlert();
        }

        const buffer = audioBuffersRef.current[type] || audioBuffersRef.current['default'];
        if (!buffer) {
            console.warn(`No buffer found for type: ${type}`);
            return;
        }

        try {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.loop = type === 'timeout';
            source.connect(audioContextRef.current.destination);
            source.start();

            if (sourceNodeRef.current) {
                try {
                    sourceNodeRef.current.stop();
                    sourceNodeRef.current.disconnect();
                } catch (e) { /* ignore */ }
                sourceNodeRef.current = null;
            }

            sourceNodeRef.current = source;
            setIsAlertPlaying(true);

            if (!source.loop) {
                source.onended = () => {
                    setIsAlertPlaying(false);
                    sourceNodeRef.current = null;
                };
            }

            console.log(`Alert started: ${type}`);
        } catch (error) {
            console.error('Failed to play alert:', error);
            if (type === 'start') {
                alert(`Start Sound Failed: ${error}`);
            }
        }
    };

    const stopAlert = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.stop();
                sourceNodeRef.current.disconnect();
            } catch (error) {
                console.error('Error stopping alert:', error);
            }
            sourceNodeRef.current = null;
        }

        setIsAlertPlaying(false);
        console.log('Alert fully stopped and reset');
    };

    return (
        <NotificationContext.Provider value={{ isAlertPlaying, isReady, unlockAudio, playAlert, stopAlert }}>
            {children}
        </NotificationContext.Provider>
    );
};
