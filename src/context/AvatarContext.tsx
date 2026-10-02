import React, { createContext, useContext, useState } from 'react';

interface AvatarContextType {
  nilaAvatar: string;
  farhanAvatar: string;
  hasCustomNila: boolean;
  hasCustomFarhan: boolean;
  setNilaAvatar: (url: string) => void;
  setFarhanAvatar: (url: string) => void;
  resetNilaAvatar: () => void;
  resetFarhanAvatar: () => void;
  resetAvatars: () => void;
}

export const DEFAULT_NILA = '/avatars/nila.jpg';
export const DEFAULT_FARHAN = '/avatars/farhan.jpg';

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
  const [customNila, setCustomNila] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nila_custom_avatar');
    } catch {
      return null;
    }
  });

  const [customFarhan, setCustomFarhan] = useState<string | null>(() => {
    try {
      return localStorage.getItem('farhan_custom_avatar');
    } catch {
      return null;
    }
  });

  const setNilaAvatar = (url: string) => {
    setCustomNila(url);
    try {
      localStorage.setItem('nila_custom_avatar', url);
    } catch (err) {
      console.error('Failed to save Nila avatar to localStorage:', err);
    }
  };

  const setFarhanAvatar = (url: string) => {
    setCustomFarhan(url);
    try {
      localStorage.setItem('farhan_custom_avatar', url);
    } catch (err) {
      console.error('Failed to save Farhan avatar to localStorage:', err);
    }
  };

  const resetNilaAvatar = () => {
    setCustomNila(null);
    try {
      localStorage.removeItem('nila_custom_avatar');
    } catch {}
  };

  const resetFarhanAvatar = () => {
    setCustomFarhan(null);
    try {
      localStorage.removeItem('farhan_custom_avatar');
    } catch {}
  };

  const resetAvatars = () => {
    resetNilaAvatar();
    resetFarhanAvatar();
  };

  const nilaAvatar = customNila || DEFAULT_NILA;
  const farhanAvatar = customFarhan || DEFAULT_FARHAN;

  return (
    <AvatarContext.Provider
      value={{
        nilaAvatar,
        farhanAvatar,
        hasCustomNila: !!customNila,
        hasCustomFarhan: !!customFarhan,
        setNilaAvatar,
        setFarhanAvatar,
        resetNilaAvatar,
        resetFarhanAvatar,
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
