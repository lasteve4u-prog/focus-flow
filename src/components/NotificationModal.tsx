import React, { useEffect } from 'react';
import { useNotification, type AlertType } from '../contexts/NotificationContext';

interface NotificationModalProps {
    message?: string;
    isOpen: boolean;
    onClose: () => void;
    alertType?: AlertType;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
    message = "時間切れなのだ！進捗を確認するのだ。",
    isOpen,
    onClose,
    alertType = 'default'
}) => {
    const { playAlert, stopAlert } = useNotification();

    useEffect(() => {
        if (isOpen) {
            playAlert(alertType);
        } else {
            stopAlert();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, alertType]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lime-900/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border-4 border-lime-400 transform scale-100 transition-all font-sans">
                <div className="text-center">
                    <div className="mb-6 text-6xl animate-bounce">
                        🔔
                    </div>
                    <h3 className="text-2xl font-black text-green-800 mb-4">お知らせなのだ</h3>
                    <p className="text-green-700 text-lg font-bold mb-8 leading-relaxed">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-lime-500 hover:bg-lime-600 text-white rounded-full font-black text-xl shadow-[0_4px_0_rgb(65,130,20)] active:shadow-none active:translate-y-[4px] transition-all"
                    >
                        OKなのだ！
                    </button>
                </div>
            </div>
        </div>
    );
};
