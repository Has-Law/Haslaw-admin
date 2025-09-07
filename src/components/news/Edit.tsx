'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { useRouter, useParams } from 'next/navigation';

import arrow from '@/assets/news/arrow.png';
import uploadCloud from '@/assets/news/upload-cloud.png';
import arrowDown from '@/assets/news/arrow-down.png';

import { fetchNewsById, updateNews } from '@/lib/news'; 


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



const Edit = () => {
    const router = useRouter();
    const params = useParams();
    const newsId = params?.id ? Number(params.id) : null;
    
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsImage, setNewsImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [category, setCategory] = useState('');
    const [currentStatus, setCurrentStatus] = useState<'Posted' | 'Drafted'>('Drafted');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

    const categories = [
        "Commercial Litigation", "Administrative Litigation", "Criminal Litigation", "White Collar Defense",
        "Judicial Review", "Corporate & Commercial", "Intellectual Property", "Real Estate", "Others"
    ];

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    useEffect(() => {
        if (newsId) {
            const loadNewsDetails = async () => {
                setIsLoading(true);
                try {
                    const data = await fetchNewsById(newsId);
                    setNewsTitle(data.news_title);
                    setNewsContent(data.content);
                    setCategory(data.category);
                    setCurrentStatus(data.status); 
                    
                    if (data.image) {
                        const imageUrl = `https://api.has-law.com/${data.image}`;
                        setImagePreview(imageUrl);
                    }
                } catch (err) {
                    console.error('Gagal mengambil detail berita:', err);
                    showNotification('Berita tidak ditemukan atau gagal dimuat.', 'error');
                    router.push('/news');
                } finally {
                    setIsLoading(false);
                }
            };
            loadNewsDetails();
        }
    }, [newsId, router]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
    };

    const handleSave = async () => {
        if (!newsId || !newsTitle.trim() || !newsContent.trim() || !category) {
            showNotification("Mohon isi judul, konten, dan kategori!", 'error');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('news_title', newsTitle);
            formData.append('content', newsContent);
            formData.append('category', category);
            formData.append('status', currentStatus); 
            if (newsImage) {
                formData.append('image', newsImage);
            }

            await updateNews(newsId, formData);
            
            showNotification("Berita berhasil disimpan!", 'success');
                    router.refresh(); 

            setTimeout(() => {
                router.push('/news');
            }, 1500);
            
        } catch (err) { 
            console.error('Error saat menyimpan:', err);
            let errorMessage = "Gagal menyimpan berita.";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            showNotification(`Gagal menyimpan berita: ${errorMessage}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] h-screen flex items-center justify-center">
                <div className="text-xl font_britanica_bold text-gray-600">Memuat data...</div>
            </div>
        );
    }
    
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
                    <span className='font_britanica_bold text-xl'>Kembali ke News & Insight</span>
                </Link>

                <h1 className="font_britanica_bold text-4xl text-black">Edit News & Insight</h1>

                <div className="flex flex-col gap-6">
                    <div>
                        <label htmlFor="newsTitle" className="block text-black font_britanica_bold mb-2">
                            Judul Berita <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="newsTitle" 
                            placeholder="Masukkan Judul Berita" 
                            className="w-full p-3 border border-black rounded-lg focus:border-[#A0001B] focus:outline-none" 
                            required 
                            value={newsTitle} 
                            onChange={(e) => setNewsTitle(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label htmlFor="newsContent" className="block text-black font_britanica_bold mb-2">
                            Konten Berita <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                            id="newsContent" 
                            placeholder="Tulis Konten Berita" 
                            rows={8} 
                            className="w-full p-3 border border-black rounded-lg resize-y focus:border-[#A0001B] focus:outline-none" 
                            required 
                            value={newsContent} 
                            onChange={(e) => setNewsContent(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label className="block text-black font_britanica_bold mb-2">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                type="button" 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                                className="w-full flex justify-between items-center p-3 border border-black rounded-lg bg-white hover:border-[#A0001B] focus:border-[#A0001B] focus:outline-none"
                            >
                                <span className={category ? 'text-black' : 'text-gray-400'}>
                                    {category || "Pilih Kategori"}
                                </span>
                                <Image 
                                    src={arrowDown} 
                                    alt="arrow" 
                                    width={20} 
                                    height={20} 
                                    className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
                                />
                            </button>
                            <div className={`absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 ${isDropdownOpen ? 'block' : 'hidden'}`}>
                                <ul className="max-h-60 overflow-y-auto">
                                    {categories.map((cat) => (
                                        <li 
                                            key={cat} 
                                            onClick={() => { 
                                                setCategory(cat); 
                                                setIsDropdownOpen(false); 
                                            }} 
                                            className={`p-3 hover:bg-gray-100 cursor-pointer ${category === cat ? 'bg-[#A0001B] text-white' : ''}`}
                                        >
                                            {cat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-black font_britanica_bold mb-2">
                            Gambar Berita 
                            <span className="text-gray-500 text-sm ml-2">(Opsional)</span>
                        </label>
                        {imagePreview ? (
                            <div className="relative w-full h-64 border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <Image 
                                    src={imagePreview} 
                                    alt="Preview Gambar" 
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="rounded-md" 
                                />
                                <button 
                                    onClick={removeImage} 
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-red-600 z-10 transition-colors"
                                    aria-label="Remove image"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-[#323232] rounded-lg p-8 text-center cursor-pointer hover:border-[#A0001B] transition-colors">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    onChange={handleImageUpload} 
                                    accept="image/jpeg,image/png,image/gif" 
                                />
                                <Image 
                                    src={uploadCloud} 
                                    alt="Upload icon" 
                                    width={48} 
                                    height={48} 
                                    className="mx-auto mb-3" 
                                />
                                <p className="text-gray-600 font_britanica_regular">
                                    <span className="text-[#A0001B] font_britanica_bold">Klik untuk upload</span> atau drag and drop
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Format: JPG, PNG, GIF (Maks 5MB)</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#A0001B]">
                        <p className="text-sm text-gray-600">
                            <span className="font_britanica_bold">Status saat ini:</span> 
                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font_britanica_bold ${
                                currentStatus === 'Posted' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {currentStatus === 'Posted' ? 'Posted' : 'Draft'}
                            </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Status tidak akan berubah saat menyimpan perubahan.</p>
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button 
                        onClick={handleSave} 
                        disabled={isSubmitting || !newsTitle.trim() || !newsContent.trim() || !category} 
                        className="px-8 py-3 rounded-3xl bg-[#A0001B] text-white font_britanica_bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#800016] transition-colors"
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Edit;