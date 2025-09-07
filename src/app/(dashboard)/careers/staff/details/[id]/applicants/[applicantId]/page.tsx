'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { getApplicantById, Applicant, ApplicationValue } from '@/lib/career';

import arrow from '@/assets/news/arrow.png';
import downloadIcon from '@/assets/career/download.png';

const StaffApplicantProfilePage = () => {
    const router = useRouter();
    const params = useParams();
    const batchId = params?.id ? Number(params.id) : null;
    const applicantId = params?.applicantId ? Number(params.applicantId) : null;
    const [error, setError] = useState<string | null>(null);
    const [applicant, setApplicant] = useState<Applicant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (applicantId) {
            const fetchApplicant = async () => {
                setLoading(true);
                try {
                    const data = await getApplicantById(applicantId);
                    setApplicant(data);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Applicant not found.';
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            };
            fetchApplicant();
        }
    }, [applicantId, router]);

     if (loading || !applicant) {
        return (
            <div className='p-4'>
                <div className="p-4 bg-white rounded-2xl shadow-lg min-h-screen animate-pulse">
                    <div className="flex flex-col gap-8 p-4">
                        <div className="h-7 w-56 bg-gray-200 rounded-md"></div>
                        <div className="h-10 w-1/2 bg-gray-200 rounded-md"></div>
                        <div className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <div className="h-5 w-1/4 bg-gray-200 rounded-md"></div>
                                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-5 w-1/3 bg-gray-200 rounded-md"></div>
                                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-5 w-1/4 bg-gray-200 rounded-md"></div>
                                <div className="h-24 w-full bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 font_britanica_bold">{error}</div>;
    }

    const renderField = (item: ApplicationValue) => {
        const { form_field, value, file_url } = item;
        if (form_field.input_type === 'File Upload' && file_url) {
            const fileName = file_url.split('/').pop() || 'file';
            return (
                 <div key={item.id}>
                    <label className="block text-black font_britanica_bold mb-2">{form_field.field_label}</label>
                    <div className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center">
                        <span>{fileName}</span>
                        <a href={file_url} target="_blank" rel="noopener noreferrer" download title="Download" className="cursor-pointer">
                            <Image src={downloadIcon} alt="Download" width={24} height={24} />
                        </a>
                    </div>
                </div>
            );
        }

        if (form_field.input_type === 'Paragraph') {
            return (
                <div key={item.id}>
                    <label className="block text-black font_britanica_bold mb-2">{form_field.field_label}</label>
                    <textarea value={value || ''} className="w-full p-3 border border-gray-300  rounded-lg resize-none" rows={6} readOnly />
                </div>
            );
        }

        return (
            <div key={item.id}>
                <label className="block text-black font_britanica_bold mb-2">{form_field.field_label}</label>
                <input type="text" value={value || ''} className="w-full p-3 border border-gray-300  rounded-lg" readOnly />
            </div>
        );
    };

    return (
        <div className='p-4'>
            <div className="p-4 bg-white rounded-2xl shadow-lg min-h-screen">
                <div className="flex flex-col gap-8 p-4">
                    <Link href={`/careers/staff/details/${batchId}/applicants`} className="flex items-center gap-2 text-[#4F000D] hover:text-[#A0001B] font_britanica_bold cursor-pointer w-fit">
                        <Image src={arrow} alt="Back arrow" width={24} height={24} />
                        <span className='font_britanica_bold text-xl'>Back to Applicants</span>
                    </Link>

                    <h1 className="font_britanica_bold text-4xl text-black">{applicant.applicant_name}</h1>
                    
                    <div className="flex flex-col gap-6">
                        {applicant.application_values.map(item => renderField(item))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffApplicantProfilePage;