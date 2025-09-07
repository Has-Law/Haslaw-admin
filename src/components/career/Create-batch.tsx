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

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setFormData({
          batch_name: initialData.batch_name,
          batch_type: initialData.batch_type,
          application_start: initialData.application_start.slice(0, 10),
          application_end: initialData.application_end.slice(0, 10),
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
    }
  }, [isOpen, initialData, isEditMode, batchType]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, continueToEditor: boolean = false) => {
    e.preventDefault();
    const validationErrors = validateBatchData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    try {
      const result = await onSubmit(formData);
      if (!isEditMode && continueToEditor && result) {
        router.push(`/careers/${batchType.toLowerCase()}/details/${result.id}`);
      }
    } catch (error) {
       console.error("Failed to submit batch form:", error);
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
        
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            <ul className="list-disc list-inside text-red-700">
              {errors.map((error, index) => <li key={index}>{error}</li>)}
            </ul>
          </div>
        )}

        <form>
          <div className="space-y-6">
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
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-black font_britanica_bold mb-2" htmlFor="application_start">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="application_start" name="application_start" type="date"
                    value={formData.application_start} onChange={handleInputChange} disabled={isLoading}
                    className="w-full p-2 text-xl border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B] custom-date-icon"
                  />
                  <Image src={calendarIcon} alt="Calendar" width={28} height={28} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"/>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-black font_britanica_bold mb-2" htmlFor="application_end">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="application_end" name="application_end" type="date"
                    value={formData.application_end} onChange={handleInputChange} disabled={isLoading}
                    className="w-full p-2 text-xl border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B] custom-date-icon"
                  />
                  <Image src={calendarIcon} alt="Calendar" width={28} height={28} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"/>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            {isEditMode ? (
              <button 
                type="button" onClick={(e) => handleSubmit(e)} disabled={isLoading}
                className="bg-[#A0001B] text-white py-2 px-12 rounded-lg font_britanica_bold hover:bg-[#780014] transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <button 
                type="button" onClick={(e) => handleSubmit(e, true)} disabled={isLoading}
                className="bg-[#A0001B] text-white py-2 px-6 rounded-lg font_britanica_bold hover:bg-[#780014] transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Saving...' : 'Save and continue to editor form'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;