'use client';

import { useState } from 'react';
import Image from 'next/image';
import icon from "@/assets/logout/icon.png"; 

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

const Logout: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        await onConfirm();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8 text-center flex flex-col items-center">
                <Image src={icon} alt="Log Out Icon" width={80} height={80} className="mb-6" />
                
                <h2 className="text-3xl font_britanica_bold text-black mb-3">Log Out?</h2>
                
                <p className="text-gray-600 mb-8">
                    You will be logged out of your admin account. Are you sure you want to continue?
                </p>

                <div className="flex justify-center items-center gap-4 w-full">
                    <button 
                        onClick={onClose} 
                        disabled={isLoading}
                        className="flex-1 py-3 px-6 border border-[#A0001B] text-[#A0001B] cursor-pointer rounded-3xl font_britanica_black hover:bg-red-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={isLoading}
                        className="flex-1 py-3 px-6 bg-[#A0001B] text-white rounded-3xl cursor-pointerfont_britanica_black hover:bg-[#780014] transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? 'Logging Out...' : 'Log Out'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Logout;