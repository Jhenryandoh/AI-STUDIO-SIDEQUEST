/**
 * Client-side image compression, thumbnail generator, and validation for mobile photos
 */

export interface ProcessedImage {
  fullDataUrl: string;
  thumbnailUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
  timestamp: number;
}

export async function compressAndProcessImage(file: File): Promise<ProcessedImage> {
  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image data'));
      img.onload = () => {
        // Target max dimension 1280px for full photo
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        // Full compressed canvas
        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = width;
        fullCanvas.height = height;
        const fullCtx = fullCanvas.getContext('2d');
        if (!fullCtx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        fullCtx.drawImage(img, 0, 0, width, height);

        // Watermark timestamp & NightQuest verified badge in corner
        fullCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        fullCtx.fillRect(16, height - 42, 280, 30);
        fullCtx.font = 'bold 12px sans-serif';
        fullCtx.fillStyle = '#38bdf8';
        const dateStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        fullCtx.fillText(`⚡ NIGHTQUEST VERIFIED • ${dateStr}`, 24, height - 22);

        const fullDataUrl = fullCanvas.toDataURL('image/jpeg', 0.82);

        // Thumbnail canvas (200x200 cropped square)
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 200;
        thumbCanvas.height = 200;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (thumbCtx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          thumbCtx.drawImage(img, sx, sy, minSide, minSide, 0, 0, 200, 200);
        }
        const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

        // Estimate compressed size
        const compressedSizeBytes = Math.round((fullDataUrl.length * 3) / 4);

        resolve({
          fullDataUrl,
          thumbnailUrl,
          originalSizeBytes,
          compressedSizeBytes,
          width,
          height,
          timestamp: Date.now(),
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a high-fidelity synthetic nightclub verification photo for testing
 */
export function generateTestNightPhoto(title: string, country: string = 'United States'): ProcessedImage {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d')!;

  // Dark neon night atmosphere
  const grad = ctx.createLinearGradient(0, 0, 800, 600);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#2e1065');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  // Neon glowing spheres (bokeh light effect)
  const colors = ['rgba(236,72,153,0.35)', 'rgba(6,182,212,0.4)', 'rgba(168,85,247,0.35)', 'rgba(234,179,8,0.3)'];
  for (let i = 0; i < 18; i++) {
    const x = (i * 47) % 780 + 20;
    const y = (i * 37) % 560 + 20;
    const r = (i % 5) * 15 + 25;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
  }

  // Cocktail glass silhouette / party vibes
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(350, 280);
  ctx.lineTo(450, 280);
  ctx.lineTo(400, 360);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(400, 360);
  ctx.lineTo(400, 440);
  ctx.lineTo(370, 440);
  ctx.lineTo(430, 440);
  ctx.stroke();

  // Text title overlay
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`PROMPT: ${title.toUpperCase()}`, 400, 180);

  // Verified watermark
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(50, 520, 700, 50);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`✓ LIVE VERIFIED • LOC: ${country.toUpperCase()} • ${new Date().toLocaleTimeString()}`, 70, 552);

  const fullDataUrl = canvas.toDataURL('image/jpeg', 0.85);

  return {
    fullDataUrl,
    thumbnailUrl: fullDataUrl,
    originalSizeBytes: 1024 * 350,
    compressedSizeBytes: 1024 * 85,
    width: 800,
    height: 600,
    timestamp: Date.now(),
  };
}
