'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { fetchMemberById, updateMember, CreateMemberData, validateMemberData } from '@/lib/members';

import linkIcon from "@/assets/members/link.png";
import arrow from '@/assets/news/arrow.png';
import uploadCloud from '@/assets/news/upload-cloud.png';
import arrowDown from '@/assets/news/arrow-down.png';

type DynamicList = string[];

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

const ImageUploadBox = ({ title, imagePreview, onImageUpload, onImageRemove, required = false }: {
    title: string;
    imagePreview: string | null;
    onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
    onImageRemove: () => void;
    required?: boolean;
}) => {
    return (
        <div>
            <label className="block text-black font_britanica_bold mb-2">
                {title} {required && <span className="text-red-500">*</span>}
            </label>
            {imagePreview ? (
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <Image 
                        src={imagePreview} 
                        alt={`${title} Preview`} 
                        fill 
                        style={{ objectFit: 'contain' }} 
                        className="rounded-md" 
                    />
                    <button 
                        onClick={onImageRemove} 
                        type="button" 
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 leading-none hover:bg-red-600 z-10 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="relative border-2 border-dashed border-[#323232] rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                    <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={onImageUpload} 
                        accept="image/jpeg,image/png,image/gif,image/webp" 
                    />
                    <Image src={uploadCloud} alt="Upload icon" width={48} height={48} className="mx-auto mb-3" />
                    <p className="text-gray-600 font_britanica_regular text-sm">
                        <span className="text-[#A0001B] font_britanica_bold">Click to upload</span> or drag and drop <br />
                        JPEG, PNG, WebP - Up to 5MB
                    </p>
                </div>
            )}
        </div>
    );
};

const DynamicListSection = ({ title, list, setList }: {
    title: string;
    list: DynamicList;
    setList: React.Dispatch<React.SetStateAction<DynamicList>>;
}) => {
    const handleAddItem = () => setList([...list, '']);
    
    const handleItemChange = (index: number, value: string) => {
        const updatedList = [...list];
        updatedList[index] = value;
        setList(updatedList);
    };
    
    const handleRemoveItem = (index: number) => {
        const updatedList = list.filter((_, i) => i !== index);
        setList(updatedList.length === 0 ? [''] : updatedList);
    };

    return (
        <div>
            <label className="block text-black font_britanica_bold mb-2">{title}</label>
            <div className='flex flex-col border border-black rounded-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-[#A0001B]'>
                {list.map((item, index) => (
                    <div key={index} className="flex items-center px-2 gap-2">
                        <span className="font_britanica_bold">{index + 1}.</span>
                        <input
                            type="text"
                            placeholder={`${title} ${index + 1}`}
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            className="w-full p-3 outline-none"
                        />
                        {list.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => handleRemoveItem(index)} 
                                className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button 
                type="button" 
                onClick={handleAddItem} 
                className="text-[#A0001B] font_britanica_bold self-start mt-2 cursor-pointer hover:text-[#800016] transition-colors"
            >
                + Add {title}
            </button>
        </div>
    );
};

const EditMemberPage = () => {
    const router = useRouter();
    const params = useParams();
    const memberId = params?.id ? Number(params.id) : null;

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [biography, setBiography] = useState('');
    const [position, setPosition] = useState('');
    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
    const positionDropdownRef = useRef<HTMLDivElement>(null);
    const positions = ["Managing Partner", "Senior Partner", "Partner", "Senior Associate", "Associate"];

    const [businessCard, setBusinessCard] = useState<{ file: File | null, preview: string | null }>({ file: null, preview: null });
    const [detailImage, setDetailImage] = useState<{ file: File | null, preview: string | null }>({ file: null, preview: null });
    const [displayImage, setDisplayImage] = useState<{ file: File | null, preview: string | null }>({ file: null, preview: null });

    const [practiceFocus, setPracticeFocus] = useState<DynamicList>(['']);
    const [education, setEducation] = useState<DynamicList>(['']);
    const [language, setLanguage] = useState<DynamicList>(['']);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ 
        show: boolean; 
        message: string; 
        type: 'success' | 'error' 
    }>({ show: false, message: '', type: 'success' });
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `https://api.has-law.com/${imagePath}`;
    };

    useEffect(() => {
        const loadMemberData = async () => {
            if (!memberId) {
                router.push('/members');
                return;
            }

            try {
                setIsLoading(true);
                const memberData = await fetchMemberById(memberId);
                
                setFullName(memberData.full_name || '');
                setPosition(memberData.title_position || '');
                setEmail(memberData.email || '');
                setPhone(memberData.phone_number?.replace('+62', '') || '');
                setLinkedin(memberData.linkedin || '');
                setBiography(memberData.biography || '');
                setPracticeFocus(memberData.practice_focus?.length > 0 ? memberData.practice_focus : ['']);
                setEducation(memberData.education?.length > 0 ? memberData.education : ['']);
                setLanguage(memberData.language?.length > 0 ? memberData.language : ['']);

                if (memberData.business_card) {
                    setBusinessCard({ file: null, preview: getImageUrl(memberData.business_card) });
                }
                if (memberData.detail_image) {
                    setDetailImage({ file: null, preview: getImageUrl(memberData.detail_image) });
                }
                if (memberData.display_image) {
                    setDisplayImage({ file: null, preview: getImageUrl(memberData.display_image) });
                }

            } catch (error) { 
                console.error('Error loading member:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to load member data';
                showNotification(errorMessage, 'error');
                setTimeout(() => router.push('/members'), 2000);
            } finally {
                setIsLoading(false);
            }
        };

        loadMemberData();
    }, [memberId, router]);

    const handleUpdateMember = async () => {
        if (!memberId) return;

        const memberData: CreateMemberData = {
            full_name: fullName.trim(),
            title_position: position,
            email: email.trim(),
            phone_number: phone.trim() ? `+62${phone.trim()}` : '',
            linkedin: linkedin.trim(),
            biography: biography.trim(),
            practice_focus: practiceFocus.filter(item => item.trim() !== ''),
            education: education.filter(item => item.trim() !== ''),
            language: language.filter(item => item.trim() !== ''),
            display_image: displayImage.file || undefined,
            detail_image: detailImage.file || undefined,
            business_card: businessCard.file || undefined,
        };

        const errors = validateMemberData(memberData);
        if (errors.length > 0) {
            setValidationErrors(errors);
            showNotification('Please fix validation errors', 'error');
            return;
        }

        setValidationErrors([]);
        setIsSaving(true);

        try {
            await updateMember(memberId, memberData);
            showNotification('Member updated successfully!', 'success');
            setTimeout(() => router.push('/members'), 1500);
        } catch (error) {
            console.error('Update error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update member';
            showNotification(errorMessage, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target as Node)) {
                setIsPositionDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleImageUpload = (
        event: ChangeEvent<HTMLInputElement>, 
        setter: React.Dispatch<React.SetStateAction<{ file: File | null, preview: string | null }>>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File size must be less than 5MB', 'error');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showNotification('Please upload JPEG, PNG, or WebP image', 'error');
                return;
            }

            setter({ file, preview: URL.createObjectURL(file) });
        }
    };

    const handleImageRemove = (
        setter: React.Dispatch<React.SetStateAction<{ file: File | null, preview: string | null }>>, 
        currentPreview: string | null
    ) => {
        if (currentPreview && currentPreview.startsWith('blob:')) {
            URL.revokeObjectURL(currentPreview);
        }
        setter({ file: null, preview: null });
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0001B] mx-auto mb-4"></div>
                    <div className="text-xl font_britanica_bold text-gray-600">Loading Member Data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 flex items-center justify-center">
            {/* Notification */}
            {notification.show && (
                <CustomNotification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification({ ...notification, show: false })} 
                />
            )}

            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] overflow-y-auto">
                <div className="flex flex-col gap-8">
                    <Link href="/members" className="flex items-center gap-2 text-[#4F000D] hover:text-[#A0001B] font_britanica_bold cursor-pointer w-fit transition-colors">
                        <Image src={arrow} alt="Back arrow" width={24} height={24} />
                        <span className='font_britanica_bold text-xl'>Back to Members</span>
                    </Link>

                    <h1 className="font_britanica_bold text-4xl text-black">Edit Member</h1>

                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font_britanica_bold text-red-800 mb-2">Please fix the following errors:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="text-red-700 font_britanica_regular">{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex flex-col gap-6">
                        <div>
                            <label htmlFor="fullName" className="block text-black font_britanica_bold mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="fullName" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]" 
                                required 
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <label className="block text-black font_britanica_bold mb-2">
                                Position <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={positionDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                                    className="w-full flex justify-between items-center p-3 border border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#A0001B] cursor-pointer"
                                >
                                    <span className={position ? 'text-black' : 'text-gray-400'}>
                                        {position || "Choose Position"}
                                    </span>
                                    <Image 
                                        src={arrowDown} 
                                        alt="arrow" 
                                        width={20} 
                                        height={20} 
                                        className={`transition-transform duration-300 ${isPositionDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                                    />
                                </button>
                                
                                <div className={`absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden transition-all duration-300 ease-in-out ${isPositionDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                                    <ul>
                                        {positions.map((pos, index) => (
                                            <li 
                                                key={index}
                                                onClick={() => { setPosition(pos); setIsPositionDropdownOpen(false); }}
                                                className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors ${position === pos ? 'bg-[#A0001B] text-white' : ''}`}
                                            >
                                                {pos}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-black font_britanica_bold mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]" 
                                required 
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-black font_britanica_bold mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-3 py-3 border border-r-0 border-black bg-[#323232] text-white rounded-l-lg font_britanica_bold text-md">
                                    +62
                                </span>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                                    className="w-full p-3 border border-black rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]" 
                                    required 
                                    placeholder="812345678"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="linkedin" className="block text-black font_britanica_bold mb-2">
                                LinkedIn Profile
                            </label>
                            <div className="flex items-center">
                                <span className="inline-flex items-center justify-center p-3 border border-r-0 border-black bg-[#323232] rounded-l-lg">
                                    <Image src={linkIcon} alt="link icon" className="w-7 h-6" />
                                </span>
                                <input 
                                    type="url" 
                                    id="linkedin" 
                                    value={linkedin} 
                                    onChange={(e) => setLinkedin(e.target.value)} 
                                    className="w-full p-3 border border-black rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]" 
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                        </div>

                        <ImageUploadBox 
                            title="Business Card" 
                            imagePreview={businessCard.preview} 
                            onImageUpload={(e) => handleImageUpload(e, setBusinessCard)} 
                            onImageRemove={() => handleImageRemove(setBusinessCard, businessCard.preview)} 
                        />
                        
                        <ImageUploadBox 
                            title="Detail Image" 
                            imagePreview={detailImage.preview} 
                            onImageUpload={(e) => handleImageUpload(e, setDetailImage)} 
                            onImageRemove={() => handleImageRemove(setDetailImage, detailImage.preview)} 
                        />
                        
                        <ImageUploadBox 
                            title="Display Picture" 
                            imagePreview={displayImage.preview} 
                            onImageUpload={(e) => handleImageUpload(e, setDisplayImage)} 
                            onImageRemove={() => handleImageRemove(setDisplayImage, displayImage.preview)} 
                        />

                        <div>
                            <label htmlFor="biography" className="block text-black font_britanica_bold mb-2">
                                Biography / Profile
                            </label>
                            <textarea 
                                id="biography" 
                                value={biography} 
                                onChange={(e) => setBiography(e.target.value)} 
                                className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B] resize-y" 
                                rows={8} 
                                placeholder="Enter member biography..."
                            />
                        </div>

                        <DynamicListSection title="Practice Focus" list={practiceFocus} setList={setPracticeFocus} />
                        <DynamicListSection title="Education" list={education} setList={setEducation} />
                        <DynamicListSection title="Language" list={language} setList={setLanguage} />
                    </div>

                    <div className="flex justify-end mt-8">
                        <button 
                            onClick={handleUpdateMember}
                            disabled={isSaving}
                            className="px-10 py-3 rounded-lg bg-[#A0001B] text-white font_britanica_bold hover:bg-[#4F000D] transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditMemberPage;