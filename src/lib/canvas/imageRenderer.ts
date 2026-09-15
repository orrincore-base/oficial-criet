import { BrandConfig, ContentData, FORMAT_SPECS, PostFormat, Template } from '../../types';

interface RenderOptions {
  canvas: HTMLCanvasElement;
  format: PostFormat;
  image?: HTMLImageElement | ImageBitmap | null;
  content: ContentData;
  brand: BrandConfig;
  template: Template;
  scale?: number; // for preview optimization
}

// Helper: Smart text wrapping with max lines and ellipsis
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 4
): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        // Last line approaching: summarize remaining
        const remaining = words.slice(i).join(' ');
        let lastLine = remaining;
        while (ctx.measureText(lastLine + '...').width > maxWidth && lastLine.length > 0) {
          lastLine = lastLine.slice(0, -1).trim();
        }
        lines.push(lastLine ? lastLine + '...' : '...');
        return lines;
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.slice(0, maxLines);
}

// Draw rounded rect utility
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[]
) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    // fallback
    const r = typeof radius === 'number' ? radius : radius[0] || 8;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
  ctx.closePath();
}

export async function renderPostToCanvas({
  canvas,
  format,
  image,
  content,
  brand,
  template,
  scale = 1,
}: RenderOptions): Promise<void> {
  const specs = FORMAT_SPECS[format] || FORMAT_SPECS['4:5'];
  const targetWidth = Math.round(specs.width * scale);
  const targetHeight = Math.round(specs.height * scale);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Base Background (Dark neutral or fallback color)
  ctx.fillStyle = brand.secondaryColor || '#0B132B';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 1. Draw Media / Image (Aspect Fill / Object-Fit: Cover)
  if (image && image.width > 0 && image.height > 0) {
    const imgRatio = image.width / image.height;
    const canvasRatio = targetWidth / targetHeight;
    let renderW = targetWidth;
    let renderH = targetHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      renderH = targetHeight;
      renderW = targetHeight * imgRatio;
      offsetX = (targetWidth - renderW) / 2;
    } else {
      renderW = targetWidth;
      renderH = targetWidth / imgRatio;
      offsetY = (targetHeight - renderH) / 2;
    }

    ctx.drawImage(image, offsetX, offsetY, renderW, renderH);
  } else {
    // Elegant Placeholder Background
    const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
    grad.addColorStop(0, '#1E293B');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Subtle pattern or prompt text if empty
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.font = `600 ${Math.round(28 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Adicione uma foto para o seu post', targetWidth / 2, targetHeight / 2 - 40 * scale);
  }

  // 2. Overlays based on template
  const { style } = template;
  const paddingX = Math.round(72 * scale);
  const paddingBottom = Math.round(180 * scale);

  if (style.overlayType === 'gradient-bottom' || style.layout === 'editorial-bottom') {
    const gradHeight = Math.round(targetHeight * 0.72);
    const grad = ctx.createLinearGradient(0, targetHeight - gradHeight, 0, targetHeight);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    grad.addColorStop(0.3, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.65, 'rgba(15, 23, 42, 0.88)');
    grad.addColorStop(1, 'rgba(11, 19, 43, 0.98)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, targetHeight - gradHeight, targetWidth, gradHeight);
  } else if (style.overlayType === 'solid-bar' || style.layout === 'breaking-urgent') {
    // Solid high-impact bottom block
    const barHeight = Math.round(targetHeight * 0.42);
    const barGrad = ctx.createLinearGradient(0, targetHeight - barHeight, 0, targetHeight);
    barGrad.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
    barGrad.addColorStop(1, 'rgba(9, 14, 26, 0.99)');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, targetHeight - barHeight, targetWidth, barHeight);

    // Top accent border on bar
    ctx.fillStyle = style.accentColor || '#EF4444';
    ctx.fillRect(0, targetHeight - barHeight, targetWidth, Math.round(8 * scale));
  } else if (style.overlayType === 'card-floating' || style.layout === 'modern-card') {
    // Floating card in bottom half
    const cardMargin = Math.round(48 * scale);
    const cardW = targetWidth - cardMargin * 2;
    const cardH = Math.round(targetHeight * 0.45);
    const cardY = targetHeight - cardH - Math.round(120 * scale);

    // Card shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40 * scale;
    ctx.shadowOffsetY = 20 * scale;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    drawRoundedRect(ctx, cardMargin, cardY, cardW, cardH, 24 * scale);
    ctx.fill();
    ctx.restore();

    // Subtle card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2 * scale;
    drawRoundedRect(ctx, cardMargin, cardY, cardW, cardH, 24 * scale);
    ctx.stroke();
  }

  // 3. Brand Header / Top Logo Area
  const topBarY = Math.round(64 * scale);
  const brandPrimary = brand.primaryColor || '#2563EB';

  // Draw Logo or Brand Name pill
  if (brand.showLogo && brand.logoUrl) {
    try {
      const logoImg = await loadImage(brand.logoUrl);
      const maxLogoW = Math.round(180 * scale);
      const maxLogoH = Math.round(68 * scale);
      const logoRatio = logoImg.width / logoImg.height;
      let drawW = maxLogoW;
      let drawH = maxLogoW / logoRatio;
      if (drawH > maxLogoH) {
        drawH = maxLogoH;
        drawW = maxLogoH * logoRatio;
      }

      // Background pill behind logo for contrast on any photo
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      drawRoundedRect(ctx, paddingX - 12 * scale, topBarY - 8 * scale, drawW + 24 * scale, drawH + 16 * scale, 12 * scale);
      ctx.fill();
      ctx.drawImage(logoImg, paddingX, topBarY, drawW, drawH);
    } catch {
      // fallback to brand text
      drawBrandPill(ctx, brand, paddingX, topBarY, scale);
    }
  } else if (brand.pageName) {
    drawBrandPill(ctx, brand, paddingX, topBarY, scale);
  }

  // Live / Urgente indicators in top right
  if (content.urgenteBadge || template.category === 'URGENTE') {
    const badgeW = Math.round(180 * scale);
    const badgeH = Math.round(48 * scale);
    const badgeX = targetWidth - paddingX - badgeW;

    ctx.fillStyle = '#DC2626';
    drawRoundedRect(ctx, badgeX, topBarY, badgeW, badgeH, 10 * scale);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${Math.round(20 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('URGENTE', badgeX + badgeW / 2, topBarY + badgeH / 2);
  } else if (content.liveBadge || template.category === 'AO VIVO') {
    const badgeW = Math.round(160 * scale);
    const badgeH = Math.round(46 * scale);
    const badgeX = targetWidth - paddingX - badgeW;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    drawRoundedRect(ctx, badgeX, topBarY, badgeW, badgeH, 24 * scale);
    ctx.fill();

    // Red glowing dot
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(badgeX + 28 * scale, topBarY + badgeH / 2, 7 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${Math.round(18 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('AO VIVO', badgeX + 44 * scale, topBarY + badgeH / 2 + 1 * scale);
  }

  // 4. Content Area Layout
  const contentCategory = content.category || template.category || 'NOTÍCIA';
  const titleText = content.title || 'Escreva o título principal da sua publicação aqui';
  const subtitleText = content.subtitle || '';
  const dateLocationText = [content.date, content.location].filter(Boolean).join(' • ');

  // Position baseline calculations
  const footerAreaH = brand.footerEnabled ? Math.round(130 * scale) : Math.round(60 * scale);
  let contentBottomY = targetHeight - footerAreaH - Math.round(30 * scale);

  if (style.layout === 'modern-card') {
    contentBottomY = targetHeight - Math.round(170 * scale);
  }

  // Typography Settings
  const baseTitleSize = format === '9:16' ? 62 : format === '16:9' ? 54 : 58;
  const titleFontSize = Math.round(baseTitleSize * scale);
  const subtitleFontSize = Math.round(26 * scale);
  const categoryFontSize = Math.round(18 * scale);
  const maxWidth = targetWidth - paddingX * 2;

  ctx.textAlign = style.titleAlign || 'left';
  const textAnchorX =
    style.titleAlign === 'center'
      ? targetWidth / 2
      : style.titleAlign === 'right'
      ? targetWidth - paddingX
      : paddingX;

  // Measure title wrapped lines
  ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
  const titleLines = wrapText(ctx, titleText, maxWidth, 4);
  const titleLineHeight = titleFontSize * 1.22;
  const titleBlockH = titleLines.length * titleLineHeight;

  // Measure subtitle lines
  let subtitleLines: string[] = [];
  const subtitleLineHeight = subtitleFontSize * 1.35;
  if (subtitleText) {
    ctx.font = `500 ${subtitleFontSize}px "Plus Jakarta Sans", sans-serif`;
    subtitleLines = wrapText(ctx, subtitleText, maxWidth, 3);
  }
  const subtitleBlockH = subtitleLines.length > 0 ? subtitleLines.length * subtitleLineHeight + 16 * scale : 0;

  // Measure Category Badge
  const categoryBadgeH = Math.round(38 * scale);
  const extraSpacing = Math.round(24 * scale);

  const totalBlockH = categoryBadgeH + extraSpacing + titleBlockH + subtitleBlockH + (dateLocationText ? 30 * scale : 0);
  let currentY = contentBottomY - totalBlockH;

  // Draw Category Pill / Tag
  if (contentCategory) {
    ctx.font = `800 ${categoryFontSize}px "Plus Jakarta Sans", sans-serif`;
    const catTextW = ctx.measureText(contentCategory.toUpperCase()).width;
    const catPillW = catTextW + 36 * scale;
    let catPillX = paddingX;
    if (style.titleAlign === 'center') {
      catPillX = (targetWidth - catPillW) / 2;
    }

    const badgeBg = style.badgeColor || brandPrimary;
    ctx.fillStyle = badgeBg;
    drawRoundedRect(ctx, catPillX, currentY, catPillW, categoryBadgeH, 8 * scale);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(contentCategory.toUpperCase(), catPillX + catPillW / 2, currentY + categoryBadgeH / 2 + 1 * scale);

    currentY += categoryBadgeH + Math.round(20 * scale);
  }

  // Draw Quote Mark if Interview Template
  if (style.layout === 'quote-interview') {
    ctx.fillStyle = style.badgeColor || '#3B82F6';
    ctx.font = `800 ${Math.round(80 * scale)}px "Plus Jakarta Sans", serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('“', paddingX, currentY - 30 * scale);
    currentY += 20 * scale;
  }

  // Draw Title Lines
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = style.titleAlign || 'left';
  ctx.textBaseline = 'top';

  // Subtle drop shadow on title for maximum readability
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 12 * scale;
  ctx.shadowOffsetY = 4 * scale;

  for (const line of titleLines) {
    ctx.fillText(line, textAnchorX, currentY);
    currentY += titleLineHeight;
  }
  ctx.restore();

  // Draw Subtitle if present
  if (subtitleLines.length > 0) {
    currentY += Math.round(14 * scale);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.92)'; // Soft slate 100
    ctx.font = `500 ${subtitleFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = style.titleAlign || 'left';

    for (const line of subtitleLines) {
      ctx.fillText(line, textAnchorX, currentY);
      currentY += subtitleLineHeight;
    }
  }

  // Date and Location line
  if (dateLocationText) {
    currentY += Math.round(12 * scale);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
    ctx.font = `600 ${Math.round(18 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = style.titleAlign || 'left';
    ctx.fillText(dateLocationText, textAnchorX, currentY);
  }

  // 5. Automated Footer (Minha Marca)
  if (brand.footerEnabled) {
    renderAutomatedFooter(ctx, targetWidth, targetHeight, brand, style.footerStyle, scale, paddingX);
  }
}

function drawBrandPill(
  ctx: CanvasRenderingContext2D,
  brand: BrandConfig,
  x: number,
  y: number,
  scale: number
) {
  const brandName = brand.pageName || 'Criet';
  ctx.font = `800 ${Math.round(22 * scale)}px "Plus Jakarta Sans", sans-serif`;
  const nameW = ctx.measureText(brandName).width;
  const pillW = nameW + 36 * scale;
  const pillH = Math.round(50 * scale);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  drawRoundedRect(ctx, x, y, pillW, pillH, 12 * scale);
  ctx.fill();

  // Tiny brand indicator bar on left
  ctx.fillStyle = brand.primaryColor || '#2563EB';
  drawRoundedRect(ctx, x + 6 * scale, y + 8 * scale, 4 * scale, pillH - 16 * scale, 2 * scale);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(brandName, x + 20 * scale, y + pillH / 2);
}

// Automated Footer Renderer
function renderAutomatedFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brand: BrandConfig,
  footerStyle: string = 'clean-line',
  scale: number,
  paddingX: number
) {
  const footerH = Math.round(110 * scale);
  const footerY = height - footerH;

  if (footerStyle === 'brand-bar') {
    ctx.fillStyle = brand.primaryColor || '#1D4ED8';
    ctx.fillRect(0, footerY, width, footerH);
  } else if (footerStyle === 'dark-bar') {
    ctx.fillStyle = 'rgba(9, 14, 26, 0.95)';
    ctx.fillRect(0, footerY, width, footerH);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, footerY, width, 1.5 * scale);
  } else {
    // Clean line style with soft gradient
    const footGrad = ctx.createLinearGradient(0, footerY, 0, height);
    footGrad.addColorStop(0, 'rgba(11, 19, 43, 0.8)');
    footGrad.addColorStop(1, 'rgba(7, 12, 28, 0.98)');
    ctx.fillStyle = footGrad;
    ctx.fillRect(0, footerY, width, footerH);

    // Separator line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(paddingX, footerY, width - paddingX * 2, 1.5 * scale);
  }

  // Left item: Instagram / Page Name
  const leftText = brand.instagram || `@${brand.pageName.toLowerCase().replace(/\s+/g, '')}`;
  // Right item: Phone / Website
  const rightItems = [brand.phone, brand.website].filter(Boolean);
  const rightText = rightItems.join('  •  ');

  const contentY = footerY + footerH / 2;
  const fontSize = Math.round(20 * scale);

  ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';

  // Left
  ctx.textAlign = 'left';
  ctx.fillText(leftText, paddingX, contentY);

  // Right
  if (rightText) {
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
    ctx.fillText(rightText, width - paddingX, contentY);
  }
}

// Utility: load HTML image safely
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Export canvas as image download
export function downloadCanvasImage(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpeg' = 'png') {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.94 : undefined;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  const link = document.createElement('a');
  link.download = filename.endsWith(`.${format}`) ? filename : `${filename}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
