import React from 'react';
import { AspectRatio } from '../types';
import { Settings, Image as ImageIcon, Layers } from 'lucide-react';

interface ConfigPanelProps {
  ratio: AspectRatio;
  setRatio: (r: AspectRatio) => void;
  count: number;
  setCount: (c: number) => void;
  disabled: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ ratio, setRatio, count, setCount, disabled }) => {
  
  const ratios: { value: AspectRatio; label: string; desc: string }[] = [
    { value: '16:9', label: '横幅 Banner (16:9)', desc: '适用于头图/品牌故事' },
    { value: '1:1', label: '方形 (1:1)', desc: '适用于标准图文模块' },
    { value: '9:16', label: '竖屏 (9:16)', desc: '适用于移动端/快拍' },
    { value: '3:4', label: '纵向 (3:4)', desc: '突出商品主体' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Settings className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-800">生成设置</h3>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> 图片比例
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ratios.map((r) => (
            <button
              key={r.value}
              onClick={() => setRatio(r.value)}
              disabled={disabled}
              className={`
                p-3 rounded-lg text-left text-sm border transition-all
                ${ratio === r.value 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600' 
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="font-medium">{r.label}</div>
              <div className="text-xs opacity-70 mt-1">{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Layers className="w-4 h-4" /> 生成数量
        </label>
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
           <input 
            type="range" 
            min="1" 
            max="4" 
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value))}
            disabled={disabled}
            className="w-full accent-indigo-600 cursor-pointer"
           />
           <span className="font-bold text-slate-700 w-8 text-center">{count}</span>
        </div>
        <p className="text-xs text-slate-500">基于选中风格生成 {count} 张变体。</p>
      </div>
    </div>
  );
};
