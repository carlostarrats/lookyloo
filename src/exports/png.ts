// PNG export — captures the wireframe element and returns raw PNG bytes.
// Uses html-to-image (SVG-based) which works reliably in Tauri's WKWebView.

import { toPng } from 'html-to-image';

interface ExportOptions {
  label: string;
  timestamp: string;
  element: HTMLElement;
}

const PADDING = 32; // equal whitespace on all 4 sides

export async function capturePng({ element }: ExportOptions): Promise<Uint8Array> {
  // Collapse height to content so empty space below sections isn't captured
  const savedHeight = element.style.height;
  const savedMinHeight = element.style.minHeight;
  element.style.height = 'auto';
  element.style.minHeight = 'unset';

  // Strip box-shadow from all descendants so it doesn't bleed outside the element bounds
  const allNodes = [element, ...Array.from(element.querySelectorAll<HTMLElement>('*'))];
  const savedStyles = allNodes.map((n) => ({ node: n, shadow: n.style.boxShadow, filter: n.style.filter }));
  savedStyles.forEach(({ node }) => { node.style.boxShadow = 'none'; node.style.filter = 'none'; });

  let dataUrl: string;
  try {
    dataUrl = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
    });
  } finally {
    element.style.height = savedHeight;
    element.style.minHeight = savedMinHeight;
    savedStyles.forEach(({ node, shadow, filter }) => { node.style.boxShadow = shadow; node.style.filter = filter; });
  }

  // Add equal padding on all sides via canvas composition
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const scale = 2; // matches pixelRatio above
  canvas.width = img.width + PADDING * scale * 2;
  canvas.height = img.height + PADDING * scale * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, PADDING * scale, PADDING * scale);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
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


export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
