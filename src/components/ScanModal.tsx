import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Sparkles, Check, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { UserProfile, ScanResult, CuisineType } from '../types/nutrition.ts';
import { AudioTranscriberButton } from './AudioTranscriberButton.tsx';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onScanSuccess: (result: ScanResult, imageUrl: string) => void;
  onOpenPaywall: () => void;
  onIncrementScanCount: () => void;
}

const SAMPLE_REGIONAL_MEALS = [
  {
    title: 'Hyderabadi Dum Biryani',
    cuisine: 'South Asian',
    region: 'Hyderabad',
    image: '/src/assets/images/regional_biryani_platter_1792609756511.jpg',
    desc: 'Spiced chicken, basmati, saffron, fried shallots & raita',
  },
  {
    title: 'Tacos al Pastor',
    cuisine: 'Mexican',
    region: 'CDMX',
    image: '/src/assets/images/regional_tacos_pastor_1792609756799.jpg',
    desc: 'Marinated pork, warm corn tortillas, pineapple & salsa',
  },
  {
    title: 'Tonkotsu Ramen',
    cuisine: 'East Asian',
    region: 'Hakata, Japan',
    image: '/src/assets/images/regional_tonkotsu_ramen_1792609757733.jpg',
    desc: 'Pork bone broth, chashu belly, ajitama egg & noodles',
  },
  {
    title: 'Pho Bo Dac Biet',
    cuisine: 'Southeast Asian',
    region: 'Vietnam',
    image: '/src/assets/images/regional_pho_dac_biet_1792609757829.jpg',
    desc: '12hr bone broth, rare beef flank, star anise, rice noodles',
  },
];

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onScanSuccess,
  onOpenPaywall,
  onIncrementScanCount,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStageText, setScanStageText] = useState('Decomposing regional ingredients...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cuisineFilter, setCuisineFilter] = useState<CuisineType>(userProfile.cuisineFocus || 'All Regional');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const scansRemaining = userProfile.isPro ? 999 : Math.max(0, 3 - userProfile.dailyScansUsed);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sampleImage: string) => {
    setSelectedImage(sampleImage);
    setErrorMessage(null);
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    // Check paywall limits
    if (!userProfile.isPro && userProfile.dailyScansUsed >= 3) {
      onOpenPaywall();
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);

    // Dynamic scanning stages simulation
    const stages = [
      'Scanning culinary morphology & textures...',
      'Identifying authentic regional dish signatures...',
      'Detecting cooking fats (ghee, lard, sesame, oils)...',
      'Calculating portion volume and macronutrients...',
    ];
    let stageIdx = 0;
    const interval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setScanStageText(stages[stageIdx]);
    }, 800);

    try {
      let base64ToSend = selectedImage;
      if (selectedImage.startsWith('/src/assets/images/')) {
        const resp = await fetch(selectedImage);
        const blob = await resp.blob();
        base64ToSend = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64ToSend,
          mimeType: 'image/jpeg',
          cuisineContext: cuisineFilter,
          additionalNotes: notes,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        onIncrementScanCount();
        setIsScanning(false);
        onScanSuccess(resData.data, selectedImage);
      } else {
        throw new Error(resData.error || 'Failed to analyze food');
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsScanning(false);
      setErrorMessage(err.message || 'Error communicating with vision server');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 dark:bg-stone-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200/40 dark:border-amber-800/40">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Snap Regional Food Photo
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                AI vision trained on authentic culinary preparations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Scan Limit Alert for Free tier */}
          {!userProfile.isPro && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold tabular-nums">{scansRemaining}</span>
                <span>free scans remaining today</span>
              </div>
              <button
                onClick={onOpenPaywall}
                className="font-bold underline text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100"
              >
                Get Unlimited
              </button>
            </div>
          )}

          {/* Photo Dropzone or Preview */}
          <div className="relative rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors bg-stone-50 dark:bg-stone-850 overflow-hidden min-h-[220px] flex flex-col items-center justify-center">
            {selectedImage ? (
              <div className="relative w-full h-64 bg-stone-900 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Food to analyze"
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Overlay when Scanning */}
                {isScanning && (
                  <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6">
                    <div className="relative w-48 h-48 border-2 border-amber-400/80 rounded-2xl flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-bounce" />
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                    <p className="text-xs font-semibold text-amber-300 mt-4 tracking-wide text-center">
                      {scanStageText}
                    </p>
                    <span className="text-[10px] text-stone-300 mt-1">
                      Calibrating regional ingredients & portion grams
                    </span>
                  </div>
                )}

                {!isScanning && (
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-3 right-3 bg-stone-900/80 text-white p-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-stone-900"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 text-center cursor-pointer space-y-3 w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    Take a photo or upload meal image
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Supports JPG, PNG, WEBP from phone camera or gallery
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-stone-900 dark:bg-amber-600 hover:bg-stone-800 dark:hover:bg-amber-500 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Browse Files / Camera
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
              }}
            />
          </div>

          {/* Quick Regional Sample Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Or try a curated regional sample dish:</span>
              <span className="text-[11px] text-stone-400 dark:text-stone-500">1-click test</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_REGIONAL_MEALS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.image)}
                  className={`text-left rounded-xl p-2 border transition-all relative overflow-hidden group ${
                    selectedImage === sample.image
                      ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 ring-2 ring-amber-600/20'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-850'
                  }`}
                >
                  <div className="w-full h-16 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 mb-1.5 relative">
                    <img
                      src={sample.image}
                      alt={sample.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 dark:text-stone-100 truncate">
                    {sample.title}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {sample.region}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine Context Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Regional Cuisine Focus
              </label>
              <select
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value as CuisineType)}
                className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="All Regional">All Regional Cuisines</option>
                <option value="South Asian">South Asian / Indian</option>
                <option value="Mexican">Mexican & Latin American</option>
                <option value="East Asian">East Asian (Japanese, Korean)</option>
                <option value="Southeast Asian">Southeast Asian (Thai, Vietnamese)</option>
                <option value="Mediterranean">Mediterranean & Middle Eastern</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Preparation Notes (Optional)
                </label>
                <span className="text-[10px] text-stone-400">Speak or type</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. extra ghee, double roti, no sauce"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <AudioTranscriberButton
                  size="sm"
                  onTranscribe={(txt) => setNotes(prev => (prev ? `${prev}, ${txt}` : txt))}
                />
              </div>
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedImage || isScanning}
            onClick={startAnalysis}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Photo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Meal & Portions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
