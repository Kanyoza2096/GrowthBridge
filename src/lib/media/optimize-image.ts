export const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 1920;

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export type OptimizedImage = {
  file: File;
  width?: number;
  height?: number;
};

/**
 * Prepare a browser-selected image for the media library.
 * Raster images are resized to a 1920px longest edge and encoded as WebP.
 * GIFs remain GIFs so their animation is preserved.
 */
export async function optimizeImageForUpload(source: File): Promise<OptimizedImage> {
  if (!SUPPORTED_IMAGE_TYPES.has(source.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, or GIF image. Videos and documents are not supported.');
  }
  if (source.size <= 0) throw new Error('The selected image is empty.');
  if (source.type === 'image/gif') {
    if (source.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error('Animated GIFs must be 2 MB or smaller. Please optimize the GIF before uploading.');
    }
    return { file: source };
  }

  if (typeof createImageBitmap !== 'function') {
    if (source.size <= MAX_IMAGE_UPLOAD_BYTES) return { file: source };
    throw new Error('This browser cannot optimize the selected image. Please use a modern browser or upload an image under 2 MB.');
  }

  const bitmap = await createImageBitmap(source);
  try {
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image optimization is unavailable in this browser.');
    context.drawImage(bitmap, 0, 0, width, height);

    const encode = (quality: number) => new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The image could not be optimized.')), 'image/webp', quality);
    });

    let blob = await encode(0.84);
    if (blob.size > MAX_IMAGE_UPLOAD_BYTES) blob = await encode(0.76);
    if (blob.size > MAX_IMAGE_UPLOAD_BYTES) blob = await encode(0.68);
    if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error('The optimized image is still larger than 2 MB. Please choose a simpler or smaller image.');
    }

    const baseName = source.name.replace(/\.[^.]+$/, '').slice(0, 180) || 'image';
    return {
      file: new File([blob], baseName + '.webp', { type: 'image/webp', lastModified: Date.now() }),
      width,
      height,
    };
  } finally {
    bitmap.close();
  }
}
