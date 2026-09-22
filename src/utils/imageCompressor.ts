/**
 * High-Efficiency Client-Side Image Resizer & Compressor for Saree Catalog
 * Converts raw camera photos into crisp 720p WebP/JPEG images (<150KB)
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
  savingsPercentage: number;
}

export function compressImageTo720p(
  fileOrDataUrl: File | string,
  maxDimension: number = 1280,
  quality: number = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Capping max dimension to 1280px (720p landscape/portrait standard)
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // Smooth scaling quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed WebP (or fallback to JPEG if WebP unsupported)
      let compressedDataUrl = canvas.toDataURL('image/webp', quality);
      if (!compressedDataUrl.startsWith('data:image/webp')) {
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      // Size calculation
      const originalSizeKb =
        typeof fileOrDataUrl === 'string'
          ? Math.round((fileOrDataUrl.length * 0.75) / 1024)
          : Math.round(fileOrDataUrl.size / 1024);

      const compressedSizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);
      const savingsPercentage = Math.max(
        0,
        Math.round(((originalSizeKb - compressedSizeKb) / Math.max(1, originalSizeKb)) * 100)
      );

      resolve({
        dataUrl: compressedDataUrl,
        originalSizeKb,
        compressedSizeKb,
        width,
        height,
        savingsPercentage,
      });
    };

    img.onerror = (err) => reject(err);

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
