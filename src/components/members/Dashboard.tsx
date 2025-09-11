'use client';

// PERBAIKAN: Hapus 'useRef' dan 'ChangeEvent' dari import React
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchMembersList, deleteMember, ApiMember } from "@/lib/members";
import search from "@/assets/news/search.png";
import icDelete from "@/assets/news/delete.png";
import icEdit from "@/assets/news/edit.png";
import deleteIcon from "@/assets/news/delete-pop.png"; 

// PERBAIKAN: Hapus konstanta API_BASE_URL yang tidak terpakai
// const API_BASE_URL = 'https://api.has-law.com';

const CustomNotification = ({ message, type, onClose }: { 
    message: string; 
    type: 'success' | 'error'; 
    onClose: () => void; 
}) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg flex items-center transition-transform transform animate-slide-in";
    const typeClasses = type === 'success' 
        ? "bg-green-100 border border-green-400 text-green-800" 
        : "bg-red-100 border border-red-400 text-red-800";

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <span className="font_britanica_bold mr-3">{type === 'success' ? 'Berhasil!' : 'Error!'}</span>
            <span className="font_britanica_regular">{message}</span>
            <button 
                onClick={onClose} 
                className="ml-auto pl-3 text-xl font-bold hover:opacity-70"
            >
                &times;
            </button>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, memberName }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    isDeleting: boolean;
    memberName?: string;
}) => {
    return (
        <div 
            className={`fixed inset-0 bg-opacity-25 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out ${
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div 
                className={`bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            >
                <Image src={deleteIcon} alt="Delete Icon" width={64} height={64} className="mx-auto mb-6" />
                <h2 className="text-2xl font_britanica_bold text-black mb-2">Delete This Member?</h2>
                <p className="text-gray-600 mb-2 font_britanica_regular">
                    {memberName && <span className="font-semibold">&quot;{memberName}&quot;</span>}
                </p>
                <p className="text-gray-600 mb-8 font_britanica_regular">
                    This member will be permanently deleted and cannot be recovered.
                </p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onClose} 
                        disabled={isDeleting} 
                        className="px-8 py-3 w-36 rounded-full border border-[#A0001B] text-[#A0001B] font_britanica_bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isDeleting} 
                        className="px-8 py-3 w-36 rounded-full bg-[#A0001B] text-white font_britanica_bold hover:bg-[#800016] transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton = () => {
    return (
        <div className="space-y-1">
            {[...Array(5)].map((_, index) => (
                <div key={index} className="flex animate-pulse">
                    <div className="px-6 py-4 bg-gray-200 rounded-l-xl flex-shrink-0 w-20 h-14"></div>
                    <div className="px-6 py-4 bg-gray-200 flex-1 min-w-[150px] h-14"></div>
                    <div className="px-6 py-4 bg-gray-200 flex-1 min-w-[300px] h-14"></div>
                    <div className="px-6 py-4 bg-gray-200 flex-1 min-w-[200px] h-14"></div>
                    <div className="px-6 py-4 bg-gray-200 rounded-r-xl flex-shrink-0 w-32 h-14"></div>
                </div>
            ))}
        </div>
    );
};

const MembersDashboard = () => {
    const router = useRouter();
    
    const [membersData, setMembersData] = useState<ApiMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notification, setNotification] = useState<{ 
        show: boolean; 
        message: string; 
        type: 'success' | 'error' 
    }>({ show: false, message: '', type: 'success' });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    useEffect(() => {
        const loadMembers = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchMembersList();
                setMembersData(data);
            } catch (err) {
                console.error('Error loading members:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load members';
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadMembers();
    }, []);

    const openDeleteModal = (id: number, name: string) => {
        setMemberToDelete({ id, name });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!memberToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteMember(memberToDelete.id);
            setMembersData(current => current.filter(member => member.id !== memberToDelete.id));
            showNotification('Member berhasil dihapus!', 'success');
        } catch (err) {
            console.error('Delete error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus member';
            showNotification(errorMessage, 'error');
        } finally {
            setIsModalOpen(false);
            setMemberToDelete(null);
            setIsDeleting(false);
        }
    };
    
    const handleEdit = (id: number) => {
        router.push(`/members/edit/${id}`);
    };

    const filteredMembers = membersData.filter(member => 
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.title_position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="p-4 flex items-center justify-center">
                <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] min-h-screen">
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center justify-between w-full mb-8 gap-4">
                            <h1 className="font_britanica_bold text-[clamp(4vw,4vw,4vw)] md:text-3xl text-black text-nowrap">Members</h1>
                            <div className="flex flex-row items-center gap-4">
                                <div className="relative lg:block hidden">
                                    <div className="border border-gray-300 rounded-full px-4 py-2 pr-10 w-64 h-10 bg-gray-100 animate-pulse"></div>
                                </div>
                                <div className="bg-gray-300 rounded-lg px-4 py-2 w-36 h-10 animate-pulse"></div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-full text-left text-sm whitespace-nowrap mb-6">
                                <div className="font_britanica_bold text-black text-xl">
                                    <div className="flex">
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-l-xl flex-shrink-0 w-20">No</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[300px]">Full Name</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[200px]">Position</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-r-xl flex-shrink-0 w-32">Action</div>
                                    </div>
                                </div>
                            </div>

                            <LoadingSkeleton />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 flex items-center justify-center">
                <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] min-h-screen flex flex-col items-center justify-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <div className="text-xl font_britanica_bold text-red-600 mb-4">Error Loading Members</div>
                    <div className="text-gray-600 mb-6 text-center">{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-[#A0001B] text-white px-6 py-2 rounded-lg font_britanica_bold hover:bg-[#800016] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 flex items-center justify-center">
            {notification.show && (
                <CustomNotification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification({ ...notification, show: false })} 
                />
            )}

            <DeleteConfirmationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={confirmDelete} 
                isDeleting={isDeleting}
                memberName={memberToDelete?.name}
            />

            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] min-h-screen overflow-y-auto">
                <div className="flex flex-col">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full mb-8 gap-4">
                        <h1 className="font_britanica_bold text-[clamp(4vw,4vw,4vw)] md:text-3xl text-black">
                            Lawyers 
                        </h1>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <input 
                                    type="text" 
                                    placeholder="Search lawyers..." 
                                    className="border border-[#A0001B] rounded-full px-4 py-2 pr-10 outline-none w-full sm:w-64 font_britanica_regular"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Image 
                                    src={search} 
                                    alt="search icon" 
                                    className="absolute w-5 h-5 right-4 top-1/2 -translate-y-1/2" 
                                />
                            </div>
                            
                            <Link href="/members/add" passHref>
                                <button className="bg-[#A0001B] rounded-lg px-4 py-2 text-white font_britanica_bold hover:bg-[#4F000D] flex items-center justify-center gap-2 whitespace-nowrap transition-colors w-full sm:w-auto">
                                    <span>+</span>
                                    <span>Add Lawyers</span>
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-full text-left text-sm whitespace-nowrap mb-6">
                            <div className="font_britanica_bold text-black text-xl">
                                <div className="flex">
                                    <div className="px-6 py-4 bg-[#F5F5F5] rounded-l-xl flex-shrink-0 w-20">No</div>
                                    <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[300px]">Full Name</div>
                                    <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[200px]">Position</div>
                                    <div className="px-6 py-4 bg-[#F5F5F5] rounded-r-xl flex-shrink-0 w-32">Action</div>
                                </div>
                            </div>
                        </div>

                        <div className="font_britanica_bold space-y-1">
                            {filteredMembers.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">👥</div>
                                        <div className="text-xl font_britanica_bold text-gray-600 mb-2">No Members Found</div>
                                        <div className="text-gray-500 font_britanica_regular">
                                            {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first member'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                filteredMembers.map((member, index) => (
                                    <div key={member.id} className="flex font_britanica_bold items-center">
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-l-xl flex-shrink-0 w-20">
                                            {index + 1}.
                                        </div>
                                        
                                        
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[300px]">
                                            <div className="truncate pr-2" title={member.full_name}>
                                                {member.full_name || 'N/A'}
                                            </div>
                                        </div>
                                        
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[200px]">
                                            <div className="truncate pr-2" title={member.title_position}>
                                                {member.title_position || 'N/A'}
                                            </div>
                                        </div>
                                        
                                        <div className="px-6 py-3 bg-[#F5F5F5] rounded-r-xl flex-shrink-0 w-32">
                                            <div className="flex items-center gap-4 justify-center">
                                                <button 
                                                    onClick={() => handleEdit(member.id)} 
                                                    className="hover:opacity-75 cursor-pointer transition-opacity"
                                                    title="Edit member"
                                                >
                                                    <Image src={icEdit} alt="Edit" className="w-[28px]" />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(member.id, member.full_name)} 
                                                    className="hover:opacity-75 cursor-pointer transition-opacity"
                                                    title="Delete member"
                                                >
                                                    <Image src={icDelete} alt="Delete" className="w-[28px] pb-1" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembersDashboard;