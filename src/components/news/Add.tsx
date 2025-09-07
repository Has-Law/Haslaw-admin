'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation';

import arrow from '@/assets/news/arrow.png';
import uploadCloud from '@/assets/news/upload-cloud.png';
import arrowDown from '@/assets/news/arrow-down.png';
import { createNews } from '@/lib/news'; 


const CustomNotification = ({ 
    message, 
    type, 
    onClose 
}: { 
    message: string; 
    type: 'success' | 'error'; 
    onClose: () => void; 
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center transition-transform transform animate-slide-in";
    const typeClasses = type === 'success' 
        ? "bg-green-100 border border-green-400 text-green-800" 
        : "bg-red-100 border border-red-400 text-red-800";

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <span className="font_britanica_bold mr-3">{type === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan!'}</span>
            <span className="font_britanica_regular">{message}</span>
            <button 
                onClick={onClose} 
                className="ml-auto pl-3 text-xl font-bold hover:opacity-70"
                aria-label="Close"
            >
                &times;
            </button>
        </div>
    );
};


const Add = () => {
    const router = useRouter();

    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsImage, setNewsImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [category, setCategory] = useState('');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const categories = [
        "Commercial Litigation", "Administrative Litigation", "Criminal Litigation",
        "White Collar Defense", "Judicial Review", "Corporate & Commercial", "Others"
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewsImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };
    
    const removeImage = () => {
        setNewsImage(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    }

    const handleSubmit = async (status: 'Posted' | 'Drafted') => {
        if (!newsTitle || !newsContent || !category || !newsImage) {
            showNotification('Mohon lengkapi semua kolom dan unggah gambar.', 'error');
            return;
        }

        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append('news_title', newsTitle);
        formData.append('content', newsContent);
        formData.append('category', category);
        formData.append('status', status);
        formData.append('image', newsImage);
        
        try {
            await createNews(formData);
            const successMessage = `Berita berhasil ${status === 'Posted' ? 'diunggah' : 'disimpan sebagai draf'}!`;
            showNotification(successMessage, 'success');
            
            setTimeout(() => {
                router.push('/news');
            }, 1500);

        } catch (err) { 
            let errorMessage = 'An unknown error occurred';
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            showNotification(`Terjadi kesalahan: ${errorMessage}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] overflow-y-auto">
            {notification.show && (
                <CustomNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}

            <div className="flex flex-col gap-4">
                <Link href="/news" className="flex items-center gap-2 text-[#4F000D] hover:text-[#A0001B] font_britanica_bold cursor-pointer w-fit">
                    <Image src={arrow} alt="Back arrow" width={24} height={24} />
                    <span className='font_britanica_bold text-xl'>Back to News & Insight</span>
                </Link>

                <h1 className="font_britanica_bold text-4xl text-black">Add News & Insight</h1>

                <div className="flex flex-col gap-6">
                    <div>
                        <label htmlFor="newsTitle" className="block text-black font_britanica_bold mb-2">News Title <span className="text-red-500">*</span></label>
                        <input type="text" id="newsTitle" placeholder="Enter News Title" className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]" required value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="newsContent" className="block text-black font_britanica_bold mb-2">News Content <span className="text-red-500">*</span></label>
                        <textarea id="newsContent" placeholder="Write News Content" rows={8} className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B] resize-y" required value={newsContent} onChange={(e) => setNewsContent(e.target.value)}></textarea>
                    </div>

                    <div>
                        <label className="block text-black font_britanica_bold mb-2">Category <span className="text-red-500">*</span></label>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex justify-between items-center p-3 border border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#A0001B]"
                            >
                                <span className={category ? 'text-black' : 'text-gray-400'}>{category || "Choose Category"}</span>
                                <Image 
                                    src={arrowDown} 
                                    alt="arrow" 
                                    width={20} 
                                    height={20} 
                                    className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                                />
                            </button>
                            
                            <div className={`absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <ul className="max-h-56 overflow-y-auto">
                                    {categories.map((cat, index) => (
                                        <li 
                                            key={index}
                                            onClick={() => {
                                                setCategory(cat);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="p-3 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {cat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-black font_britanica_bold mb-2">News Image <span className="text-red-500">*</span></label>
                        {imagePreview ? (
                            <div className="relative w-full h-64 border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="contain" className="rounded-md" />
                                <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-[#323232] rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/jpeg,image/png,image/gif" />
                                <Image src={uploadCloud} alt="Upload icon" width={48} height={48} className="mx-auto mb-3" />
                                <p className="text-gray-600 font_britanica_regular">
                                    <span className="text-[#A0001B] font_britanica_bold">Klik untuk upload</span> atau drag and drop
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Format: JPG, PNG, GIF (Maks 5MB)</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button 
                        onClick={() => handleSubmit('Drafted')} 
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-3xl border border-[#A0001B] text-[#A0001B] font_britanica_bold hover:bg-[#F0F0F0] transition-colors duration-200 cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? 'Drafting...' : 'Draft'}
                    </button>
                    <button 
                        onClick={() => handleSubmit('Posted')} 
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-3xl bg-[#A0001B] text-white font_britanica_bold hover:bg-[#4F000D] transition-colors duration-200 cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Add;