import Sidebar from '@/components/common/Sidebar'; 
import React from 'react';

export default function DashboardLayout({
    children, 
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col lg:flex-row h-screen  bg-[#E6EBF0] relative"> 
            <Sidebar /> 
            <main className="flex-1 px-4  lg:ml-60 overflow-x-auto"> 
                {children}
            </main>
        </div>
    );
}