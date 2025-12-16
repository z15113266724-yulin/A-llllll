import React from 'react';
import { GeneratedImage } from '../types';
import { Download, ExternalLink, Loader2 } from 'lucide-react';

interface ResultsGridProps {
  images: GeneratedImage[];
  loading: boolean;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ images, loading }) => {
  
  const handleDownload = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `amazon-a-plus-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-indigo-200">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-800">正在生成素材...</h3>
        <p className="text-slate-500">这可能需要一点时间，请稍候。</p>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-800">生成的素材</h2>
         <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            {images.length} 张图片
         </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((img) => (
          <div key={img.id} className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="aspect-auto w-full bg-slate-100 relative">
               <img 
                 src={img.url} 
                 alt="Generated A+ Content" 
                 className="w-full h-auto object-cover"
               />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                 <button
                    onClick={() => handleDownload(img.url, img.id)}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-indigo-50 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                 >
                    <Download size={18} />
                    下载 PNG
                 </button>
               </div>
            </div>
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">风格: <span className="text-slate-900 font-medium">{img.styleName}</span></span>
                    <span className="text-slate-400 font-mono text-xs">{img.ratio}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
