'use client'
import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar'; 
import SidebarSuperAdmin from '@/components/common/SidebarSuperAdmin';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUserRole(userData.role);
        }
    }, []);

    return (
        <div className="flex">
            {userRole === 'superadmin' ? <SidebarSuperAdmin /> : <Sidebar />}
            
            <main className="flex-1 lg:ml-64">
                {children}
            </main>
        </div>
    );
}