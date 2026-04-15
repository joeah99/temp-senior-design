import React, { useState, useCallback } from 'react';
import { UploadCloud, AlertCircle, FileText, Loader2, X } from 'lucide-react';

interface ExtractedLoanDocument {
  lender_name?: string;
  loan_name?: string;
  loan_amount?: number;
  interest_rate?: number;
  loan_term_years?: number;
  loan_start_month?: string;
  loan_start_year?: string;
}

interface AiLoanUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExtractedLoanDocument) => void;
}

export default function AiLoanUploadModal({ isOpen, onClose, onSave }: AiLoanUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/documents/extract/loan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.warn('Failed to extract loan document data. Proceeding to blank form.');
        onSave({});
      } else {
        const data = await response.json();
        onSave({
          lender_name: data.lender_name || '',
          loan_name: data.loan_name || '',
          loan_amount: data.loan_amount,
          interest_rate: data.interest_rate,
          loan_term_years: data.loan_term_years,
          loan_start_month: data.loan_start_month,
          loan_start_year: data.loan_start_year,
        });
      }
      
      // Delay closing slightly so user sees form transition naturally
      setTimeout(() => {
          onClose(); 
          setIsUploading(false);
          setFile(null);
      }, 300);
    } catch (err: any) {
      console.error(err);
      onSave({});
      setTimeout(() => {
          onClose(); 
          setIsUploading(false);
          setFile(null);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-dpa-dark-green" />
            Upload Loan Document via AI
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
                ${file ? 'border-dpa-dark-green bg-green-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              {!file ? (
                <>
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 font-medium mb-1">Drag and drop your loan document or promissory note here</p>
                  <p className="text-xs text-gray-400 mb-4">Supported formats: JPG, PNG, PDF</p>
                  <label className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 cursor-pointer shadow-sm hover:bg-gray-50 transition-colors">
                    Browse Files
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileInput} />
                  </label>
                </>
              ) : (
                <>
                  <FileText className="w-10 h-10 text-dpa-dark-green mb-3" />
                  <p className="text-sm font-bold text-gray-800 mb-1">{file.name}</p>
                  <p className="text-xs text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                    className="text-sm px-4 py-1.5 mt-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    Remove File
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-2 items-start text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-dpa-dark-green text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors w-full sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  'Extract Data'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
