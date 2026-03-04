// Markdown export — spec-quality output with platform dimensions, spacing,
// and per-element size context. Useful as a design handoff doc or reference.

import type { LookyLooSchema, Section, DesignLanguage, DesignTokens } from '../schema/types';
import { isScreenSchema, isFlowSchema } from '../schema/types';

// ─── Platform dimensions ──────────────────────────────────────────────────────

const PLATFORM_DIMENSIONS: Record<string, string> = {
  mobile: '390 × 844 pt (iPhone base)',
  tablet: '820 × 1180 pt (iPad Air)',
  web:    '1440 × 900 px (desktop)',
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

const SPACING_LABEL: Record<string, string> = {
  compact:     'Compact (8px base)',
  comfortable: 'Comfortable (16px base)',
  spacious:    'Spacious (24px base)',
};

// ─── Approximate section heights and spacing ──────────────────────────────────

const SECTION_HEIGHT: Record<string, string> = {
  'header':      '~56px',
  'top-nav':     '~44px',
  'bottom-nav':  '~83px (incl. safe area)',
  'toolbar':     '~44px',
  'banner':      '~48px',
  'footer':      '~80px',
  'hero':        '~240–320px',
  'empty-state': '~200px',
  'modal':       '~320–480px (overlay)',
  'sidebar':     'full height · ~240px wide',
};

// Internal padding (top/bottom, left/right) per section type
const SECTION_PADDING: Record<string, string> = {
  'header':      '10px 16px',
  'hero':        '40px 24px',
  'top-nav':     '0 8px',
  'bottom-nav':  '8px 0',
  'toolbar':     '8px 12px',
  'banner':      '10px 16px',
  'footer':      '16px 24px',
  'form':        '16px 16px',
  'list':        '0 16px',
  'grid':        '12px 16px',
  'empty-state': '40px 24px',
  'modal':       '24px',
  'sidebar':     '12px 0',
  'content':     '16px 16px',
};

// Gap between items within a section, by spacing setting
const ITEM_GAP: Record<string, string> = {
  compact:     '6px',
  comfortable: '8px',
  spacious:    '16px',
};

// ─── Per-element size hints ───────────────────────────────────────────────────

function elementHint(label: string): string {
  const s = label.toLowerCase();
  if (/\b(headline|h1|main title|page title|hero title)\b/.test(s))
    return '24–32px, bold';
  if (/\b(subheadline|subtitle|h2|h3|tagline|description|subtext|supporting)\b/.test(s))
    return '16–20px, medium';
  if (/\b(body|paragraph|copy|body text|text block)\b/.test(s))
    return '14–16px, regular';
  if (/\b(primary button|cta|call to action|get started|try free|sign up now)\b/.test(s))
    return '15px, semibold · 48px height · full-width on mobile';
  if (/\b(button|btn|submit|continue|next|save|confirm|sign up|log in|register|send)\b/.test(s))
    return '14px, semibold · 40–44px height';
  if (/\b(secondary|cancel|back|dismiss|skip|outline|ghost)\b/.test(s) && /\b(button|btn|action)\b/.test(s))
    return '14px · 40px height · ghost/outline variant';
  if (/\b(avatar|profile photo|user photo|user avatar)\b/.test(s))
    return '32–40px circle';
  if (/\b(logo|brand|wordmark)\b/.test(s))
    return '~24px height';
  if (/\b(input|field|email|password|search|form field|phone|address|textarea)\b/.test(s))
    return '14px · 40–44px height · 1px border · 4px radius';
  if (/\b(badge|tag|chip|status|pill)\b/.test(s))
    return '11–12px · 20–24px height';
  if (/\b(icon|symbol)\b/.test(s))
    return '20–24px';
  if (/\b(image|photo|thumbnail|cover|hero image|illustration)\b/.test(s))
    return 'fluid width · 16:9 or 1:1 ratio';
  return '';
}

// ─── Section renderer ─────────────────────────────────────────────────────────

function renderSection(s: Section, index: number, spacing: string = 'comfortable'): string {
  const lines: string[] = [];

  const heightHint = SECTION_HEIGHT[s.type];
  const padding = SECTION_PADDING[s.type];
  const gap = ITEM_GAP[spacing] ?? ITEM_GAP['comfortable'];

  const layoutNote  = s.layout ? ` · ${s.layout}` : '';
  const heightNote  = heightHint ? ` · ${heightHint}` : '';
  const heading = `### ${index + 1}. ${s.label ?? s.type} \`${s.type}\`${layoutNote}${heightNote}`;
  lines.push(heading);

  const spacingLine = [
    padding  ? `padding: ${padding}` : null,
    `gap: ${gap}`,
  ].filter(Boolean).join(' · ');
  lines.push(`*${spacingLine}*`);
  lines.push('');

  for (const item of s.contains) {
    const hint = elementHint(item);
    lines.push(hint ? `- ${item} *(${hint})*` : `- ${item}`);
  }

  if (s.note) {
    lines.push('');
    lines.push(`> ${s.note}`);
  }

  return lines.join('\n');
}

// ─── Design language summary ──────────────────────────────────────────────────

function renderDesignLanguage(dl: DesignLanguage): string {
  const parts: string[] = [];
  if (dl.nav_position)  parts.push(`Nav: ${dl.nav_position}`);
  if (dl.header_style)  parts.push(`Header: ${dl.header_style}`);
  if (dl.spacing)       parts.push(`Spacing: ${SPACING_LABEL[dl.spacing] ?? dl.spacing}`);
  if (dl.color_scheme)  parts.push(`Colors: ${dl.color_scheme}`);
  if (dl.card_style)    parts.push(`Cards: ${dl.card_style}`);
  return parts.length ? parts.join(' · ') : '';
}

// ─── Token tables ─────────────────────────────────────────────────────────────

function renderTokens(tokens: DesignTokens): string {
  const lines: string[] = [];

  lines.push('## Design Tokens');
  lines.push('');
  lines.push('*shadcn/ui zinc palette · Inter/system-ui · Replace these values in your design tool to match your own system.*');
  lines.push('');

  // Colors
  lines.push('### Colors');
  lines.push('| Token | Value |');
  lines.push('|-------|-------|');
  for (const [k, v] of Object.entries(tokens.colors)) {
    lines.push(`| \`${k}\` | \`${v}\` |`);
  }
  lines.push('');

  // Typography
  lines.push('### Typography');
  lines.push('| Role | Size | Weight | Line Height | Family |');
  lines.push('|------|------|--------|-------------|--------|');
  for (const [role, spec] of Object.entries(tokens.typography)) {
    lines.push(`| \`${role}\` | ${spec.size}px | ${spec.weight} | ${spec.lineHeight} | ${spec.family} |`);
  }
  lines.push('');

  // Spacing
  lines.push('### Spacing');
  lines.push('| Scale | Value |');
  lines.push('|-------|-------|');
  for (const [k, v] of Object.entries(tokens.spacing)) {
    lines.push(`| \`${k}\` | ${v}px |`);
  }
  lines.push('');

  // Components
  lines.push('### Components');
  lines.push('| Spec | Value |');
  lines.push('|------|-------|');
  for (const [k, v] of Object.entries(tokens.components)) {
    const display = typeof v === 'number' ? `${v}px` : v;
    lines.push(`| \`${k}\` | ${display} |`);
  }

  return lines.join('\n');
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildMarkdown(schema: LookyLooSchema): string {
  const lines: string[] = [];

  const disclaimer =
    '> **Wireframe** — sizes and spacing are guides. ' +
    'Design system: **shadcn/ui zinc**. ' +
    'Replace token values in your design tool to match your own system.';

  if (isScreenSchema(schema)) {
    lines.push(`# ${schema.label}`);
    lines.push('');
    lines.push(disclaimer);
    lines.push('');
    lines.push(`| | |`);
    lines.push(`|---|---|`);
    lines.push(`| **Platform** | ${schema.platform.charAt(0).toUpperCase() + schema.platform.slice(1)} — ${PLATFORM_DIMENSIONS[schema.platform] ?? schema.platform} |`);
    lines.push(`| **Generated** | ${formatTimestampMd(schema.timestamp)} |`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Layout');
    lines.push('');
    for (let i = 0; i < schema.sections.length; i++) {
      lines.push(renderSection(schema.sections[i], i, 'comfortable'));
      lines.push('');
    }

  } else if (isFlowSchema(schema)) {
    lines.push(`# ${schema.label}`);
    lines.push('');
    lines.push(disclaimer);
    lines.push('');
    lines.push(`| | |`);
    lines.push(`|---|---|`);
    lines.push(`| **Platform** | ${schema.platform.charAt(0).toUpperCase() + schema.platform.slice(1)} — ${PLATFORM_DIMENSIONS[schema.platform] ?? schema.platform} |`);
    lines.push(`| **Generated** | ${formatTimestampMd(schema.timestamp)} |`);
    const dlNote = renderDesignLanguage(schema.design_language);
    if (dlNote) lines.push(`| **Design language** | ${dlNote} |`);
    lines.push('');
    lines.push('---');
    lines.push('');

    const flowSpacing = schema.design_language.spacing ?? 'comfortable';
    for (const screen of schema.screens) {
      lines.push(`## ${screen.label}`);
      lines.push('');
      for (let i = 0; i < screen.sections.length; i++) {
        lines.push(renderSection(screen.sections[i], i, flowSpacing));
        lines.push('');
      }
      lines.push('---');
      lines.push('');
    }
  }

  if (schema.tokens) {
    lines.push('---');
    lines.push('');
    lines.push(renderTokens(schema.tokens));
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('<details>');
  lines.push('<summary>Looky Loo schema — paste into Claude to re-render exactly</summary>');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(schema, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('</details>');
  lines.push('');
  lines.push('<sub>Generated by [Looky Loo](https://github.com/carlostarrats/lookyloo)</sub>');
  return lines.join('\n');
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function copyAsGithubMarkdown(schema: LookyLooSchema): Promise<void> {
  await navigator.clipboard.writeText(buildMarkdown(schema));
}

export function downloadAsMarkdown(schema: LookyLooSchema, label: string): void {
  const md = buildMarkdown(schema);
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${slugify(label)}.md`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function formatTimestampMd(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
