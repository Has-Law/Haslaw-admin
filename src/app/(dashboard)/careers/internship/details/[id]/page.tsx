'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import {
    getBatchById,
    Batch,
    getFieldsByBatchId,
    FormField,
    deleteField,
    createField,
    updateField,
    CreateFieldData
} from '@/lib/career';
import FieldModal from '@/components/career/Create-field';
import CustomNotification from '@/components/ui/Notification';
import arrow from '@/assets/news/arrow.png';
import icEdit from "@/assets/news/edit.png";
import icDelete from "@/assets/news/delete.png";

const InternshipDetailsPage = () => {
    const params = useParams();
    const batchId = params?.id ? Number(params.id) : null;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<FormField | null>(null);

    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error'
    }>({ show: false, message: '', type: 'success' });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const fetchFields = useCallback(async () => {
        if (!batchId) return;
        try {
            const fieldsData = await getFieldsByBatchId(batchId);
            setFormFields(fieldsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat form fields');
        }
    }, [batchId]);

    useEffect(() => {
        if (batchId) {
            const fetchData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const batchData = await getBatchById(batchId);
                    setBatch(batchData);
                    await fetchFields();
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Tidak dapat menemukan detail batch.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [batchId, fetchFields]);

    const handleDelete = async (fieldId: number) => {
        if (window.confirm('Anda yakin ingin menghapus field ini?')) {
            try {
                await deleteField(fieldId);
                showNotification('Field berhasil dihapus!', 'success');
                await fetchFields();
            } catch (err) {
                showNotification(err instanceof Error ? err.message : 'Gagal menghapus field.', 'error');
            }
        }
    };

    const handleOpenAddModel = () => {
        setEditingField(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModel = (field: FormField) => {
        setEditingField(field);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: CreateFieldData) => {
        try {
            if (editingField) {
                await updateField(editingField.id, data);
                showNotification('Field berhasil diperbarui!', 'success');
            } else {
                if (!batchId) return;
                await createField(batchId, data);
                showNotification('Field berhasil ditambahkan!', 'success');
            }
            setIsModalOpen(false);
            await fetchFields();
        } catch (err) {
            showNotification(err instanceof Error ? err.message : 'Terjadi kesalahan.', 'error');
            throw err;
        }
    };

    if (isLoading) return (
            <div className='p-4'>
                <div className="flex flex-col bg-white p-4 sm:p-8 rounded-2xl shadow-lg min-h-screen animate-pulse">
                    <div className="h-7 w-64 bg-gray-200 rounded-md mb-6"></div>
                    <div className="h-10 w-3/4 bg-gray-200 rounded-md mb-6"></div>
                                        <div className="space-y-2">
                        <div className="h-14 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="h-10 w-48 bg-gray-200 rounded-lg mt-4"></div>
                </div>
            </div>
        );
    if (error) return <div className="p-8 text-center text-red-500 font_britanica_bold text-xl">{error}</div>;

    return (
        <>
            {notification.show && (
                <CustomNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}

            <div className='p-4'>
                <div className="flex flex-col bg-white p-4 sm:p-8 rounded-2xl shadow-lg min-h-screen">
                    <Link href="/careers" className="flex items-center gap-2 text-[#4F000D] hover:text-[#A0001B] font_britanica_bold cursor-pointer w-fit mb-6">
                        <Image src={arrow} alt="Back arrow" width={24} height={24} />
                        <span className='font_britanica_bold text-xl'>Back to Career Dashboard</span>
                    </Link>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-4xl font_britanica_bold text-black">{batch?.batch_name} - Form Fields</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[700px] text-left text-sm whitespace-nowrap">
                            <div className="font_britanica_bold text-black text-lg mb-2">
                                <div className="flex">
                                    <div className="px-6 py-3 bg-[#F5F5F5] rounded-l-xl w-16">No</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[200px]">Field Label</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[100px]">Input Type</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] w-32 text-center">Status</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] rounded-r-xl w-40 text-center">Action</div>
                                </div>
                            </div>
                            <div className="font_britanica_bold space-y-1">
                                {formFields.length > 0 ? formFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center text-base">
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-l-xl w-16">{index + 1}.</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[200px]">{field.field_label}</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[100px]">{field.input_type}</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] w-32 text-center">
                                            <span className={`text-white px-3 py-1 rounded-md text-xs font-semibold ${field.is_required ? 'bg-red-500' : 'bg-gray-400'}`}>
                                                {field.is_required ? 'Required' : 'Optional'}
                                            </span>
                                        </div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-r-xl w-40 flex justify-center items-center gap-4">
                                            <button title="Edit Field" onClick={() => handleOpenEditModel(field)} className="hover:opacity-75 cursor-pointer">
                                                <Image src={icEdit} alt="Edit" width={24} height={24} />
                                            </button>
                                            <button title="Delete Field" onClick={() => handleDelete(field.id)} className="hover:opacity-75 cursor-pointer">
                                                <Image src={icDelete} alt="Delete" width={24} height={24} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 bg-[#F5F5F5] rounded-xl mt-2">
                                        Tidak ada form field. Tambahkan untuk memulai!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenAddModel}
                        className="bg-white w-fit mt-4 text-[#A0001B] border border-[#A0001B] px-4 py-2 rounded-lg font_britanica_bold hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        + Add New Field
                    </button>
                </div>
            </div>

            <FieldModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingField}
            />
        </>
    );
};

export default InternshipDetailsPage;