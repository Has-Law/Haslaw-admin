'use client';

import { useState } from 'react';
import Internship from './internship'; 
import Lawyers from './lawyers';     
import Staff from './staff';         

const CareerDashboard = () => {
    const [activeTab, setActiveTab] = useState('internship');

    const renderTabButton = (tabName: string, label: string) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 py-3 px-4 text-center font_britanica_bold text-xl transition-colors duration-200 ${
                activeTab === tabName
                    ? 'bg-white text-black ' 
                    : 'bg-[#780014] text-white ' 
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="  rounded-2xl bg-white shadow-lg lg:w-[80vw] min-h-screen">
            <div className="flex flex-row justify-between rounded-t-2xl overflow-x-auto">
                {renderTabButton('internship', 'Internship')}
                {renderTabButton('lawyers', 'Lawyers')}
                {renderTabButton('staff', 'Staff')}
            </div>

            <div className="">
                {activeTab === 'internship' && <Internship />}
                {activeTab === 'lawyers' && <Lawyers />}
                {activeTab === 'staff' && <Staff />}
            </div>
        </div>
    );
};

export default CareerDashboard;