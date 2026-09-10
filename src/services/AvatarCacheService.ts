const LOCAL_STORAGE_PREFIX = 'un_avatar_';

interface AvatarRecord {
  userId: string;
  dataUrl: string;
  cachedAt: number;
}

/**
 * Resizes and compresses image DataURL to max 256x256 JPEG (~20-40KB).
 * This ensures custom uploaded avatar data never exceeds localStorage's 5MB quota.
 */
function compressAvatar(dataUrl: string, maxDim = 256): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export const AvatarCacheService = {
  /**
   * Retrieves cached custom avatar data URL from localStorage for the given user.
   */
  getCachedAvatar(userId: number | string): string | null {
    const key = LOCAL_STORAGE_PREFIX + String(userId);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const record: AvatarRecord = JSON.parse(raw);
      return record.dataUrl || null;
    } catch {
      return null;
    }
  },

  /**
   * Caches a custom uploaded avatar in localStorage (compressed to ~25-40KB).
   */
  async setCachedAvatar(userId: number | string, dataUrl: string): Promise<void> {
    const key = LOCAL_STORAGE_PREFIX + String(userId);
    try {
      const optimized = dataUrl.startsWith('data:') ? await compressAvatar(dataUrl) : dataUrl;
      const record: AvatarRecord = {
        userId: String(userId),
        dataUrl: optimized,
        cachedAt: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(record));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('avatar-changed'));
      }
    } catch {
      // Storage disabled or quota issues
    }
  },

  /**
   * Removes cached custom avatar for the user from localStorage.
   */
  deleteCachedAvatar(userId: number | string): void {
    const key = LOCAL_STORAGE_PREFIX + String(userId);
    try {
      localStorage.removeItem(key);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('avatar-changed'));
      }
    } catch {
      // ignore
    }
  },
};



