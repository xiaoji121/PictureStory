import React, { useState, useEffect, useCallback } from 'react';
import { TONE_OPTIONS, MAX_NARRATIVE_LENGTH, AppStep } from './constants';
import { analyzeImagesAndGenerateNarratives as analyzeWithGemini } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import KeepsakeCanvas from './components/KeepsakeCanvas';
import ActionButton from './components/ActionButton';
import imageCompression from 'browser-image-compression';

const getHtml2Canvas = () => window.html2canvas;

const App = () => {
  const [appStep, setAppStep] = useState(AppStep.UPLOAD);
  const [allUploadedImages, setAllUploadedImages] = useState([]);
  
  const [aiNarratives, setAiNarratives] = useState(null);
  const [currentNarrative, setCurrentNarrative] = useState("");
  const [selectedTone, setSelectedTone] = useState(TONE_OPTIONS[0].value);

  const [isGeneratingNarratives, setIsGeneratingNarratives] = useState(false);
  const [isExportingKeepsake, setIsExportingKeepsake] = useState(false);
  const [error, setError] = useState(null);

  const handleImagesUploaded = useCallback((images) => {
    setAllUploadedImages(images);
    setAiNarratives(null);
    setCurrentNarrative("");
  }, []);

  const processImagesAndGenerateNarratives = async () => {
    if (allUploadedImages.length === 0) {
      setError("请至少上传一张图片。");
      return;
    }

    setIsGeneratingNarratives(true);
    setError(null);
    try {
      // 1. 压缩所有图片并转为base64
      const compressedImages = [];
      for (const fileObj of allUploadedImages) {
        const file = fileObj.originFileObj || fileObj.originFile || fileObj;
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        let compressedFile = file;
        try {
          compressedFile = await imageCompression(file, options);
        } catch (e) {
          // 压缩失败用原图
        }
        const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
        compressedImages.push({
          uid: fileObj.uid,
          name: fileObj.name,
          base64,
          originalFile: compressedFile,
          id: fileObj.id || fileObj.uid,
          type: fileObj.type || fileObj.originFileObj?.type || 'image/jpeg',
        });
      }

      // 2. 组装大模型需要的图片对象
      const compatibleImages = compressedImages.map(img => ({
        ...img,
        id: img.id || img.uid,
        type: img.type || 'image/jpeg'
      }));

      // 3. 只用Gemini模型
      const analysis = await analyzeWithGemini(compatibleImages);
      setAiNarratives(analysis.narratives);
      setCurrentNarrative(analysis.narratives[selectedTone] || "");
      setAppStep(AppStep.CREATE);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "AI处理过程中发生未知错误。");
      setAiNarratives({ child: "加载故事失败。", reminiscent: "加载故事失败。" });
      setCurrentNarrative("加载故事失败。");
    } finally {
      setIsGeneratingNarratives(false);
    }
  };
  
  useEffect(() => {
    if (aiNarratives) {
      setCurrentNarrative(aiNarratives[selectedTone] || "");
    }
  }, [selectedTone, aiNarratives]);

  const keepsakeData = {
    selectedImages: allUploadedImages,
    narrative: currentNarrative,
    tone: selectedTone,
    templateId: undefined,
  };

  const handleExportKeepsake = async () => {
    const html2canvas = getHtml2Canvas();
    if (!html2canvas) {
      setError("导出功能当前不可用。请尝试刷新页面。");
      return;
    }
    const canvasElement = document.getElementById('keepsakeCanvasOutput');
    if (canvasElement) {
      setIsExportingKeepsake(true);
      setError(null);
      try {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const canvas = await html2canvas(canvasElement, {
          scale: 2,
          useCORS: true,
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `keepsake-${Date.now()}.png`;
        link.href = image;
        link.click();
      } catch (e) {
        console.error("Error exporting keepsake:", e);
        setError("无法导出，请重试。");
      } finally {
        setIsExportingKeepsake(false);
      }
    } else {
        setError("未能找到要导出的元素。");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态背景 */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30"></div>
      
      {/* 主内容容器 */}
      <div className="relative z-10 flex flex-col items-center p-4 md:p-8 font-sans">
        <header className="w-full max-w-6xl mb-12 text-center pt-5">
          <div className="animate-float">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
              <span className="gradient-text">图文秀秀</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 font-light">
              让照片讲故事，让回忆更生动
            </p>
          </div>
        </header>
        
        {error && (
          <div className="w-full max-w-2xl p-6 mb-8 glass-dark  border border-red-500/20 text-red-600 backdrop-blur-lg animate-pulse-slow">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <p className="font-semibold text-lg">错误提示</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {appStep === AppStep.UPLOAD && (
          <section className="w-full max-w-4xl space-y-8">
            <div className="glass  p-8 shadow-premium card-hover">
              <ImageUploader
                onImagesUploaded={handleImagesUploaded}
              />
            </div>
            <div className="glass  p-8 shadow-premium space-y-6 card-hover">
              <ActionButton 
                onClick={processImagesAndGenerateNarratives} 
                disabled={allUploadedImages.length === 0 || isGeneratingNarratives}
                isLoading={isGeneratingNarratives}
                className="w-full text-lg py-4"
                variant="primary"
              >
                {isGeneratingNarratives ? "AI 创作中..." : "开始创作"}
              </ActionButton>
            </div>
          </section>
        )}

        {appStep === AppStep.CREATE && aiNarratives && (
          <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 h-fit">
              {/* AI 提供商信息卡片 */}
              <div className="glass  p-6 shadow-premium card-hover">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-800">AI 模型</h3>
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium text-primary-600">Google Gemini</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 风格选择卡片 */}
              <div className="glass  p-6 shadow-premium card-hover">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎨</span>
                  选择风格
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {TONE_OPTIONS.map(toneOpt => (
                    <ActionButton
                      key={toneOpt.value}
                      onClick={() => setSelectedTone(toneOpt.value)}
                      variant={selectedTone === toneOpt.value ? 'primary' : 'secondary'}
                      className={
                        selectedTone === toneOpt.value
                          ? 'bg-gradient-to-br from-primary-500 to-secondary-400 text-white font-bold border-2 border-primary-500 shadow-lg scale-105 ring-2 ring-primary-300 ring-offset-2 transition-all duration-200'
                          : 'bg-white/70 text-neutral-500 border border-neutral-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 font-normal transition-all duration-200'
                      }
                      disabled={isGeneratingNarratives || isExportingKeepsake}
                    >
                      {toneOpt.label}
                    </ActionButton>
                  ))}
                </div>
              </div>

              {/* 编辑故事卡片 */}
              <div className="glass  p-6 shadow-premium card-hover">
                <h3 className="text-xl font-semibold text-neutral-800 mb-2 flex items-center">
                  <span className="text-2xl mr-2">✍️</span>
                  编辑故事
                </h3>
                <p className="text-xs text-neutral-500 mb-3">
                  最多约 {Math.floor(MAX_NARRATIVE_LENGTH * 1.5)} 字符 • 当前: {currentNarrative.length}
                </p>
                <textarea
                  value={currentNarrative}
                  onChange={(e) => setCurrentNarrative(e.target.value.slice(0, Math.floor(MAX_NARRATIVE_LENGTH * 1.5)))}
                  rows={6}
                  className="w-full p-4 bg-white/50 border border-neutral-200  focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all keepsake-text resize-none"
                  placeholder="您的故事将显示在此处..."
                  disabled={isGeneratingNarratives || isExportingKeepsake} 
                />
              </div>

              {/* 操作按钮组 */}
              <div className="space-y-3">
                <ActionButton 
                  onClick={handleExportKeepsake} 
                  className="w-full py-4 text-lg" 
                  variant="primary" 
                  disabled={isExportingKeepsake}
                  isLoading={isExportingKeepsake}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                >
                  {isExportingKeepsake ? "生成中..." : "下载图片(不如直接截图)"}
                </ActionButton>
                
                <button 
                  onClick={() => {
                    setAppStep(AppStep.UPLOAD);
                    setAllUploadedImages([]);
                    setAiNarratives(null);
                  }} 
                  className="w-full py-3 px-6 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100/50  transition-all"
                >
                  重新开始
                </button>
              </div>
            </aside>

            <section className="lg:col-span-2 flex flex-col items-center">
              <div className="glass  p-8 shadow-premium w-full card-hover">
                <h2 className="text-2xl font-semibold text-neutral-800 mb-6 text-center flex items-center justify-center">
                  <span className="text-3xl mr-3">✨</span>
                  作品预览
                </h2>
                <KeepsakeCanvas
                  canvasId="keepsakeCanvasOutput"
                  data={keepsakeData}
                  onTextChange={setCurrentNarrative}
                  isEditable={!(isGeneratingNarratives || isExportingKeepsake)} 
                />
              </div>
            </section>
          </main>
        )}

        <footer className="w-full max-w-6xl mt-16 pt-8 border-t border-neutral-200/50 text-center">
          <p className="text-neutral-600 text-sm font-light">
            © {new Date().getFullYear()} 图文秀秀 • 用 AI 让回忆更美好
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;