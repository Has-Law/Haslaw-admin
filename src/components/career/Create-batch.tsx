'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Batch, CreateBatchData, validateBatchData } from '@/lib/career';
import calendarIcon from '@/assets/career/calender.png'; 

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBatchData) => Promise<Batch | void>;
  initialData?: Batch | null;
  batchType: 'Internship' | 'Lawyers' | 'Staff';
}

const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose, onSubmit, initialData, batchType }) => {
  const router = useRouter();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CreateBatchData>({
    batch_name: '',
    batch_type: batchType,
    application_start: '',
    application_end: '',
    status: 'Open',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        // DIUBAH: Format data agar sesuai dengan input datetime-local
        // Ambil YYYY-MM-DDTHH:mm dari data server
        setFormData({
          batch_name: initialData.batch_name,
          batch_type: initialData.batch_type,
          application_start: initialData.application_start.slice(0, 16).replace(' ', 'T'),
          application_end: initialData.application_end.slice(0, 16).replace(' ', 'T'),
          status: initialData.status,
        });
      } else {
        setFormData({
          batch_name: '',
          batch_type: batchType,
          application_start: '',
          application_end: '',
          status: 'Open',
        });
      }
      setErrors([]);
      setApiError(null);
    }
  }, [isOpen, initialData, isEditMode, batchType]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent, continueToEditor: boolean = false) => {
    e.preventDefault();
    const validationErrors = validateBatchData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    setApiError(null);
    
    // DIUBAH: Mengonversi nilai dari datetime-local ke format server
    const payload = {
      ...formData,
      application_start: formData.application_start.replace('T', ' ') + ':00',
      application_end: formData.application_end.replace('T', ' ') + ':00',
    };

    try {
      const result = await onSubmit(payload);
      if (!isEditMode && continueToEditor && result) {
        router.push(`/careers/${batchType.toLowerCase()}/details/${result.id}`);
      }
      onClose();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-8 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font_britanica_bold text-black">{isEditMode ? 'Edit Batch' : 'Add Batch'}</h2>
          <button onClick={onClose} disabled={isLoading} className="text-3xl text-gray-500 hover:text-gray-800 leading-none">&times;</button>
        </div>
        
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            <p className="text-red-700">{apiError}</p>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, !isEditMode)}>
          {/* ... input batch_name ... */}
          <div>
              <label className="block text-black font_britanica_bold mb-2" htmlFor="batch_name">
                Batch Title <span className="text-red-500">*</span>
              </label>
              <input
                id="batch_name" name="batch_name" type="text"
                value={formData.batch_name} onChange={handleInputChange} disabled={isLoading}
                className="w-full px-4 py-4 text-xl border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]"
                placeholder="Enter Batch Title"
              />
            </div>
            
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            <div className="flex-1">
              <label className="block text-black font_britanica_bold mb-2" htmlFor="application_start">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {/* DIUBAH: Tipe input menjadi datetime-local */}
                <input
                  id="application_start" name="application_start" type="datetime-local"
                  value={formData.application_start} onChange={handleInputChange} disabled={isLoading}
                  className="w-full p-2 text-xl border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-black font_britanica_bold mb-2" htmlFor="application_end">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {/* DIUBAH: Tipe input menjadi datetime-local */}
                <input
                  id="application_end" name="application_end" type="datetime-local"
                  value={formData.application_end} onChange={handleInputChange} disabled={isLoading}
                  className="w-full p-2 text-xl border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B]"
                />
              </div>
            </div>
          </div>
          {/* ... input status dan tombol submit ... */}

          <div className="flex justify-end mt-8">
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-[#A0001B] text-white py-2 px-6 rounded-lg font_britanica_bold hover:bg-[#780014] transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Saving...' : (isEditMode ? 'Save' : 'Save and continue')}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;