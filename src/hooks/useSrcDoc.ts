import { useState, useEffect, type RefObject } from 'react';

/**
 * Builds a self-contained HTML string from the live wireframe DOM after first paint.
 * Returns null until the DOM is ready. Runs off the critical render path.
 */
export function useSrcDoc(
  wireframeRef: RefObject<HTMLDivElement | null>,
  ready: boolean,
): string | null {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !wireframeRef.current) return;

    // Run after paint so we don't block the main render
    const id = requestAnimationFrame(() => {
      const root = wireframeRef.current;
      if (!root) return;

      const wireframeEl = root.querySelector('.wireframe');
      if (!wireframeEl) return;

      // Collect all stylesheet text that's already been parsed by the browser
      const styleTexts: string[] = [];

      // Inline <style> tags
      document.querySelectorAll('style').forEach(el => {
        if (el.textContent) styleTexts.push(el.textContent);
      });

      // External stylesheets (already parsed, read via CSSStyleSheet rules)
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules ?? []);
          styleTexts.push(rules.map(r => r.cssText).join('\n'));
        } catch {
          // cross-origin sheets are inaccessible — skip
        }
      });

      const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
body { margin: 0; padding: 0; background: transparent; }
${styleTexts.join('\n')}
</style>
</head>
<body>
${wireframeEl.outerHTML}
</body>
</html>`;

      setSrcDoc(html);
    });

    return () => cancelAnimationFrame(id);
  }, [ready, wireframeRef]);

  return srcDoc;
}
