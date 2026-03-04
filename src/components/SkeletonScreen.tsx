import type { Platform } from '../schema/types';
import './SkeletonScreen.css';

interface Props {
  platform: Platform;
}

export function SkeletonScreen({ platform }: Props) {
  return (
    <div className={`skeleton skeleton--${platform}`} aria-label="Loading wireframe…" aria-busy>
      {platform === 'web' ? <WebSkeleton /> : <MobileSkeleton />}
    </div>
  );
}

// ─── Mobile / tablet skeleton ─────────────────────────────────────────────────
// Mimics: header → content block → card grid → bottom nav

function MobileSkeleton() {
  return (
    <div className="sk-mobile">
      {/* Header */}
      <div className="sk-row sk-row--spread sk-header">
        <div className="sk-block sk-block--sm" />
        <div className="sk-block sk-block--xs" />
        <div className="sk-block sk-block--xs sk-block--circle" />
      </div>

      {/* Hero / primary content */}
      <div className="sk-section">
        <div className="sk-block sk-block--title" style={{ animationDelay: '0.1s' }} />
        <div className="sk-block sk-block--subtitle" style={{ animationDelay: '0.15s' }} />
        <div className="sk-block sk-block--subtitle sk-block--short" style={{ animationDelay: '0.2s' }} />
        <div className="sk-block sk-block--cta" style={{ animationDelay: '0.25s' }} />
      </div>

      {/* Card row */}
      <div className="sk-section">
        <div className="sk-row">
          <div className="sk-block sk-block--card" style={{ animationDelay: '0.2s' }} />
          <div className="sk-block sk-block--card" style={{ animationDelay: '0.3s' }} />
          <div className="sk-block sk-block--card" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Second content block */}
      <div className="sk-section">
        <div className="sk-block sk-block--full" style={{ animationDelay: '0.3s' }} />
        <div className="sk-block sk-block--full sk-block--sm-height" style={{ animationDelay: '0.35s' }} />
        <div className="sk-block sk-block--wide" style={{ animationDelay: '0.4s' }} />
      </div>

      {/* Bottom nav */}
      <div className="sk-bottom-nav">
        {[0, 0.1, 0.2, 0.3].map((delay, i) => (
          <div key={i} className="sk-nav-item" style={{ animationDelay: `${delay}s` }}>
            <div className="sk-block sk-block--nav-icon" />
            <div className="sk-block sk-block--nav-label" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Web skeleton ─────────────────────────────────────────────────────────────
// Mimics: top nav → [sidebar | main content]

function WebSkeleton() {
  return (
    <div className="sk-web">
      {/* Top nav */}
      <div className="sk-row sk-row--spread sk-web-nav">
        <div className="sk-block sk-block--sm" />
        <div className="sk-row sk-row--gap">
          <div className="sk-block sk-block--nav-pill" style={{ animationDelay: '0.05s' }} />
          <div className="sk-block sk-block--nav-pill" style={{ animationDelay: '0.1s' }} />
          <div className="sk-block sk-block--nav-pill" style={{ animationDelay: '0.15s' }} />
        </div>
        <div className="sk-block sk-block--xs sk-block--circle" style={{ animationDelay: '0.2s' }} />
      </div>

      {/* Body */}
      <div className="sk-web-body">
        {/* Sidebar */}
        <div className="sk-web-sidebar">
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((delay, i) => (
            <div
              key={i}
              className={`sk-block sk-block--sidebar-item ${i % 3 === 1 ? 'sk-block--sidebar-item--active' : ''}`}
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="sk-web-main">
          <div className="sk-block sk-block--page-title" style={{ animationDelay: '0.1s' }} />
          <div className="sk-block sk-block--full" style={{ animationDelay: '0.15s' }} />
          <div className="sk-block sk-block--full sk-block--sm-height" style={{ animationDelay: '0.2s' }} />

          <div className="sk-row" style={{ marginTop: '16px' }}>
            <div className="sk-block sk-block--web-card" style={{ animationDelay: '0.25s' }} />
            <div className="sk-block sk-block--web-card" style={{ animationDelay: '0.3s' }} />
          </div>

          <div className="sk-block sk-block--full" style={{ animationDelay: '0.35s', marginTop: '16px' }} />
          <div className="sk-block sk-block--wide" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
