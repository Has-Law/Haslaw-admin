'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/lib/auth"; // Impor fungsi logout
import LogoutModal from "@/components/auth/Logout"; // Impor komponen modal

import logo from "@/assets/logo.png";
import member from "@/assets/sidebar/member.png";
import memberBlack from "@/assets/sidebar/member-black.png";
import career from "@/assets/sidebar/career.png";
import careerBlack from "@/assets/sidebar/career-black.png";
import news from "@/assets/sidebar/news.png";
import newsBlack from "@/assets/sidebar/news-black.png";
import logoutIcon from "@/assets/sidebar/out-black.png"; // Nama variabel diubah agar tidak bentrok

const Sidebar = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const navLinks = [
        { name: "News & Insight", href: "/news", activeIcon: news, inactiveIcon: newsBlack },
        { name: "Lawyers", href: "/members", activeIcon: member, inactiveIcon: memberBlack },
        { name: "Careers Form", href: "/careers", activeIcon: career, inactiveIcon: careerBlack },
    ];

    const handleConfirmLogout = async () => {
        await logoutUser();
    };

    const navigationContent = (
         <nav className="flex flex-col gap-y-4">
            {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`relative flex items-center gap-x-4 p-3 font_britanica_bold rounded-lg transition-colors duration-200 cursor-pointer ${
                            isActive
                                ? 'bg-[#A0001B] text-white'
                                : 'text-[#4F000D] hover:bg-gray-100'
                        }`}
                    >
                        {isActive && (
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-10 bg-[#A0001B] rounded-tr-lg rounded-br-lg"></div>
                        )}
                        <Image src={isActive ? link.activeIcon : link.inactiveIcon} alt={`${link.name} icon`} width={24} height={24} />
                        <span className="font_britanica_bold">{link.name}</span>
                    </Link>
                );
            })}
        </nav>
    );

    const renderLogoutButton = () => (
        <button 
            onClick={() => setIsLogoutModalOpen(true)} 
            className="flex items-center gap-x-4 p-3 rounded-lg text-gray-600 hover:bg-gray-100 w-full transition-colors duration-200"
        >
            <Image src={logoutIcon} alt="Log Out" width={24} height={24} />
            <span className="font_britanica_bold text-[#4F000D] cursor-pointer">Log Out</span>
        </button>
    );

    return (
        <>
            <aside className="hidden fixed top-0 left-0 h-screen lg:flex w-64 p-6 flex-col ">
                <div className="mb-12">
                    <Image src={logo} alt="HAS Attorneys at Law Logo" priority />
                </div>
                {navigationContent}
                <div className="mt-auto">
                    {renderLogoutButton()}
                </div>
            </aside>

            <header className="lg:hidden bg-[#E6EBF0] p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="w-32">
                    <Image src={logo} alt="HAS Attorneys at Law Logo" />
                </div>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-10 h-10 relative focus:outline-none cursor-pointer"
                >
                    <div className="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span aria-hidden="true" className={`block absolute h-0.5 w-5 bg-current text-[#4F000D] transform transition duration-500 ease-in-out ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
                        <span aria-hidden="true" className={`block absolute h-0.5 w-5 bg-current text-[#4F000D] transform transition duration-500 ease-in-out ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span aria-hidden="true" className={`block absolute h-0.5 w-5 bg-current text-[#4F000D] transform transition duration-500 ease-in-out ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
                    </div>
                </button>
            </header>
            
            <div
                onClick={() => setIsMenuOpen(false)}
                className={`lg:hidden fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 p-6 flex flex-col shadow-xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center mb-12">
                    <div className="w-32">
                        <Image src={logo} alt="HAS Attorneys at Law Logo" />
                    </div>
                </div>
                {navigationContent}
                <div className="mt-auto">
                   {renderLogoutButton()}
                </div>
            </div>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
            />
        </>
    );
};

export default Sidebar;