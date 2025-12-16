import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, selectedFile, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 group">
        <img
          src={URL.createObjectURL(selectedFile)}
          alt="Product Preview"
          className="w-full h-full object-contain p-4"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
                onClick={onClear}
                className="bg-white text-red-600 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-red-50 flex items-center gap-2"
            >
                <X size={18} />
                移除图片
            </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
      />
      <div className="bg-indigo-100 p-4 rounded-full mb-4">
        <Upload className="w-8 h-8 text-indigo-600" />
      </div>
      <p className="text-lg font-medium text-slate-700">点击或拖拽上传商品图片</p>
      <p className="text-sm text-slate-500 mt-2">支持 JPG, PNG, WEBP 格式</p>
    </div>
  );
};
