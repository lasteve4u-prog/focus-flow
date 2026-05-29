import React from 'react';
import { MAX_ZUNDA_POWER } from '../constants/zundaPower';

interface ZundaPowerDisplayProps {
    power: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const sizeClasses = {
    sm: { bean: 'text-lg', label: 'text-xs', gap: 'gap-0.5' },
    md: { bean: 'text-2xl', label: 'text-sm', gap: 'gap-1' },
    lg: { bean: 'text-3xl', label: 'text-base', gap: 'gap-1.5' },
};

export const ZundaPowerDisplay: React.FC<ZundaPowerDisplayProps> = ({
    power,
    max = MAX_ZUNDA_POWER,
    size = 'md',
    showLabel = true,
}) => {
    const classes = sizeClasses[size];
    const clampedPower = Math.max(0, Math.min(power, max));

    return (
        <div
            className="flex flex-col items-center"
            title={`ずんだパワー ${clampedPower}/${max}`}
            aria-label={`ずんだパワー ${clampedPower}残り${max}中`}
        >
            {showLabel && (
                <span className={`font-black text-lime-700 ${classes.label} mb-1 tracking-wide`}>
                    ずんだパワー
                </span>
            )}
            <div className={`flex items-center ${classes.gap}`}>
                {Array.from({ length: max }, (_, i) => (
                    <span
                        key={i}
                        className={`${classes.bean} select-none transition-all duration-300 ${
                            i < clampedPower ? 'opacity-100 scale-100' : 'opacity-25 grayscale scale-90'
                        }`}
                        aria-hidden
                    >
                        🫛
                    </span>
                ))}
            </div>
        </div>
    );
};
