import React, { useRef, useState } from 'react';
import { X, Upload, RotateCcw, Camera, Heart, Shield, Check, Info } from 'lucide-react';
import { useAvatars, processAvatarFile } from '../../context/AvatarContext';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    nilaAvatar,
    farhanAvatar,
    hasCustomNila,
    hasCustomFarhan,
    setNilaAvatar,
    setFarhanAvatar,
    resetNilaAvatar,
    resetFarhanAvatar,
  } = useAvatars();

  const nilaInputRef = useRef<HTMLInputElement>(null);
  const farhanInputRef = useRef<HTMLInputElement>(null);

  const [nilaError, setNilaError] = useState(false);
  const [farhanError, setFarhanError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleFile = async (file: File, target: 'nila' | 'farhan') => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP, etc.)');
      return;
    }
    try {
      setIsProcessing(true);
      const processedUrl = await processAvatarFile(file, 400);
      if (target === 'nila') {
        setNilaAvatar(processedUrl);
        setNilaError(false);
        showNotification("Nila's photo updated successfully!");
      } else {
        setFarhanAvatar(processedUrl);
        setFarhanError(false);
        showNotification("Farhan's photo updated successfully!");
      }
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-3xl bg-[#0d1117] border border-rose-500/30 shadow-2xl shadow-rose-950/60 overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#21262d] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Couple Profile Photos</span>
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </h2>
              <p className="text-xs text-[#8b949e]">
                Choose photos for Nila and Farhan shown in the archive sidebar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto relative z-10">
          {/* Hidden inputs */}
          <input
            type="file"
            ref={nilaInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file, 'nila');
            }}
          />
          <input
            type="file"
            ref={farhanInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file, 'farhan');
            }}
          />

          {/* Two Profile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NILA CARD */}
            <div className="p-5 rounded-2xl bg-[#161b22]/70 border border-rose-500/30 hover:border-rose-500/60 transition-all flex flex-col items-center text-center relative group">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full mb-4">
                Her Profile
              </span>

              {/* Avatar Frame with hover overlay */}
              <div
                onClick={() => nilaInputRef.current?.click()}
                className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-500 shadow-lg shadow-rose-500/25 relative cursor-pointer group/avatar mb-3"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0c0e12] flex items-center justify-center relative">
                  {!nilaError ? (
                    <img
                      src={nilaAvatar}
                      alt="Nila"
                      onError={() => setNilaError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-3xl font-mono font-bold">
                      N
                    </div>
                  )}

                  {/* Camera overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                    <Camera className="w-6 h-6 text-rose-300" />
                    <span className="text-[10px] font-medium">Change</span>
                  </div>
                </div>
              </div>

              <div className="font-bold text-white text-base">Nila</div>
              <p className="text-[11px] text-[#8b949e] mb-4">
                {hasCustomNila ? 'Custom photo active' : 'Using default'}
              </p>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-2 mt-auto">
                <button
                  onClick={() => nilaInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/50 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </button>

                {hasCustomNila && (
                  <button
                    onClick={() => {
                      resetNilaAvatar();
                      setNilaError(false);
                      showNotification("Reset Nila's photo to default.");
                    }}
                    title="Reset to default"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8b949e] hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* FARHAN CARD */}
            <div className="p-5 rounded-2xl bg-[#161b22]/70 border border-sky-500/30 hover:border-sky-500/60 transition-all flex flex-col items-center text-center relative group">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full mb-4">
                His Profile
              </span>

              {/* Avatar Frame with hover overlay */}
              <div
                onClick={() => farhanInputRef.current?.click()}
                className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 shadow-lg shadow-sky-500/25 relative cursor-pointer group/avatar mb-3"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0c0e12] flex items-center justify-center relative">
                  {!farhanError ? (
                    <img
                      src={farhanAvatar}
                      alt="Farhan"
                      onError={() => setFarhanError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-3xl font-mono font-bold">
                      F
                    </div>
                  )}

                  {/* Camera overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                    <Camera className="w-6 h-6 text-sky-300" />
                    <span className="text-[10px] font-medium">Change</span>
                  </div>
                </div>
              </div>

              <div className="font-bold text-white text-base">Farhan</div>
              <p className="text-[11px] text-[#8b949e] mb-4">
                {hasCustomFarhan ? 'Custom photo active' : 'Using default'}
              </p>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-2 mt-auto">
                <button
                  onClick={() => farhanInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-950/50 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </button>

                {hasCustomFarhan && (
                  <button
                    onClick={() => {
                      resetFarhanAvatar();
                      setFarhanError(false);
                      showNotification("Reset Farhan's photo to default.");
                    }}
                    title="Reset to default"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8b949e] hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Helpful Information Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/20 via-pink-950/15 to-transparent border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
              <Info className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Two Easy Ways to Add Your Photos</span>
            </div>
            <ul className="text-[11px] text-[#8b949e] space-y-1.5 pl-6 list-disc">
              <li>
                <strong className="text-white">Option 1 (Instant Click):</strong> Click{' '}
                <span className="text-rose-300">"Choose Photo"</span> above to pick any picture from your computer. It is automatically optimized and securely saved in your browser.
              </li>
              <li>
                <strong className="text-white">Option 2 (Folder Drop):</strong> Or place image files into your project folder at{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/40 text-purple-300 font-mono text-[10px]">
                  public/avatars/nila.jpg
                </code>{' '}
                and{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/40 text-sky-300 font-mono text-[10px]">
                  public/avatars/farhan.jpg
                </code>.
              </li>
            </ul>
          </div>

          {/* Privacy Guarantee */}
          <div className="flex items-center justify-between text-[11px] text-[#8b949e] pt-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Offline & Private to Your Browser</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
