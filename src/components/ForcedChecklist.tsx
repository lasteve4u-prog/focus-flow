import React, { useState } from 'react';

interface ForcedChecklistProps {
    onComplete: () => void;
}

export const ForcedChecklist: React.FC<ForcedChecklistProps> = ({ onComplete }) => {
    const [step1Done, setStep1Done] = useState(false);

    return (
        <div className="flex items-center justify-center flex-1 w-full p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-lime-200">
                <div className="bg-lime-500 p-8 text-center border-b-4 border-lime-600">
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase items-center justify-center flex gap-3">
                        🛑 CHECK!
                    </h2>
                    <p className="text-lime-100 font-bold mt-2">Before you go back...</p>
                </div>

                <div className="p-8 space-y-6">
                    {/* Step 1 */}
                    <div className={`transition-all duration-300 p-6 rounded-[1.5rem] border-4 ${step1Done ? 'bg-lime-50 border-lime-500 opacity-50' : 'bg-white border-lime-100 shadow-lg scale-105'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-black text-lime-600 bg-lime-100 px-3 py-1 rounded-full">STEP 1</span>
                            {step1Done && <span className="text-2xl">✅</span>}
                        </div>
                        <h3 className="text-xl font-black text-green-900 mb-4">Go Refresh! 🚽</h3>
                        <p className="text-green-700 text-sm font-bold mb-6">Toilet, Face wash, or Stretch.</p>
                        <button
                            onClick={() => setStep1Done(true)}
                            disabled={step1Done}
                            className={`w-full py-4 rounded-full font-black text-lg transition-all ${step1Done
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-lime-500 text-white hover:bg-lime-600 shadow-[0_4px_0_rgb(65,130,20)] active:shadow-none active:translate-y-[4px]'
                                }`}
                        >
                            {step1Done ? 'DONE' : 'GO REFRESH!'}
                        </button>
                    </div>

                    {/* Step 2 */}
                    <div className={`transition-all duration-300 p-6 rounded-[1.5rem] border-4 ${!step1Done ? 'opacity-30 blur-[1px]' : 'bg-white border-lime-100 shadow-lg scale-105'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-black text-lime-600 bg-lime-100 px-3 py-1 rounded-full">STEP 2</span>
                        </div>
                        <h3 className="text-xl font-black text-green-900 mb-4">Write Log 📓</h3>
                        <p className="text-green-700 text-sm font-bold mb-6">Write down what you did in your notebook.</p>
                        <button
                            onClick={onComplete}
                            disabled={!step1Done}
                            className={`w-full py-4 rounded-full font-black text-lg transition-all ${!step1Done
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-[0_4px_0_rgb(20,80,20)] active:shadow-none active:translate-y-[4px]'
                                }`}
                        >
                            FINISH & HOME
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
