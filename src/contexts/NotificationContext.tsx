import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type AlertType = '1min' | '5min' | 'timeout' | 'default' | 'break-start' | 'break-end' | 'memo' | 'praise-1' | 'praise-2';

interface NotificationContextType {
    isAlertPlaying: boolean;
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
                };

                for (const [key, path] of Object.entries(sounds)) {
                    try {
                        const response = await fetch(path);
                        if (!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
                        const arrayBuffer = await response.arrayBuffer();
                        const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                        audioBuffersRef.current[key] = decodedBuffer;
                        console.log(`Loaded sound: ${key}`);
                    } catch (e) {
                        console.warn(`Could not load sound: ${key} from ${path}`, e);
                    }
                }

                console.log('Audio system initialized and sounds loaded', Object.keys(audioBuffersRef.current));
            } catch (error) {
                console.error('Failed to initialize audio:', error);
            }
        };

        const handleEx = () => {
            // ensure audio context is resumed on any user interaction in the cleanup or elsewhere if needed
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
        }
        window.addEventListener('click', handleEx, { once: true });
        initAudio();

        return () => {
            window.removeEventListener('click', handleEx);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const unlockAudio = async () => {
        if (audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                try {
                    await audioContextRef.current.resume();
                    console.log('AudioContext resumed (unlocked)');
                } catch (error) {
                    console.error('Failed to resume AudioContext:', error);
                }
            } else {
                console.log('AudioContext is already running:', audioContextRef.current.state);
            }
        }
    };

    const playAlert = async (type: AlertType = 'default') => {
        if (!audioContextRef.current) return;

        // Ensure audio is unlocked/resumed before playing
        // Chrome requires user interaction to resume from 'suspended'
        if (audioContextRef.current.state === 'suspended') {
            console.log('AudioContext is suspended, attempting to resume...');
            await unlockAudio();
        }

        // Stop any currently playing sound
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

            // Only loop if it's the timeout sound
            source.loop = type === 'timeout';

            source.connect(audioContextRef.current.destination);
            source.start();

            sourceNodeRef.current = source;
            setIsAlertPlaying(true);

            // If not looping, automatically reset state when done
            if (!source.loop) {
                source.onended = () => {
                    setIsAlertPlaying(false);
                    sourceNodeRef.current = null;
                };
            }

            console.log(`Alert started: ${type}`);
        } catch (error) {
            console.error('Failed to play alert:', error);
        }
    };

    const stopAlert = () => {
        // Clear any pending timeout loop
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Stop current audio source
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
        <NotificationContext.Provider value={{ isAlertPlaying, unlockAudio, playAlert, stopAlert }}>
            {children}
        </NotificationContext.Provider>
    );
};
