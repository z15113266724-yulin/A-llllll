import React, { useState, useEffect } from 'react';
import { UploadArea } from './components/UploadArea';
import { StyleSelector } from './components/StyleSelector';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultsGrid } from './components/ResultsGrid';
import { ProductAnalysis, GeneratedImage, AspectRatio } from './types';
import { analyzeProductImage, generateAPlusImage } from './services/geminiService';
import { Wand2, AlertCircle, ShoppingBag } from 'lucide-react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config State
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [count, setCount] = useState<number>(2);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Effect: Analyze image when file changes
  useEffect(() => {
    if (file) {
      handleAnalyze(file);
    } else {
      setAnalysis(null);
      setSelectedStyleId(null);
      setGeneratedImages([]);
    }
  }, [file]);

  const handleAnalyze = async (uploadedFile: File) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeProductImage(uploadedFile);
      setAnalysis(result);
      if (result.suggestedStyles.length > 0) {
        setSelectedStyleId(result.suggestedStyles[0].id);
      }
    } catch (err: any) {
      setError(err.message || "分析图片失败，请重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!file || !analysis || !selectedStyleId) return;
    
    setIsGenerating(true);
    setError(null);

    const style = analysis.suggestedStyles.find(s => s.id === selectedStyleId);
    if (!style) return;

    try {
      // Generate multiple images in parallel
      const promises = Array(count).fill(null).map(async (_, index) => {
        const url = await generateAPlusImage(file, analysis, style, ratio);
        return {
          id: `${Date.now()}-${index}`,
          url,
          styleName: style.name,
          ratio,
          timestamp: Date.now()
        };
      });

      const newImages = await Promise.all(promises);
      setGeneratedImages(prev => [...newImages, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError("生成失败，请检查您的 API Key 并重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              亚马逊 A+ 宣传图生成器
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            由 Gemini 2.5 Flash 提供支持
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Upload */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                商品图片
              </h2>
              <UploadArea 
                selectedFile={file} 
                onFileSelect={setFile} 
                onClear={() => setFile(null)}
              />
              
              {isAnalyzing && (
                <div className="mt-4 flex items-center gap-3 text-indigo-600 text-sm font-medium animate-pulse">
                  <Wand2 className="w-4 h-4 animate-spin" />
                  正在分析商品特征...
                </div>
              )}

              {analysis && !isAnalyzing && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-1">识别到的商品</div>
                  <div className="font-medium text-indigo-900">{analysis.productName}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.keyFeatures.map((feature, i) => (
                      <span key={i} className="px-2 py-1 bg-white text-indigo-700 text-xs rounded-full border border-indigo-100 shadow-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Step 2: Config */}
            {analysis && (
              <ConfigPanel 
                ratio={ratio} 
                setRatio={setRatio} 
                count={count} 
                setCount={setCount}
                disabled={isGenerating}
              />
            )}

          </div>

          {/* Right Column: Styles & Results */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Style Selection */}
            {analysis && (
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    选择风格
                </h2>
                <StyleSelector 
                  styles={analysis.suggestedStyles}
                  selectedStyleId={selectedStyleId}
                  onSelect={setSelectedStyleId}
                  loading={isAnalyzing}
                />

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedStyleId}
                    className={`
                      w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2
                      ${isGenerating || !selectedStyleId 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {isGenerating ? (
                      <>
                        <Wand2 className="w-5 h-5 animate-spin" /> 生成中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" /> 生成 A+ 宣传图
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}

            {/* Results */}
            <ResultsGrid images={generatedImages} loading={isGenerating} />
            
            {!analysis && !isAnalyzing && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                 <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                 <p>上传商品图片开始生成</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
