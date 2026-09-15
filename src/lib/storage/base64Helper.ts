import { BrandConfig } from '../../types';

export const LOCAL_STORAGE_BRAND_KEY = 'criet_user_brand';
export const LOCAL_STORAGE_BRAND_BACKUP_KEY = 'criet_brand_backup';

/**
 * Converts a File or Blob into a Base64 data URL string.
 * Automatically optimizes large images to fit comfortably within browser LocalStorage limits
 * while maintaining transparent backgrounds and sharp quality.
 */
export function convertFileToBase64(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, preserve raw vector data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        reject(new Error('Falha ao ler arquivo.'));
        return;
      }

      // If file is already small (less than 200KB) and is an image, keep as-is
      if (file.size <= 200 * 1024) {
        resolve(result);
        return;
      }

      // If image is larger, resize to optimal dimensions for LocalStorage and Canvas rendering
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        // Enable crisp interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if original is PNG, otherwise use PNG/WebP
        const isPng = file.type.includes('png') || file.name.toLowerCase().endsWith('.png');
        const outputMime = isPng ? 'image/png' : 'image/webp';
        try {
          const compressed = canvas.toDataURL(outputMime, isPng ? undefined : quality);
          resolve(compressed);
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Retrieve user's configured brand directly from browser LocalStorage
 */
export function getLocalStorageBrand(): BrandConfig | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw =
      localStorage.getItem(LOCAL_STORAGE_BRAND_KEY) ||
      localStorage.getItem(LOCAL_STORAGE_BRAND_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as BrandConfig;
    }
  } catch (err) {
    console.warn('Erro ao ler marca do localStorage:', err);
  }
  return null;
}

/**
 * Save user brand (including Base64 logo and contacts) directly in browser LocalStorage
 */
export function saveLocalStorageBrand(brand: BrandConfig): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const serialized = JSON.stringify(brand);
    localStorage.setItem(LOCAL_STORAGE_BRAND_KEY, serialized);
    localStorage.setItem(LOCAL_STORAGE_BRAND_BACKUP_KEY, serialized);

    // Notify other components of instant brand update
    window.dispatchEvent(new CustomEvent('criet_brand_updated', { detail: brand }));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
    throw err;
  }
}

/**
 * Clear user brand from LocalStorage
 */
export function clearLocalStorageBrand(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.removeItem(LOCAL_STORAGE_BRAND_KEY);
  localStorage.removeItem(LOCAL_STORAGE_BRAND_BACKUP_KEY);
  window.dispatchEvent(new CustomEvent('criet_brand_cleared'));
}

/**
 * Returns diagnostic size and usage details of LocalStorage
 */
export function getLocalStorageStats(): {
  brandSizeKB: number;
  logoBase64SizeKB: number;
  hasLogo: boolean;
  totalUsageKB: number;
  lastUpdated?: string;
} {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { brandSizeKB: 0, logoBase64SizeKB: 0, hasLogo: false, totalUsageKB: 0 };
  }

  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key) || '';
      totalBytes += (key.length + val.length) * 2; // UTF-16
    }
  }

  const brandRaw = localStorage.getItem(LOCAL_STORAGE_BRAND_KEY) || '';
  const brandBytes = brandRaw.length * 2;

  let logoBytes = 0;
  let hasLogo = false;
  if (brandRaw) {
    try {
      const parsed = JSON.parse(brandRaw);
      if (parsed.logoUrl && parsed.logoUrl.startsWith('data:')) {
        hasLogo = true;
        logoBytes = parsed.logoUrl.length * 2;
      }
    } catch {
      // ignore
    }
  }

  return {
    brandSizeKB: parseFloat((brandBytes / 1024).toFixed(2)),
    logoBase64SizeKB: parseFloat((logoBytes / 1024).toFixed(2)),
    hasLogo,
    totalUsageKB: parseFloat((totalBytes / 1024).toFixed(2)),
  };
}
