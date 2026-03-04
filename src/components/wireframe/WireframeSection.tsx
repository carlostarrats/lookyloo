// Higher-fidelity wireframe section renderer.
// Each contains[] item is classified semantically and rendered as the
// appropriate visual element using real shadcn/ui components.
// The wireframe is non-interactive (pointer-events: none on the container).

import type { Section } from '../../schema/types';
import { ChevronLeft, ChevronRight, X, Settings, Search, Menu, Plus, Share2, Pencil, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import './sections.css';

interface SectionProps {
  section: Section;
  screenLabel?: string;
}

export function WireframeSection({ section, screenLabel }: SectionProps) {
  return (
    <div className={`wf-section wf-section--${section.type}`}>
      {renderSection(section, screenLabel)}
    </div>
  );
}

function renderSection(section: Section, screenLabel?: string) {
  switch (section.type) {
    case 'header':      return <HeaderSection section={section} />;
    case 'hero':        return <HeroSection section={section} />;
    case 'content':     return <ContentSection section={section} />;
    case 'top-nav':     return <TopNavSection section={section} />;
    case 'bottom-nav':  return <BottomNavSection section={section} screenLabel={screenLabel} />;
    case 'sidebar':     return <SidebarSection section={section} screenLabel={screenLabel} />;
    case 'form':        return <FormSection section={section} />;
    case 'list':        return <ListSection section={section} />;
    case 'grid':        return <GridSection section={section} />;
    case 'footer':      return <FooterSection section={section} />;
    case 'empty-state': return <EmptyStateSection section={section} />;
    case 'banner':      return <BannerSection section={section} />;
    case 'toolbar':     return <ToolbarSection section={section} />;
    case 'modal':       return <ModalSection section={section} />;
    case 'section-group': return <SectionGroupSection section={section} />;
    case 'action-row':    return <ActionRowSection section={section} />;
    default:              return <GenericSection section={section} />;
  }
}

// ─── SmartItem ────────────────────────────────────────────────────────────────
// Classifies a string from contains[] and renders the right visual element.

type ItemType =
  | 'headline' | 'subheadline' | 'body-text'
  | 'btn-primary' | 'btn-secondary' | 'btn-destructive'
  | 'toggle-on' | 'toggle-off' | 'row-chevron'
  | 'image' | 'avatar' | 'icon' | 'logo'
  | 'input' | 'badge' | 'stat-label' | 'nav-item' | 'text';

function classify(raw: string): ItemType {
  const s = raw.toLowerCase();
  if (/·\s*toggle\s+on\b/i.test(s)) return 'toggle-on';
  if (/·\s*toggle\s+off\b/i.test(s)) return 'toggle-off';
  if (/·\s*chevron\b/i.test(s)) return 'row-chevron';
  if (/—\s*destructive\b/i.test(s)) return 'btn-destructive';
  if (/·\s*label\s*$/i.test(s)) return 'stat-label';
  if (/\b(headline|h1|main title|page title|hero title)\b/.test(s)) return 'headline';
  if (/\b(subheadline|subtitle|h2|h3|tagline|description|subtext|supporting)\b/.test(s)) return 'subheadline';
  if (/\b(body|paragraph|copy|body text|text block)\b/.test(s)) return 'body-text';
  if (/\b(primary button|cta|call to action|get started|try free|sign up now|download now)\b/.test(s)) return 'btn-primary';
  if (/\b(button|btn|submit|continue|next|save|confirm|create|sign up|log in|register|send)\b/.test(s)) return 'btn-primary';
  if (/\b(secondary|cancel|back|dismiss|skip|maybe later|no thanks|outline|ghost)\b/.test(s) && /\b(button|btn|action)\b/.test(s)) return 'btn-secondary';
  if (/\b(image|photo|thumbnail|cover|hero image|banner image|illustration|picture|poster)\b/.test(s)) return 'image';
  if (/\b(avatar|profile photo|user photo|profile pic|profile image|user avatar)\b/.test(s)) return 'avatar';
  if (/\b(logo|brand|wordmark)\b/.test(s)) return 'logo';
  if (/\b(icon|symbol)\b/.test(s) && !/\blogo\b/.test(s)) return 'icon';
  if (/\b(input|field|email|password|search|form field|phone|name|first name|last name|address|message|textarea|username)\b/.test(s)) return 'input';
  if (/\b(badge|tag|chip|status|label|pill|count)\b/.test(s)) return 'badge';
  if (/\b(link|nav link|menu item)\b/.test(s)) return 'nav-item';
  return 'text';
}

// Strip trailing type keywords and descriptors from display labels.
// "Get Started button" → "Get Started", "Sign Out button — destructive" → "Sign Out"
function displayLabel(raw: string): string {
  return raw
    .replace(/\s*—\s*.+$/i, '')
    .replace(/\s*·\s*(toggle\s+on|toggle\s+off|chevron|label)\s*$/i, '')
    .replace(/\s*(primary\s+)?(secondary\s+)?(ghost\s+)?(outline\s+)?button\b/i, '')
    .replace(/\s+\b(headline|subheadline|subtitle|input|icon|image|avatar|logo|badge|link|label)\b/i, '')
    .trim() || raw;
}

function SmartItem({ label }: { label: string }) {
  const type = classify(label);
  const text = displayLabel(label);

  switch (type) {
    case 'headline':
      return <div className="wf-smart-headline">{text}</div>;

    case 'subheadline':
      return <div className="wf-smart-subheadline">{text}</div>;

    case 'body-text':
      return (
        <div className="wf-smart-body">
          <div className="wf-text-bar" style={{ width: '100%' }} />
          <div className="wf-text-bar" style={{ width: '91%' }} />
          <div className="wf-text-bar" style={{ width: '76%' }} />
        </div>
      );

    case 'btn-primary':
      return <Button className="w-full">{text}</Button>;

    case 'btn-secondary':
      return <Button variant="outline" className="w-full">{text}</Button>;

    case 'btn-destructive':
      return <Button variant="outline" className="w-full">{text}</Button>;

    case 'toggle-on':
      return (
        <div className="wf-toggle-row">
          <span className="wf-toggle-row__label">{text}</span>
          <Switch checked={true} />
        </div>
      );

    case 'toggle-off':
      return (
        <div className="wf-toggle-row">
          <span className="wf-toggle-row__label">{text}</span>
          <Switch checked={false} />
        </div>
      );

    case 'row-chevron':
      return (
        <div className="wf-row-chevron">
          <span className="wf-row-chevron__label">{text}</span>
          <span className="wf-row-chevron__chevron">›</span>
        </div>
      );

    case 'image':
      return <div className="wf-smart-image" aria-label={label} />;

    case 'avatar':
      return (
        <Avatar>
          <AvatarFallback>{text.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      );

    case 'logo':
      return <div className="wf-smart-logo">LOGO</div>;

    case 'icon':
      return <div className="wf-smart-icon" title={label} />;

    case 'input':
      return (
        <div className="wf-smart-input-group">
          <Label>{text}</Label>
          <Input placeholder={text} />
        </div>
      );

    case 'stat-label':
      return <div className="wf-stat">{text}</div>;

    case 'badge':
      return <Badge variant="secondary">{text}</Badge>;

    case 'nav-item':
      return <span className="wf-smart-nav-item">{text}</span>;

    default:
      return <div className="wf-smart-text">{text}</div>;
  }
}

// ─── Section components ───────────────────────────────────────────────────────

function HeaderIcon({ desc }: { desc: string }) {
  const d = desc.toLowerCase();
  const p = { size: 18, strokeWidth: 1.75 } as const;
  if (/\bback\b/.test(d))                   return <ChevronLeft {...p} />;
  if (/\bforward\b/.test(d))                return <ChevronRight {...p} />;
  if (/\b(close|dismiss)\b/.test(d))        return <X {...p} />;
  if (/\bsettings\b/.test(d))               return <Settings {...p} />;
  if (/\bsearch\b/.test(d))                 return <Search {...p} />;
  if (/\b(menu|hamburger)\b/.test(d))       return <Menu {...p} />;
  if (/\badd\b|\bplus\b|\bcreate\b/.test(d)) return <Plus {...p} />;
  if (/\bshare\b/.test(d))                  return <Share2 {...p} />;
  if (/\bedit\b|\bpencil\b/.test(d))        return <Pencil {...p} />;
  if (/\bnotif|\bbell\b/.test(d))           return <Bell {...p} />;
  return <Settings {...p} />;
}

function HeaderSection({ section }: SectionProps) {
  const items = section.contains;
  const hasLogo   = items.some(s => /\b(logo|brand|wordmark)\b/i.test(s));
  const hasAvatar = items.some(s => /\b(avatar|profile photo|user photo|user avatar)\b/i.test(s));

  // Web-style: logo or avatar (without a "back" item)
  if (hasLogo || hasAvatar) {
    const logoItems   = items.filter(s => /\b(logo|brand)\b/i.test(s));
    const avatarItems = items.filter(s => /\b(avatar|profile photo|user photo|user avatar)\b/i.test(s));
    const navItems    = items.filter(s => !logoItems.includes(s) && !avatarItems.includes(s));
    return (
      <div className="wf-header-row">
        {logoItems.length > 0 && (
          <div className="wf-header-left"><div className="wf-smart-logo">LOGO</div></div>
        )}
        <div className="wf-header-nav">
          {navItems.map((item, i) => (
            <span key={i} className="wf-header-nav-link">{displayLabel(item)}</span>
          ))}
        </div>
        {avatarItems.length > 0 && (
          <div className="wf-header-right"><div className="wf-smart-avatar wf-smart-avatar--sm" /></div>
        )}
      </div>
    );
  }

  // Mobile-style: symbols on left/right, title in center
  const leftItems   = items.filter(s => /\b(back|close|dismiss|cancel|menu|hamburger)\b/i.test(s));
  const centerItems = items.filter(s =>
    /\b(label|title|heading)\b/i.test(s) && !leftItems.includes(s)
  );
  const rightItems  = items.filter(s => !leftItems.includes(s) && !centerItems.includes(s));

  return (
    <div className="wf-header-mobile">
      <div className="wf-header-mobile__left">
        {leftItems.map((item, i) => (
          <span key={i} className="wf-header-symbol"><HeaderIcon desc={item} /></span>
        ))}
      </div>
      <div className="wf-header-mobile__center">
        {centerItems.map((item, i) => (
          <span key={i} className="wf-header-mobile__title">{displayLabel(item)}</span>
        ))}
      </div>
      <div className="wf-header-mobile__right">
        {rightItems.map((item, i) => (
          <span key={i} className="wf-header-symbol"><HeaderIcon desc={item} /></span>
        ))}
      </div>
    </div>
  );
}

function HeroSection({ section }: SectionProps) {
  return (
    <div className="wf-hero-inner">
      {section.label && <div className="wf-section__label">{section.label}</div>}
      {section.contains.map((item, i) => <SmartItem key={i} label={item} />)}
    </div>
  );
}

function ContentSection({ section }: SectionProps) {
  return (
    <div className="wf-content-inner">
      {section.label && <div className="wf-section__label">{section.label}</div>}
      {section.contains.map((item, i) => <SmartItem key={i} label={item} />)}
    </div>
  );
}

function TopNavSection({ section }: SectionProps) {
  return (
    <div className="wf-top-nav-row">
      {section.contains.map((item, i) => (
        <div key={i} className={`wf-top-nav-tab ${i === 0 ? 'wf-top-nav-tab--active' : ''}`}>
          {item}
        </div>
      ))}
    </div>
  );
}

function BottomNavSection({ section, screenLabel }: SectionProps) {
  return (
    <>
      {section.contains.map((item, i) => {
        const active = screenLabel
          ? item.toLowerCase() === screenLabel.toLowerCase() ||
            screenLabel.toLowerCase().includes(item.toLowerCase())
          : i === 0;
        return (
          <div key={i} className={`wf-bottom-nav-item ${active ? 'wf-bottom-nav-item--active' : ''}`}>
            <div className="wf-bottom-nav-item__icon" />
            <span className="wf-bottom-nav-item__label">{item}</span>
          </div>
        );
      })}
    </>
  );
}

function SidebarSection({ section, screenLabel }: SectionProps) {
  return (
    <div className="wf-sidebar-list">
      {section.label && <div className="wf-section__label">{section.label}</div>}
      {section.contains.map((item, i) => {
        const active = screenLabel
          ? item.toLowerCase() === screenLabel.toLowerCase() ||
            screenLabel.toLowerCase().includes(item.toLowerCase())
          : i === 0;
        return (
          <div key={i} className={`wf-sidebar-item ${active ? 'wf-sidebar-item--active' : ''}`}>
            <div className="wf-smart-icon" />
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
}

function FormSection({ section }: SectionProps) {
  return (
    <div className="wf-form-inner">
      {section.label && <div className="wf-section__label">{section.label}</div>}
      {section.contains.map((item, i) => <SmartItem key={i} label={item} />)}
    </div>
  );
}

function ListSection({ section }: SectionProps) {
  return (
    <div className="wf-list">
      {section.label && <div className="wf-list__label wf-section__label">{section.label}</div>}
      {section.contains.map((item, i) => (
        <div key={i}>
          <div className="wf-list-row">
            <Avatar className="wf-smart-avatar--sm">
              <AvatarFallback>{item.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="wf-list-row__text">
              <div className="wf-list-row__primary">{item}</div>
              <div className="wf-list-row__secondary" />
            </div>
            <span className="wf-list-row__chevron">›</span>
          </div>
          {i < section.contains.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}

function GridSection({ section }: SectionProps) {
  return (
    <div className="wf-grid-inner">
      {section.label && <div className="wf-section__label">{section.label}</div>}
      <div className="wf-grid">
        {section.contains.map((item, i) => (
          <Card key={i} className="wf-grid-card overflow-hidden">
            <div className="wf-grid-card__image" />
            <CardContent className="p-2">
              <p className="text-xs font-medium leading-snug">{item}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FooterSection({ section }: SectionProps) {
  return (
    <div className="wf-footer-row">
      {section.contains.map((item, i) => (
        <span key={i} className="wf-footer-link">{item}</span>
      ))}
    </div>
  );
}

function EmptyStateSection({ section }: SectionProps) {
  return (
    <div className="wf-empty-state">
      <div className="wf-empty-state__icon" aria-hidden />
      {section.contains.map((item, i) => <SmartItem key={i} label={item} />)}
    </div>
  );
}

function BannerSection({ section }: SectionProps) {
  return (
    <div className="wf-banner-inner">
      <div className="wf-banner-icon" aria-hidden />
      <div className="wf-banner-content">
        {section.contains.map((item, i) => (
          <span key={i} className="wf-banner-text">{item}</span>
        ))}
      </div>
      <div className="wf-banner-dismiss">✕</div>
    </div>
  );
}

function ToolbarSection({ section }: SectionProps) {
  return (
    <>
      {section.contains.map((item, i) => (
        <div key={i} className="wf-toolbar-btn" title={item}>
          <div className="wf-smart-icon" />
        </div>
      ))}
    </>
  );
}

function SectionGroupSection({ section }: SectionProps) {
  return (
    <div className="wf-section-group">
      {section.label && <div className="wf-section-group__header">{section.label}</div>}
      <div className="wf-section-group__card">
        {section.contains.map((item, i) => (
          <div key={i}>
            <div className="wf-section-group__row">
              <SmartItem label={item} />
            </div>
            {i < section.contains.length - 1 && (
              <div className="wf-section-group__divider" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionRowSection({ section }: SectionProps) {
  return (
    <div className="wf-action-row-inner">
      {section.contains.map((item, i) => (
        <SmartItem key={i} label={item} />
      ))}
    </div>
  );
}

function GenericSection({ section }: SectionProps) {
  return (
    <div className="wf-generic-inner">
      <div className="wf-generic-type-label">{section.label ?? section.type}</div>
      <div className="wf-generic-items">
        {section.contains.map((item, i) => <SmartItem key={i} label={item} />)}
      </div>
    </div>
  );
}

function ModalSection({ section }: SectionProps) {
  const actionItems = section.contains.filter(c => classify(c).startsWith('btn'));
  const bodyItems   = section.contains.filter(c => !classify(c).startsWith('btn'));

  return (
    <div className="wf-modal-backdrop">
      <div className="wf-modal-dialog">
        <div className="wf-modal-dialog__header">
          <span className="wf-modal-dialog__title">{section.label ?? 'Dialog'}</span>
          <span className="wf-modal-dialog__close">✕</span>
        </div>
        <div className="wf-modal-dialog__body">
          {bodyItems.map((item, i) => <SmartItem key={i} label={item} />)}
        </div>
        {actionItems.length > 0 && (
          <div className="wf-modal-dialog__footer">
            {actionItems.map((item, i) => <SmartItem key={i} label={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
