// PNG export — captures the wireframe element only (not panel chrome).
// Output looks like a proper wireframe artifact: label + timestamp in a header,
// then the wireframe render below. Suitable for Slack, decks, Jira tickets.

import html2canvas from 'html2canvas';

interface ExportOptions {
  label: string;
  timestamp: string;
  element: HTMLElement; // The .wireframe element to capture
}

export async function exportToPng({ label, timestamp, element }: ExportOptions): Promise<void> {
  // Capture just the wireframe node
  const canvas = await html2canvas(element, {
    backgroundColor: getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-subtle')
      .trim() || '#f5f5f5',
    scale: 2, // Retina quality
    logging: false,
    useCORS: false,
  });

  // Compose: header block above the wireframe capture
  const headerHeight = 52;
  const padding = 16;
  const composed = document.createElement('canvas');
  composed.width = canvas.width + padding * 2;
  composed.height = canvas.height + headerHeight + padding * 2;

  const ctx = composed.getContext('2d');
  if (!ctx) return;

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#eeeeee' : '#111111';
  const mutedColor = isDark ? '#666666' : '#888888';
  const borderColor = isDark ? '#333333' : '#e5e5e5';

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, composed.width, composed.height);

  // Header text
  ctx.fillStyle = textColor;
  ctx.font = `600 ${13 * 2}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillText('Looky Loo  —  ' + label, padding, padding + 22);

  ctx.fillStyle = mutedColor;
  ctx.font = `400 ${11 * 2}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillText(formatTimestamp(timestamp), padding, padding + 44);

  // Divider
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, headerHeight);
  ctx.lineTo(composed.width - padding, headerHeight);
  ctx.stroke();

  // Wireframe capture
  ctx.drawImage(canvas, padding, headerHeight + padding / 2);

  // Download
  const link = document.createElement('a');
  link.download = `lookyloo-${slugify(label)}.png`;
  link.href = composed.toDataURL('image/png');
  link.click();
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
    '  ' +
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
