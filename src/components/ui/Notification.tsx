'use client';

import { useEffect } from 'react';

interface CustomNotificationProps {
    message: string; 
    type: 'success' | 'error'; 
    onClose: () => void; 
}

const CustomNotification: React.FC<CustomNotificationProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg flex items-center transition-transform transform slide-in";
    const typeClasses = type === 'success' 
        ? "bg-green-100 border border-green-400 text-green-800" 
        : "bg-red-100 border border-red-400 text-red-800";

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <span className="font_britanica_bold mr-3">{type === 'success' ? 'Berhasil!' : 'Error!'}</span>
            <span className="font-medium">{message}</span>
            <button 
                onClick={onClose} 
                className="ml-auto pl-3 text-xl font-bold hover:opacity-70"
            >
                &times;
            </button>
        </div>
    );
};

export default CustomNotification;