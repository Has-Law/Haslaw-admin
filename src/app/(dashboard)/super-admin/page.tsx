'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Admin, fetchAdmins, createAdmin, updateAdmin, deleteAdmin, CreateAdminData, UpdateAdminData } from '@/lib/superAdmin';
import AdminModal from '@/components/super-admin/AdminModal';
import CustomNotification from '@/components/ui/Notification'; 

import icDelete from "@/assets/news/delete.png";
import icEdit from "@/assets/news/edit.png";

const SuperAdminPage = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
    
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ 
        show: false, 
        message: '', 
        type: 'success' 
    });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const loadAdmins = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAdmins();
            setAdmins(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat daftar admin.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const handleOpenAddModal = () => {
        setEditingAdmin(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (admin: Admin) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };
    
    const handleFormSubmit = async (data: CreateAdminData) => {
        try {
            if (editingAdmin) {
                // Update existing admin
                const updateData: UpdateAdminData = {
                    username: data.username,
                    email: data.email,
                    role: data.role,
                };
                
                // Only include password if it's provided
                if (data.password.trim()) {
                    updateData.password = data.password;
                }
                
                await updateAdmin(editingAdmin.id, updateData);
                showNotification('Admin berhasil diperbarui!', 'success');
            } else {
                // Create new admin
                await createAdmin(data);
                showNotification('Admin baru berhasil ditambahkan!', 'success');
            }
            
            setIsModalOpen(false);
            await loadAdmins(); // Reload admin list
        } catch (err) {
            showNotification(err instanceof Error ? err.message : 'Gagal menyimpan admin.', 'error');
            throw err; // Let modal know the process failed
        }
    };

    const handleDeleteAdmin = async (admin: Admin) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus admin "${admin.username}"?`)) {
            setDeletingAdmin(admin);
            try {
                await deleteAdmin(admin.id);
                showNotification('Admin berhasil dihapus!', 'success');
                await loadAdmins(); // Reload admin list
            } catch (err) {
                showNotification(err instanceof Error ? err.message : 'Gagal menghapus admin.', 'error');
            } finally {
                setDeletingAdmin(null);
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center font_britanica_bold">Loading Admin List...</div>;
    if (error) return <div className="p-8 text-center font_britanica_bold text-red-500">{error}</div>;

    return (
        <>
            {notification.show && (
                <CustomNotification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification({ ...notification, show: false })} 
                />
            )}
            
            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw]">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font_britanica_bold text-4xl text-black">Admin Management</h1>
                    <button 
                        onClick={handleOpenAddModal}
                        className="bg-[#A0001B] text-white px-4 py-2 rounded-lg font_britanica_bold hover:bg-[#4F000D] flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Add New Admin
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-full text-left text-sm whitespace-nowrap">
                        <div className="font_britanica_bold text-black text-lg mb-2">
                            <div className="flex bg-[#F5F5F5] rounded-xl">
                                <div className="p-4 w-1/4 rounded-l-xl">Username</div>
                                <div className="p-4 w-1/4">Email</div>
                                <div className="p-4 w-1/4">Role</div>
                                <div className="p-4 w-1/4 text-center rounded-r-xl">Actions</div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {admins.length > 0 ? admins.map(admin => (
                                <div key={admin.id} className="flex items-center text-base bg-[#F5F5F5] rounded-xl">
                                    <div className="p-4 w-1/4">{admin.username}</div>
                                    <div className="p-4 w-1/4">{admin.email}</div>
                                    <div className="p-4 w-1/4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            admin.role === 'superadmin' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {admin.role}
                                        </span>
                                    </div>
                                    <div className="p-4 w-1/4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button 
                                                title="Edit Admin" 
                                                className="hover:opacity-75 disabled:opacity-50"
                                                onClick={() => handleOpenEditModal(admin)}
                                                disabled={deletingAdmin?.id === admin.id}
                                            >
                                                <Image src={icEdit} alt="Edit" width={24} height={24} />
                                            </button>
                                            <button 
                                                title="Delete Admin" 
                                                className="hover:opacity-75 disabled:opacity-50"
                                                onClick={() => handleDeleteAdmin(admin)}
                                                disabled={deletingAdmin?.id === admin.id}
                                            >
                                                <Image src={icDelete} alt="Delete" width={24} height={24} />
                                            </button>
                                            {deletingAdmin?.id === admin.id && (
                                                <span className="text-xs text-gray-500">Deleting...</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 bg-[#F5F5F5] rounded-xl">No admins found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <AdminModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingAdmin}
            />
        </>
    );
};

export default SuperAdminPage;