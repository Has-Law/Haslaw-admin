'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import arrowDown from '@/assets/news/arrow-down.png';
import { getApplicantsByBatchId, updateApplicantStatus, deleteApplicant, Applicant } from '@/lib/career';

import arrow from '@/assets/news/arrow.png';
import infoIcon from "@/assets/career/info.png";
import icDelete from "@/assets/news/delete.png";

const LawyersApplicantsListPage = () => {
    const params = useParams();
    const batchId = params?.id ? Number(params.id) : null;

    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const statusOptions = [
        { value: 'New', label: 'New' },
        { value: 'Viewed', label: 'Reviewed' },
        { value: 'Contacted', label: 'Interviewed' },
        { value: 'Rejected', label: 'Rejected' }
    ];

    const fetchApplicants = useCallback(async () => {
        if (!batchId) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const data = await getApplicantsByBatchId(batchId);
            setApplicants(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data pelamar.');
        } finally {
            setLoading(false);
        }
    }, [batchId]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId !== null) {
                const dropdownElement = dropdownRefs.current[openDropdownId];
                if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
                    setOpenDropdownId(null);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdownId]);

    const handleStatusChange = async (applicantId: number, newStatus: string) => {
        try {
            await updateApplicantStatus(applicantId, newStatus);
            setApplicants(prev => prev.map(app =>
                app.id === applicantId ? { ...app, status: newStatus as Applicant['status'] } : app
            ));
            setOpenDropdownId(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal memperbarui status.';
            alert(errorMessage);
        }
    };

    const handleDelete = async (applicantId: number) => {
        if (window.confirm('Anda yakin ingin menghapus pelamar ini?')) {
            try {
                await deleteApplicant(applicantId);
                await fetchApplicants();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus pelamar.';
                alert(errorMessage);
            }
        }
    };

    const toggleDropdown = (applicantId: number) => {
        setOpenDropdownId(openDropdownId === applicantId ? null : applicantId);
    };

    const getStatusLabel = (status: string) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.label : status;
    };

    if (loading) return( <div className='p-4'>
                <div className="flex flex-col bg-white p-4 sm:p-8 rounded-2xl shadow-lg min-h-screen animate-pulse">
                    <div className="h-7 w-64 bg-gray-200 rounded-md mb-6"></div>
                    <div className="h-8 w-1/3 bg-gray-200 rounded-md mb-6"></div>
                    <div className="space-y-2">
                        <div className="h-14 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className='p-4'>
            <div className="flex flex-col p-4 bg-white rounded-2xl shadow-lg min-h-screen">
                <Link href="/careers" className="flex items-center gap-2 text-[#4F000D] hover:text-[#A0001B] font_britanica_bold cursor-pointer w-fit mb-6">
                    <Image src={arrow} alt="Back arrow" width={24} height={24} />
                    <span className='font_britanica_bold text-xl'>Back to Career Dashboard</span>
                </Link>

                <h2 className="text-2xl font_britanica_bold text-black mb-6">Applicants</h2>

                <div className="overflow-x-auto">
                    <div className="min-w-[800px] text-left text-sm whitespace-nowrap">
                        <div className="font_britanica_bold text-black text-lg mb-2">
                            <div className="flex">
                                <div className="px-6 py-3 bg-[#F5F5F5] rounded-l-xl flex-shrink-0 w-16">No</div>
                                <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[190px]">Applicant Name</div>
                                <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[210px]">Email</div>
                                <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[150px]">Date Applied</div>
                                <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[150px]">Application Status</div>
                                <div className="px-6 py-3 bg-[#F5F5F5] rounded-r-xl w-32 text-center flex-shrink-0">Action</div>
                            </div>
                        </div>
                        <div className="font_britanica_bold space-y-1">
                            {applicants.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">Tidak ada pelamar ditemukan</div>
                            ) : (
                                applicants.map((applicant, index) => (
                                    <div key={applicant.id} className="flex items-center text-base">
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-l-xl w-16">{index + 1}.</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[190px]">{applicant.applicant_name}</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[210px]">{applicant.email}</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[150px]">{new Date(applicant.application_date).toLocaleDateString()}</div>
                                        <div className="px-6 py-[7px] bg-[#F5F5F5] flex-1 min-w-[150px] text-center">
                                            <div className="relative" ref={(el) => { dropdownRefs.current[applicant.id] = el; }}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDropdown(applicant.id)}
                                                    className="w-full flex justify-between items-center p-2 border border-black rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#A0001B] cursor-pointer min-w-[120px]"
                                                >
                                                    <span className="text-black font_britanica_regular">
                                                        {getStatusLabel(applicant.status)}
                                                    </span>
                                                    <Image
                                                        src={arrowDown}
                                                        alt="arrow"
                                                        width={16}
                                                        height={16}
                                                        className={`transition-transform duration-300 ${openDropdownId === applicant.id ? 'rotate-180' : 'rotate-0'}`}
                                                    />
                                                </button>
                                                <div className={`absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden transition-all duration-300 ease-in-out ${openDropdownId === applicant.id
                                                        ? 'opacity-100 translate-y-0'
                                                        : 'opacity-0 -translate-y-2 pointer-events-none'
                                                    }`}>
                                                    <ul>
                                                        {statusOptions.map((option, optionIndex) => (
                                                            <li
                                                                key={optionIndex}
                                                                onClick={() => handleStatusChange(applicant.id, option.value)}
                                                                className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors font_britanica_regular ${applicant.status === option.value
                                                                        ? 'bg-[#A0001B] text-white hover:bg-[#800016]'
                                                                        : 'text-black'
                                                                    }`}
                                                            >
                                                                {option.label}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-6 py-2 bg-[#F5F5F5] rounded-r-xl w-34 sm:w-32 flex-shrink-0 justify-center flex gap-2 ">
                                            {/* PERUBAHAN SATU-SATUNYA ADA DI SINI */}
                                            <Link href={`/careers/lawyers/details/${batchId}/applicants/${applicant.id}`}>
                                                <button title="View Profile"><Image src={infoIcon} alt="View Profile" className='w-8' /></button>
                                            </Link>
                                            <button onClick={() => handleDelete(applicant.id)} title="Delete Applicant"><Image src={icDelete} alt="Delete" className='w-8 mb-2 ' /></button>
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

export default LawyersApplicantsListPage;