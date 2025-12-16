import React, { useRef } from 'react';
import { StyleOption } from '../types';
import { Sparkles, CheckCircle } from 'lucide-react';

interface StyleSelectorProps {
  styles: StyleOption[];
  selectedStyleId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyleId, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (styles.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-800">推荐风格</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styles.map((style) => {
            const isSelected = selectedStyleId === style.id;
            return (
                <div
                    key={style.id}
                    onClick={() => onSelect(style.id)}
                    className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSelected 
                            ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-white bg-white'
                        }
                    `}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-slate-800">{style.name}</span>
                        {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{style.description}</p>
                </div>
            );
        })}
      </div>
    </div>
  );
};
