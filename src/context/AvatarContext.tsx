import React, { createContext, useContext, useState } from 'react';

interface AvatarContextType {
  sumaiyaAvatar: string;
  nihanAvatar: string;
  hasCustomSumaiya: boolean;
  hasCustomNihan: boolean;
  setSumaiyaAvatar: (url: string) => void;
  setNihanAvatar: (url: string) => void;
  resetSumaiyaAvatar: () => void;
  resetNihanAvatar: () => void;
  resetAvatars: () => void;
}

export const DEFAULT_SUMAIYA = '/avatars/sumaiya.svg';
export const DEFAULT_NIHAN = '/avatars/nihan.svg';

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function processAvatarFile(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Center crop square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customSumaiya, setCustomSumaiya] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sumaiya_custom_avatar');
    } catch {
      return null;
    }
  });

  const [customNihan, setCustomNihan] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nihan_custom_avatar');
    } catch {
      return null;
    }
  });

  const setSumaiyaAvatar = (url: string) => {
    setCustomSumaiya(url);
    try {
      localStorage.setItem('sumaiya_custom_avatar', url);
    } catch (err) {
      console.error('Failed to save Sumaiya avatar to localStorage:', err);
    }
  };

  const setNihanAvatar = (url: string) => {
    setCustomNihan(url);
    try {
      localStorage.setItem('nihan_custom_avatar', url);
    } catch (err) {
      console.error('Failed to save Nihan avatar to localStorage:', err);
    }
  };

  const resetSumaiyaAvatar = () => {
    setCustomSumaiya(null);
    try {
      localStorage.removeItem('sumaiya_custom_avatar');
    } catch {}
  };

  const resetNihanAvatar = () => {
    setCustomNihan(null);
    try {
      localStorage.removeItem('nihan_custom_avatar');
    } catch {}
  };

  const resetAvatars = () => {
    resetSumaiyaAvatar();
    resetNihanAvatar();
  };

  const sumaiyaAvatar = customSumaiya || DEFAULT_SUMAIYA;
  const nihanAvatar = customNihan || DEFAULT_NIHAN;

  return (
    <AvatarContext.Provider
      value={{
        sumaiyaAvatar,
        nihanAvatar,
        hasCustomSumaiya: !!customSumaiya,
        hasCustomNihan: !!customNihan,
        setSumaiyaAvatar,
        setNihanAvatar,
        resetSumaiyaAvatar,
        resetNihanAvatar,
        resetAvatars,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export function useAvatars(): AvatarContextType {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatars must be used within an AvatarProvider');
  }
  return context;
}
