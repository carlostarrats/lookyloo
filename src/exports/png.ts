// PNG export — captures the wireframe element and returns raw PNG bytes.
// Uses html-to-image (SVG-based) which works reliably in Tauri's WKWebView.

import { toPng } from 'html-to-image';

interface ExportOptions {
  label: string;
  timestamp: string;
  element: HTMLElement;
}

export async function capturePng({ label, timestamp, element }: ExportOptions): Promise<Uint8Array> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    skipFonts: true,
  });

  // Compose: header block above the wireframe capture
  const img = await loadImage(dataUrl);
  const headerHeight = 52;
  const padding = 16;

  const composed = document.createElement('canvas');
  composed.width = img.width + padding * 2;
  composed.height = img.height + headerHeight + padding * 2;

  const ctx = composed.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, composed.width, composed.height);

  ctx.fillStyle = '#111111';
  ctx.font = `600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillText('Looky Loo  —  ' + label, padding, padding + 22);

  ctx.fillStyle = '#888888';
  ctx.font = `400 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillText(formatTimestamp(timestamp), padding, padding + 44);

  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, headerHeight);
  ctx.lineTo(composed.width - padding, headerHeight);
  ctx.stroke();

  ctx.drawImage(img, padding, headerHeight + padding / 2);

  const blob = await new Promise<Blob>((resolve, reject) => {
    composed.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
  });

  return new Uint8Array(await blob.arrayBuffer());
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return (
    date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
    '  ' +
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  );
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
