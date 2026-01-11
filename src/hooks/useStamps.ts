import { useLocalStorage } from './useLocalStorage';

export const useStamps = () => {
    const [stamps, setStamps] = useLocalStorage<Record<string, boolean>>('focus-flow-stamps', {});

    const addStamp = (date: string) => {
        if (!stamps[date]) {
            setStamps(prev => ({ ...prev, [date]: true }));
            return true; // Added newly
        }
        return false; // Already existed
    };

    const getStamp = (date: string) => !!stamps[date];

    return { stamps, addStamp, getStamp };
};
