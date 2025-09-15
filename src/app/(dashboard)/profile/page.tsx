// src/app/(dashboard)/profile/page.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { fetchProfile, updateProfile, ProfileData, UpdateProfilePayload } from '@/lib/auth';
import CustomNotification from '@/components/ui/Notification'; // Asumsi Anda punya komponen notifikasi

const ProfilePage = () => {
    // 1. State Management
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '', // Biarkan kosong, hanya diisi jika ingin mengubah
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 2. Fetch Data Awal
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                const data = await fetchProfile();
                setProfile(data);
                setFormData({
                    username: data.username,
                    email: data.email,
                    password: '',
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memuat profil.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    // 3. Handle Perubahan Input Form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Handle Submit Form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        const payload: UpdateProfilePayload = {
            username: formData.username,
            email: formData.email,
        };

        // Hanya sertakan password dalam payload jika diisi
        if (formData.password.trim() !== '') {
            payload.password = formData.password;
        }

        try {
            const updatedProfile = await updateProfile(payload);
            setProfile(updatedProfile);
            setSuccessMessage('Profil berhasil diperbarui!');
            // Kosongkan field password setelah berhasil update
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memperbarui profil.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tampilan Loading dan Error
    if (isLoading) return <div className="p-8 text-center font-bold">Loading Profile...</div>;
    if (error && !profile) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

    return (
        <>
            {/* Tampilkan Notifikasi Sukses/Error */}
            {successMessage && <CustomNotification type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
            {error && <CustomNotification type="error" message={error} onClose={() => setError(null)} />}

            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw]">
                <h1 className="font_britanica_bold text-4xl text-black mb-6">Edit Profile</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Kosongkan jika tidak ingin mengubah"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A0001B] hover:bg-[#800015] disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ProfilePage;