import { useCallback, useEffect, useRef, useState, Component } from 'react';
import type { ReactNode } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs';
import { useDaemonSocket } from './hooks/useDaemonSocket';
import { useTabs } from './hooks/useTabs';
import { validateSchema } from './schema/validate';
import { isScreenSchema, isFlowSchema } from './schema/types';
import type { ScreenSchema } from './schema/types';
import { SkeletonScreen } from './components/SkeletonScreen';
import { WireframeScreen } from './components/wireframe/WireframeScreen';
import { capturePng, slugify } from './exports/png';
import { copyAsGithubMarkdown, buildMarkdown } from './exports/github';
import type { PanelMessage } from './types/messages';
import type { Tab } from './hooks/useTabs';
import './App.css';

class WireframeErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '16px', color: '#c00', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all', background: '#fff0f0' }}>
          <strong>Render error:</strong> {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

const IDLE_PHRASES = ['Watching.', 'Ready.', 'On deck.', 'Listening.', 'Standing by.'];

function useIdlePhrase() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % IDLE_PHRASES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);
  return IDLE_PHRASES[index];
}

export default function App() {
  const idlePhrase = useIdlePhrase();
  const { tabs, activeTab, activeTabId, setActiveTabId, addTab, clearTabs } = useTabs();

  const handleMessage = useCallback(
    (msg: PanelMessage) => {
      if (msg.type === 'clear') {
        clearTabs();
        return;
      }

      const result = validateSchema(msg.schema);
      if (!result.valid) {
        console.warn('[lookyloo] invalid schema received:', result.error);
        return;
      }

      if (isFlowSchema(result.schema)) {
        for (const screen of result.schema.screens) {
          const screenSchema: ScreenSchema = {
            schema: 'v1',
            type: 'screen',
            label: screen.label,
            timestamp: result.schema.timestamp,
            platform: screen.platform ?? result.schema.platform,
            sections: screen.sections,
          };
          addTab(screenSchema);
        }
      } else {
        addTab(result.schema);
      }

      getCurrentWebviewWindow().show().catch(() => {});
    },
    [addTab, clearTabs]
  );

  useDaemonSocket(handleMessage);

  return (
    <div className="panel">
      {tabs.length > 0 ? (
        <>
          <div className="tab-bar" data-tauri-drag-region>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={[
                  'tab',
                  tab.id === activeTabId ? 'tab--active' : '',
                  tab.status === 'loading' ? 'tab--loading' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveTabId(tab.id)}
                title={tab.label}
              >
                {tab.status === 'loading' && <span className="tab-spinner" aria-hidden />}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="content">
            {activeTab ? <TabContent tab={activeTab} /> : null}
          </div>
        </>
      ) : (
        <div className="idle" data-tauri-drag-region>
          <span className="idle-phrase">{idlePhrase}</span>
        </div>
      )}
    </div>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  const wireframeRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  if (tab.status === 'loading') {
    return <SkeletonScreen platform={tab.platform} />;
  }

  const ts = formatTimestamp(tab.timestamp);

  function flash(label: string) {
    setConfirmed(label);
    setTimeout(() => setConfirmed(null), 2000);
  }

  function openMenu() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  }

  function closeMenu() {
    setMenuPos(null);
  }

  async function handleCopyMarkdown() {
    closeMenu();
    if (!tab.schema) return;
    await copyAsGithubMarkdown(tab.schema);
    flash('Copied');
  }

  async function handleSaveMd() {
    closeMenu();
    if (!tab.schema) return;
    const path = await save({
      defaultPath: `${slugify(tab.label)}.md`,
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    });
    if (path) await writeTextFile(path, buildMarkdown(tab.schema));
  }

  async function handleSavePng() {
    closeMenu();
    if (!wireframeRef.current || !tab.schema) return;
    const el = wireframeRef.current.querySelector<HTMLElement>('.wireframe');
    if (!el) return;
    try {
      const bytes = await capturePng({ label: tab.label, timestamp: tab.timestamp, element: el });
      const path = await save({
        defaultPath: `lookyloo-${slugify(tab.label)}.png`,
        filters: [{ name: 'PNG Image', extensions: ['png'] }],
      });
      if (path) {
        await writeFile(path, bytes);
        flash('Saved PNG');
      }
    } catch (e) {
      console.error('[lookyloo] PNG export error:', e);
      flash('PNG failed');
    }
  }

  return (
    <div className="tab-content">
      <div className="tab-content__header" data-tauri-drag-region>
        <span className="tab-content__timestamp">{ts}</span>
        <button ref={buttonRef} className="actions-toggle" onClick={openMenu} title="Export options">
          {confirmed
            ? <span className="actions-toggle__confirmed">{confirmed}</span>
            : <span className="actions-toggle__dots" aria-hidden><span/><span/><span/></span>
          }
        </button>
      </div>
      <div className="tab-content__wireframe" ref={wireframeRef}>
        <WireframeErrorBoundary>
          {tab.schema && isScreenSchema(tab.schema)
            ? <WireframeScreen schema={tab.schema} />
            : null
          }
        </WireframeErrorBoundary>
      </div>
      {menuPos && (
        <>
          <div className="actions-menu-overlay" onClick={closeMenu} />
          <div className="actions-menu" style={{ top: menuPos.top, right: menuPos.right }}>
            <button className="actions-menu__item" onClick={handleCopyMarkdown}>Copy Markdown</button>
            <button className="actions-menu__item" onClick={handleSaveMd}>Save .md</button>
            <div className="actions-menu__separator" />
            <button className="actions-menu__item" onClick={handleSavePng}>Save PNG</button>
          </div>
        </>
      )}
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return (
    date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ', ' +
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  );
}
