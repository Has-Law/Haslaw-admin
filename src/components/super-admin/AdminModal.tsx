'use client';

import { useState, useEffect } from 'react';

// Define interfaces locally to avoid import issues
export interface Admin {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateAdminData {
    username: string;
    email: string;
    password: string;
    role: string;
}

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateAdminData) => Promise<void>;
    initialData?: Admin | null;
}

const AdminModal = ({ isOpen, onClose, onSubmit, initialData }: AdminModalProps) => {
    const [formData, setFormData] = useState<CreateAdminData>({
        username: '',
        email: '',
        password: '',
        role: 'admin'
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<CreateAdminData>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                username: initialData.username,
                email: initialData.email,
                password: '', // Password tidak diisi untuk edit
                role: initialData.role
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'admin'
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateAdminData> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username wajib diisi';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!initialData && !formData.password.trim()) {
            newErrors.password = 'Password wajib diisi';
        } else if (!initialData && formData.password && formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // Modal akan ditutup dari parent component jika berhasil
        } catch (error) {
            // Error handling sudah dilakukan di parent component
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error saat user mulai mengetik
        if (errors[name as keyof CreateAdminData]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font_britanica_bold text-2xl text-black">
                            {initialData ? 'Edit Admin' : 'Tambah Admin Baru'}
                        </h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                            disabled={isSubmitting}
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B] ${
                                    errors.username ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Masukkan username"
                                disabled={isSubmitting}
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B] ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Masukkan email"
                                disabled={isSubmitting}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password {initialData && '(Kosongkan jika tidak ingin mengubah)'}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B] ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Masukkan password"
                                disabled={isSubmitting}
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]"
                                disabled={isSubmitting}
                            >
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-[#A0001B] text-white rounded-lg hover:bg-[#4F000D] disabled:opacity-50 font_britanica_bold"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Menyimpan...' : (initialData ? 'Update' : 'Tambah')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminModal;