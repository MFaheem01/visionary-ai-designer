
import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Trash2,
  Layers,
  Layout,
  Image as ImageIcon,
  Palette,
  Home,
  Download,
  AlertCircle,
  Loader2,
  ChevronRight,
  Info
} from 'lucide-react';
import { DesignType, UploadedImage, DesignResult } from './types';
import { generateDesign, hasApiKeySelected, openApiKeySelector } from './services/gemini';
import { Link } from 'react-router-dom';

const DESIGN_OPTIONS = [
  { type: DesignType.LOGO, icon: Palette, description: 'Brand identities and logos' },
  { type: DesignType.WEB_UI, icon: Layout, description: 'User interfaces and web mockups' },
  { type: DesignType.SOCIAL_POST, icon: Layers, description: 'Creative social media content' },
  { type: DesignType.INTERIOR, icon: Home, description: 'Space and architectural concepts' },
  { type: DesignType.ARTISTIC, icon: ImageIcon, description: 'Creative re-interpretations' },
];

const App: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [instruction, setInstruction] = useState('');
  const [selectedType, setSelectedType] = useState<DesignType>(DesignType.WEB_UI);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<DesignResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highQuality, setHighQuality] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your vision...');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Added explicit type casting to File[] to resolve TS errors where 'file' was inferred as 'unknown'
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        const newImage: UploadedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          base64: base64,
          mimeType: file.type
        };
        setImages(prev => [...prev, newImage].slice(-3)); // Limit to 3 images
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image to start designing.");
      return;
    }

    setError(null);

    // Handle API Key for High Quality (Pro model)
    if (highQuality) {
      const hasKey = await hasApiKeySelected();
      if (!hasKey) {
        await openApiKeySelector();
        // After opening selector, we assume they proceed
      }
    }

    setIsGenerating(true);
    setLoadingMessage('Initializing creative engine...');

    const messages = [
      'Deconstructing visual elements...',
      'Synthesizing new design concepts...',
      'Applying professional color theory...',
      'Polishing high-fidelity details...',
      'Finalizing your masterpiece...'
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[msgIndex]);
      msgIndex = (msgIndex + 1) % messages.length;
    }, 3000);

    try {
      const result = await generateDesign({
        images,
        instruction,
        designType: selectedType,
        highQuality
      });
      setResults(prev => [result, ...prev]);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key configuration error. Please try resetting your key.");
        await openApiKeySelector();
      } else {
        setError(err.message || "An unexpected error occurred during design generation.");
      }
    } finally {
      setIsGenerating(false);
      clearInterval(interval);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="min-h-screen text-slate-200 pb-20">
        {/* Header */}
        <nav className="glass sticky top-0 z-50 px-6 py-4 mb-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-heading tracking-tight text-white">Visionary<span className="text-indigo-400">AI..</span></span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/studio" className="hover:text-indigo-400 transition-colors">Studio</Link>
              <Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link>
              <Link to="/documentaion" className="hover:text-indigo-400 transition-colors">Documentation</Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Input Sidebar */}
          <aside className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
                <Upload className="w-6 h-6 text-indigo-400" />
                Upload Source
              </h2>
              <p className="text-slate-400 text-sm">
                Upload up to 3 images (sketches, logos, or reference photos).
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 transition-all cursor-pointer bg-slate-900/50 group flex flex-col items-center justify-center gap-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="p-4 bg-slate-800 rounded-full group-hover:bg-indigo-900/30 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">Click to upload or drag and drop</p>
                  <p className="text-slate-500 text-xs mt-1">PNG, JPG or WEBP (max 10MB each)</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map(img => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square ring-1 ring-slate-700">
                      <img src={img.url} className="w-full h-full object-cover" alt="Source" />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-400" />
                Design Type
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DESIGN_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${selectedType === opt.type
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedType === opt.type ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{opt.type}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                Instructions
              </h2>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="E.g., Transform this rough sketch into a modern SaaS landing page mockup with a dark theme and neon accents..."
                className="w-full h-32 bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 focus:border-indigo-500 focus:outline-none transition-all resize-none text-slate-200"
              />
            </section>

            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border-2 border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Ultra HD Mode</div>
                    <div className="text-xs text-slate-500">Uses Gemini 3 Pro (requires billing)</div>
                  </div>
                </div>
                <button
                  onClick={() => setHighQuality(!highQuality)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${highQuality ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${highQuality ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              {highQuality && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>Using Ultra HD Mode requires a valid API key with billing enabled. You will be prompted to select one if not already set.</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || images.length === 0}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isGenerating || images.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]'
                  }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generating Design...
                  </>
                ) : (
                  <>
                    Generate Masterpiece
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </section>
          </aside>

          {/* Results Area */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black font-heading text-white">Result Gallery</h2>
              <div className="text-sm text-slate-500">{results.length} designs created</div>
            </div>

            {results.length === 0 && !isGenerating && (
              <div className="h-[500px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-4 bg-slate-900/20">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-400">Your designs will appear here..</p>
                  <p className="text-sm mt-1 max-w-xs mx-auto">Upload an image and click generate to start your creative journey.</p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="h-[500px] bg-slate-900 border-2 border-indigo-500/30 rounded-3xl flex flex-col items-center justify-center gap-6 overflow-hidden relative">
                <div className="absolute inset-0 shimmer opacity-20 pointer-events-none"></div>
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
                  <Sparkles className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center space-y-2 z-10">
                  <p className="text-2xl font-bold font-heading text-white">{loadingMessage}</p>
                  <p className="text-slate-500 text-sm italic">Great things take a moment to manifest...</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              {results.map((result) => (
                <div key={result.id} className="group glass rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="relative aspect-square sm:aspect-video lg:aspect-square xl:aspect-video bg-black overflow-hidden">
                    <img
                      src={result.imageUrl}
                      alt="Generated Design"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                      <div className="flex gap-3">
                        <button
                          onClick={() => downloadImage(result.imageUrl, `design-${result.id}.png`)}
                          className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          Download 4K
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-500/20">
                          {result.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-relaxed">
                      {result.prompt || "Generated masterpiece based on source visuals."}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-900 pt-10 px-6 text-center text-slate-500 text-sm">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="font-heading font-bold text-slate-300">Visionary AI</span>
            </div>
            <p>© 2026 Built FeeMo.... Professional creativity for the modern world.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default App;
