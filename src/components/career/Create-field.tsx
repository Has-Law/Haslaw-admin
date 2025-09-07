'use client';

import { useState, useEffect, useRef } from 'react';
import { FormField } from '@/lib/career';
import arrowDown from '@/assets/news/arrow-down.png'; 
import Image from 'next/image';

interface FieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { field_label: string; input_type: string; is_required: boolean }) => Promise<void>;
  initialData?: FormField | null;
}

const INPUT_TYPE_OPTIONS = [
  'Short Text',
  'Email',
  'Paragraph',
  'Dropdown',
  'File Upload',
];

const FieldModal: React.FC<FieldModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [fieldLabel, setFieldLabel] = useState('');
  const [inputType, setInputType] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setValidationErrors([]);
      setIsLoading(false);
      
      if (initialData) {
        setFieldLabel(initialData.field_label);
        setInputType(initialData.input_type);
        setIsRequired(initialData.is_required);
      } else {
        setFieldLabel('');
        setInputType('');
        setIsRequired(false);
      }
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const errors: string[] = [];
    if (!fieldLabel.trim()) errors.push('Field Label is required.');
    if (!inputType) errors.push('Input Type is required.');

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ field_label: fieldLabel, input_type: inputType, is_required: isRequired });
    } catch (error) {
      console.error("Submit failed, parent will notify:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-8 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font_britanica_bold text-black">{isEditMode ? 'Edit Career Form' : 'Career Forms'}</h2>
          <button onClick={onClose} disabled={isLoading} className="text-3xl text-gray-500 hover:text-gray-800 leading-none disabled:opacity-50">&times;</button>
        </div>
        
        {validationErrors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <ul className="list-disc list-inside text-red-700">
                    {validationErrors.map((error, index) => <li key={index}>{error}</li>)}
                </ul>
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-800 font_britanica_bold mb-2" htmlFor="fieldLabel">
              Field Label <span className="text-[#A0001B]">*</span>
            </label>
            <input
              id="fieldLabel"
              type="text"
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0001B] disabled:bg-gray-100"
              placeholder="Enter Field Label"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-5">
            <label className="block text-gray-800 font_britanica_bold mb-2">
              Input Type <span className="text-[#A0001B]">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex justify-between items-center px-4 py-2 text-left border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#A0001B] cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    <span className={inputType ? 'text-black' : 'text-gray-400'}>
                        {inputType || "Choose Type"}
                    </span>
                    <Image src={arrowDown} alt="arrow" width={20} height={20} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-y-auto max-h-48 transition-all duration-300 ease-in-out ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <ul>
                        {INPUT_TYPE_OPTIONS.map((option, index) => (
                            <li key={index} onClick={() => { setInputType(option); setIsDropdownOpen(false); }} className="p-3 hover:bg-gray-100 cursor-pointer transition-colors">
                                {option}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
          
          <div className="mt-8 mb-8">
            <label className={`flex items-center gap-3 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="h-5 w-5 rounded-full accent-[#A0001B]"
                disabled={isLoading}
              />
              <span className="text-gray-800 font_britanica_bold">Make this field required</span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#A0001B] text-white py-2 px-10 rounded-lg font_britanica_bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#780014]"
            >
              {isLoading ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldModal;