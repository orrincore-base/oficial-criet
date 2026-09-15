import { BrandConfig, ContentData, FORMAT_SPECS, PostFormat, Template } from '../../types';
import { drawRoundedRect, wrapText } from '../canvas/imageRenderer';

export interface BrowserCapabilities {
  hasMediaRecorder: boolean;
  hasCanvasCaptureStream: boolean;
  supportedMimeType: string | null;
  hasWebCodecs: boolean;
  isFullySupported: boolean;
}

export function checkBrowserCapabilities(): BrowserCapabilities {
  if (typeof window === 'undefined') {
    return {
      hasMediaRecorder: false,
      hasCanvasCaptureStream: false,
      supportedMimeType: null,
      hasWebCodecs: false,
      isFullySupported: false,
    };
  }

  const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';
  const hasCanvasCaptureStream =
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function';

  let supportedMimeType: string | null = null;
  if (hasMediaRecorder) {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) {
        supportedMimeType = mime;
        break;
      }
    }
  }

  const hasWebCodecs = typeof (window as unknown as { VideoEncoder?: unknown }).VideoEncoder !== 'undefined';

  return {
    hasMediaRecorder,
    hasCanvasCaptureStream,
    supportedMimeType,
    hasWebCodecs,
    isFullySupported: hasMediaRecorder && hasCanvasCaptureStream && !!supportedMimeType,
  };
}

export interface VideoDrawOptions {
  ctx: CanvasRenderingContext2D;
  video: HTMLVideoElement;
  width: number;
  height: number;
  format: PostFormat;
  content: ContentData;
  brand: BrandConfig;
  template: Template;
  currentTime: number;
  duration: number;
  scale: number;
}

// Render a single video frame with automated dynamic overlays
export function drawVideoFrameWithOverlays({
  ctx,
  video,
  width,
  height,
  content,
  brand,
  template,
  currentTime,
  scale,
}: VideoDrawOptions): void {
  // Clear canvas
  ctx.fillStyle = '#090E1A';
  ctx.fillRect(0, 0, width, height);

  // 1. Draw Video Frame (Aspect Fill / Object-Fit: Cover)
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    const vRatio = video.videoWidth / video.videoHeight;
    const cRatio = width / height;
    let rw = width;
    let rh = height;
    let ox = 0;
    let oy = 0;

    if (vRatio > cRatio) {
      rh = height;
      rw = height * vRatio;
      ox = (width - rw) / 2;
    } else {
      rw = width;
      rh = width / vRatio;
      oy = (height - rh) / 2;
    }

    try {
      ctx.drawImage(video, ox, oy, rw, rh);
    } catch {
      // safe fallback if frame not yet ready
    }
  }

  const paddingX = Math.round(56 * scale);

  // 2. Animation progress calculation (discreet, professional animation)
  // Intro animation runs in the first 1.2 seconds of playback
  const introDuration = 1.2;
  const progress = Math.min(1, Math.max(0, currentTime / introDuration));
  // Ease-out cubic
  const easeOut = 1 - Math.pow(1 - progress, 3);

  // 3. Lower third overlay gradient
  const overlayHeight = Math.round(height * 0.52);
  const grad = ctx.createLinearGradient(0, height - overlayHeight, 0, height);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
  grad.addColorStop(0.35, 'rgba(15, 23, 42, 0.65)');
  grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.92)');
  grad.addColorStop(1, 'rgba(9, 14, 26, 0.98)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, height - overlayHeight, width, overlayHeight);

  // 4. Top bar: Brand Name & Badge
  const topY = Math.round(52 * scale);

  // Brand Badge
  const brandName = brand.pageName || 'Criet';
  ctx.font = `800 ${Math.round(20 * scale)}px "Plus Jakarta Sans", sans-serif`;
  const nameW = ctx.measureText(brandName).width;
  const pillW = nameW + 36 * scale;
  const pillH = Math.round(44 * scale);

  // Intro fade/slide for header
  ctx.save();
  ctx.globalAlpha = easeOut;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  drawRoundedRect(ctx, paddingX, topY, pillW, pillH, 10 * scale);
  ctx.fill();

  ctx.fillStyle = brand.primaryColor || '#2563EB';
  drawRoundedRect(ctx, paddingX + 4 * scale, topY + 6 * scale, 4 * scale, pillH - 12 * scale, 2 * scale);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(brandName, paddingX + 18 * scale, topY + pillH / 2);
  ctx.restore();

  // Top Right Badge (URGENTE / AO VIVO)
  if (content.urgenteBadge || template.category === 'URGENTE') {
    const badgeW = Math.round(150 * scale);
    const badgeH = Math.round(44 * scale);
    const badgeX = width - paddingX - badgeW;

    ctx.fillStyle = '#DC2626';
    drawRoundedRect(ctx, badgeX, topY, badgeW, badgeH, 8 * scale);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${Math.round(18 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('URGENTE', badgeX + badgeW / 2, topY + badgeH / 2);
  } else if (content.liveBadge || template.category === 'AO VIVO') {
    const badgeW = Math.round(140 * scale);
    const badgeH = Math.round(44 * scale);
    const badgeX = width - paddingX - badgeW;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    drawRoundedRect(ctx, badgeX, topY, badgeW, badgeH, 22 * scale);
    ctx.fill();

    // Pulsing dot based on currentTime
    const pulse = 0.6 + 0.4 * Math.sin(currentTime * 4);
    ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
    ctx.beginPath();
    ctx.arc(badgeX + 26 * scale, topY + badgeH / 2, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${Math.round(16 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('AO VIVO', badgeX + 40 * scale, topY + badgeH / 2 + 1);
  }

  // 5. Lower Third: Category + Title + Subtitle
  const footerH = brand.footerEnabled ? Math.round(96 * scale) : Math.round(40 * scale);
  const lowerThirdBottom = height - footerH - Math.round(20 * scale);

  const titleFontSize = Math.round(48 * scale);
  const subtitleFontSize = Math.round(22 * scale);
  const maxWidth = width - paddingX * 2;

  ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
  const titleText = content.title || 'Título do vídeo';
  const titleLines = wrapText(ctx, titleText, maxWidth, 3);
  const titleLineH = titleFontSize * 1.2;
  const totalTitleH = titleLines.length * titleLineH;

  let subtitleLines: string[] = [];
  if (content.subtitle) {
    ctx.font = `500 ${subtitleFontSize}px "Plus Jakarta Sans", sans-serif`;
    subtitleLines = wrapText(ctx, content.subtitle, maxWidth, 2);
  }
  const subtitleLineH = subtitleFontSize * 1.35;
  const totalSubtitleH = subtitleLines.length > 0 ? subtitleLines.length * subtitleLineH + 12 * scale : 0;

  const categoryH = Math.round(34 * scale);
  const blockH = categoryH + 18 * scale + totalTitleH + totalSubtitleH;

  // Slide up offset based on intro easeOut
  const slideOffsetY = (1 - easeOut) * 36 * scale;
  let textY = lowerThirdBottom - blockH + slideOffsetY;

  ctx.save();
  ctx.globalAlpha = Math.max(0.05, easeOut);

  // Category Tag
  const cat = (content.category || template.category || 'VÍDEO').toUpperCase();
  ctx.font = `800 ${Math.round(15 * scale)}px "Plus Jakarta Sans", sans-serif`;
  const catW = ctx.measureText(cat).width + 28 * scale;

  ctx.fillStyle = template.style.badgeColor || brand.primaryColor || '#2563EB';
  drawRoundedRect(ctx, paddingX, textY, catW, categoryH, 6 * scale);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cat, paddingX + catW / 2, textY + categoryH / 2 + 1);

  textY += categoryH + Math.round(16 * scale);

  // Title with subtle shadow
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  for (const line of titleLines) {
    ctx.fillText(line, paddingX, textY);
    textY += titleLineH;
  }

  // Subtitle
  if (subtitleLines.length > 0) {
    textY += Math.round(8 * scale);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
    ctx.font = `500 ${subtitleFontSize}px "Plus Jakarta Sans", sans-serif`;
    for (const line of subtitleLines) {
      ctx.fillText(line, paddingX, textY);
      textY += subtitleLineH;
    }
  }

  ctx.restore();

  // 6. Automated Footer
  if (brand.footerEnabled) {
    const footY = height - footerH;
    ctx.fillStyle = 'rgba(11, 19, 43, 0.95)';
    ctx.fillRect(0, footY, width, footerH);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(paddingX, footY, width - paddingX * 2, 1.5 * scale);

    const leftText = brand.instagram || `@${brand.pageName.toLowerCase().replace(/\s+/g, '')}`;
    const rightItems = [brand.phone, brand.website].filter(Boolean);
    const rightText = rightItems.join('  •  ');

    const contentY = footY + footerH / 2;
    ctx.font = `700 ${Math.round(17 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';

    ctx.textAlign = 'left';
    ctx.fillText(leftText, paddingX, contentY);

    if (rightText) {
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
      ctx.fillText(rightText, width - paddingX, contentY);
    }
  }
}

// Export Video using MediaRecorder & Canvas Stream
export async function renderAndExportVideo({
  video,
  format,
  content,
  brand,
  template,
  onProgress,
}: {
  video: HTMLVideoElement;
  format: PostFormat;
  content: ContentData;
  brand: BrandConfig;
  template: Template;
  onProgress?: (percent: number) => void;
}): Promise<Blob> {
  const caps = checkBrowserCapabilities();
  if (!caps.hasMediaRecorder || !caps.hasCanvasCaptureStream || !caps.supportedMimeType) {
    throw new Error('Navegador incompatível com processamento direto de vídeo.');
  }

  const specs = FORMAT_SPECS[format] || FORMAT_SPECS['9:16'];
  // Scale down for reasonable encoding speed on the client while maintaining sharpness
  const exportScale = specs.width > 1200 ? 0.65 : 0.75;
  const canvasW = Math.round(specs.width * exportScale);
  const canvasH = Math.round(specs.height * exportScale);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível obter contexto 2D para renderização.');

  // Set up video playback capture
  const stream = canvas.captureStream(30);

  // Try to capture audio if available from the video element
  try {
    const videoWithCapture = video as unknown as { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
    const videoStream = videoWithCapture.captureStream ? videoWithCapture.captureStream() : videoWithCapture.mozCaptureStream ? videoWithCapture.mozCaptureStream() : null;
    if (videoStream && videoStream.getAudioTracks().length > 0) {
      videoStream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }
  } catch {
    // safe fallback: silent or canvas video stream
  }

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: caps.supportedMimeType,
    videoBitsPerSecond: 4_500_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    recorder.onerror = () => {
      reject(new Error('Não foi possível processar este vídeo. Tente outro arquivo ou formato compatível.'));
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: caps.supportedMimeType || 'video/webm' });
      resolve(blob);
    };

    // Prepare video replay
    video.currentTime = 0;
    video.muted = false;

    let animId: number;
    const duration = Math.min(video.duration || 10, 60); // Cap at 60s max client render

    const renderLoop = () => {
      if (video.ended || video.currentTime >= duration) {
        cancelAnimationFrame(animId);
        recorder.stop();
        video.pause();
        return;
      }

      drawVideoFrameWithOverlays({
        ctx,
        video,
        width: canvasW,
        height: canvasH,
        format,
        content,
        brand,
        template,
        currentTime: video.currentTime,
        duration,
        scale: exportScale,
      });

      if (onProgress && duration > 0) {
        const pct = Math.min(99, Math.round((video.currentTime / duration) * 100));
        onProgress(pct);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    recorder.start(100);
    video.play().then(() => {
      renderLoop();
    }).catch((err) => {
      reject(new Error(`Erro ao reproduzir o vídeo para exportação: ${err.message || err}`));
    });
  });
}

export function downloadVideoBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
