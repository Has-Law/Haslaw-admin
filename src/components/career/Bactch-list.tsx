'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect,useCallback } from "react";
import { 
    getBatchesByType, 
    deleteBatch, 
    createBatch, 
    updateBatch, 
    formatDateRange, 
    Batch, 
    getApplicantsByBatchId, 
    CreateBatchData 
} from "@/lib/career";
import CustomNotification from "@/components/ui/Notification"; 
import BatchModal from "@/components/career/Create-batch"; 

import people from "@/assets/career/people.png";
import icEdit from "@/assets/news/edit.png";
import icDelete from "@/assets/news/delete.png";

interface BatchListProps {
    title: string;
    batchType: 'Internship' | 'Lawyers' | 'Staff';
}

const BatchList: React.FC<BatchListProps> = ({ title, batchType }) => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const fetchBatches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const baseBatches = await getBatchesByType(batchType);
            const applicantPromises = baseBatches.map(batch => getApplicantsByBatchId(batch.id));
            const applicantsByBatch = await Promise.all(applicantPromises);
            const batchesWithCounts = baseBatches.map((batch, index) => ({
                ...batch,
                applicant_count: applicantsByBatch[index].length,
            }));
            setBatches(batchesWithCounts);
        } catch (err) {
            setError(err instanceof Error ? `Failed to load ${batchType.toLowerCase()} batches` : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    },[batchType]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBatches();
        }, 500); 
        return () => clearTimeout(timer);
    }, [batchType,fetchBatches]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this batch?')) {
            try {
                await deleteBatch(id);
                showNotification('Batch deleted successfully!', 'success');
                await fetchBatches();
            } catch (err) {
                showNotification(err instanceof Error ? err.message : 'Failed to delete batch', 'error');
            }
        }
    };

    const handleOpenAddModal = () => {
        setEditingBatch(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (batch: Batch) => {
        setEditingBatch(batch);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: CreateBatchData): Promise<Batch | void> => {
        try {
            if (editingBatch) {
                await updateBatch(editingBatch.id, data);
                showNotification('Batch updated successfully!', 'success');
                setIsModalOpen(false);
                await fetchBatches();
            } else {
                const newBatch = await createBatch(data);
                showNotification('Batch created successfully!', 'success');
                setIsModalOpen(false);
                await fetchBatches(); 
                return newBatch;
            }
        } catch (error) {
            showNotification(error instanceof Error ? error.message : 'Operation failed', 'error');
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col p-4">
                <div className="flex flex-row justify-between items-center mb-6 gap-4">
                    <div className="h-8 bg-gray-200 rounded-md w-1/4 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[800px] space-y-2">
                        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg font_britanica_bold text-red-600">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <>
            {notification.show && ( <CustomNotification message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} /> )}
            
            <div className="flex flex-col p-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font_britanica_bold text-black">{title}</h2>
                    <button onClick={handleOpenAddModal} className="bg-[#A0001B] text-white px-4 py-2 rounded-lg font_britanica_bold hover:bg-[#4F000D] cursor-pointer flex items-center justify-center gap-2 w-auto">
                        + Add New Batch
                    </button>
                </div>

                {batches.length === 0 ? (
                    <div className="flex justify-center items-center h-64"><div className="text-lg font_britanica_bold text-gray-600">No {batchType.toLowerCase()} batches found</div></div>
                ) : (
                    <div className="overflow-x-auto">
                       <div className="min-w-[800px] text-left text-sm whitespace-nowrap">
                            <div className="font_britanica_bold text-black text-lg mb-2">
                                <div className="flex">
                                    <div className="px-6 py-3 bg-[#F5F5F5] rounded-l-xl w-16">No</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[150px]">Batch Name</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[280px]">Application Period</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] flex-1 min-w-[100px]">Applicants</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] flex-1  min-w-[150px]">Status</div>
                                    <div className="px-6 py-3 bg-[#F5F5F5] flex-shrink-0 rounded-r-xl w-44  text-center">Action</div>
                                </div>
                            </div>
                            <div className="font_britanica_bold space-y-1">
                                {batches.map((item, index) => (
                                    <div key={item.id} className="flex items-center text-base">
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-l-xl w-16">{index + 1}.</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[150px]">{item.batch_name}</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[280px]">{formatDateRange(item.application_start, item.application_end)}</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[100px]">{item.applicant_count || 0} Applicants</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[150px]">
                                            <Link href={`/careers/${batchType.toLowerCase()}/details/${item.id}`}>
                                                <span className={`cursor-pointer text-white px-3 py-1 rounded-md text-base transition-opacity hover:opacity-80 ${item.status === 'Open' ? 'bg-green-500' : 'bg-red-500'}`}>
                                                    {item.status}
                                                </span>
                                            </Link>
                                        </div>
                                        <div className="px-6 py-2 bg-[#F5F5F5] rounded-r-xl w-44 flex flex-shrink-0 justify-center items-center gap-4">
                                            <Link href={`/careers/${batchType.toLowerCase()}/details/${item.id}/applicants`} passHref>
                                                <button className="hover:opacity-75 cursor-pointer" title="View Applicants"><Image src={people} alt="View Applicants" className="w-8"/></button>
                                            </Link>
                                            <button onClick={() => handleOpenEditModal(item)} className="hover:opacity-75 cursor-pointer" title="Edit Batch"><Image src={icEdit} alt="Edit" className="w-8 mb-2"/></button>
                                            <button onClick={() => handleDelete(item.id)} className="hover:opacity-75 cursor-pointer" title="Delete Batch"><Image src={icDelete} alt="Delete" className="w-8 mb-2" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <BatchModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingBatch}
                batchType={batchType}
            />
        </>
    );
};

export default BatchList;