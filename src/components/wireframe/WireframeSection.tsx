// Higher-fidelity wireframe section renderer.
// Uses shadcn/ui components and Tailwind utilities directly — no custom CSS for layout or typography.
// sections.css is kept only for outer section structural chrome (borders, backgrounds, margin-top).

import { motion } from 'framer-motion';
import type { Section } from '../../schema/types';
import {
  ChevronLeft, ChevronRight, X, Settings, Search, Menu, Plus, Share2, Pencil, Bell,
  MapPin, Navigation, Home, User, Heart, Bookmark, Clock, MessageSquare, ShoppingCart,
  Compass, BarChart2, Camera, BookOpen, TrendingUp, Star, Grid2x2, List,
  CreditCard, Wallet, Send, Phone, Video, Music, Image, FileText, LayoutDashboard,
  MoreHorizontal, Filter, Download, Upload, Globe, Lock, Unlock, Info,
  Check, Trash2, RefreshCw, ExternalLink, Mic, Headphones,
} from 'lucide-react';
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
  platform?: string;
  onNavigate?: (screenLabel: string) => void;
  editMode?: boolean;
  onSectionClick?: () => void;
  fill?: boolean;
}

export function WireframeSection({ section, screenLabel, platform, onNavigate, editMode, onSectionClick, fill }: SectionProps) {
  const hasNavigate = !!section.navigatesTo && !!onNavigate;
  const ringClass = hasNavigate ? 'ring-1 ring-blue-200' : '';
  const editClass = editMode ? 'cursor-pointer hover:ring-1 hover:ring-muted-foreground/30' : '';

  function handleClick() {
    if (editMode && onSectionClick) {
      onSectionClick();
    } else if (hasNavigate && onNavigate) {
      onNavigate(section.navigatesTo!);
    }
  }

  const fillStyle: React.CSSProperties = fill
    ? { flex: '1 1 0', minHeight: 0, overflowY: 'auto' }
    : {};

  return (
    <div
      className={`wf-section wf-section--${section.type} ${ringClass} ${editClass}`.trim()}
      onClick={(editMode || hasNavigate) ? handleClick : undefined}
      style={{ ...fillStyle, ...((editMode || hasNavigate) ? { cursor: 'pointer' } : {}) }}
      data-prototype={hasNavigate ? 'true' : undefined}
    >
      {renderSection(section, screenLabel, platform, onNavigate)}
    </div>
  );
}

function renderSection(section: Section, screenLabel?: string, platform?: string, _onNavigate?: (label: string) => void) {
  switch (section.type) {
    case 'header':      return <HeaderSection section={section} />;
    case 'hero':        return <HeroSection section={section} platform={platform} />;
    case 'content':     return <ContentSection section={section} />;
    case 'top-nav':     return <TopNavSection section={section} />;
    case 'bottom-nav':  return <BottomNavSection section={section} screenLabel={screenLabel} />;
    case 'sidebar':     return <SidebarSection section={section} screenLabel={screenLabel} />;
    case 'form':        return <FormSection section={section} />;
    case 'messages':
    case 'chat':        return <ChatSection section={section} />;
    case 'list':        return isChatList(section) ? <ChatSection section={section} /> : <ListSection section={section} />;
    case 'grid':        return <GridSection section={section} />;
    case 'footer':      return <FooterSection section={section} />;
    case 'empty-state': return <EmptyStateSection section={section} />;
    case 'banner':      return <BannerSection section={section} />;
    case 'toolbar':     return <ToolbarSection section={section} />;
    case 'modal':       return <ModalSection section={section} />;
    case 'section-group':    return <SectionGroupSection section={section} />;
    case 'action-row':       return <ActionRowSection section={section} />;
    case 'stats-row':        return <StatsRowSection section={section} />;
    // ── Loader / splash ───────────────────────────────────────────────────
    case 'loader':           return <LoaderSection section={section} />;
    case 'splash':           return <LoaderSection section={section} />;
    // ── Map app patterns ──────────────────────────────────────────────────
    case 'map':              return <MapSection section={section} />;
    case 'category-strip':   return <CategoryStripSection section={section} />;
    case 'place-list':       return <PlaceListSection section={section} />;
    case 'floating-search':  return <FloatingSearchSection section={section} />;
    case 'map-controls':     return <MapControlsSection section={section} />;
    // ── Common patterns ───────────────────────────────────────────────────
    case 'tabs':
    case 'tab-bar':          return <TabsSection section={section} />;
    case 'card-row':
    case 'feature-grid':
    case 'feature-list':     return <FeatureSection section={section} />;
    case 'chart':
    case 'graph':            return <ChartSection section={section} />;
    case 'onboarding':
    case 'onboarding-step':  return <OnboardingSection section={section} />;
    case 'pricing':
    case 'pricing-table':    return <PricingSection section={section} />;
    case 'testimonial':
    case 'quote':            return <TestimonialSection section={section} />;
    case 'image-gallery':
    case 'gallery':          return <GallerySection section={section} />;
    default:                 return <GenericSection section={section} />;
  }
}

// ─── Shared label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 select-none">
      {children}
    </div>
  );
}

// ─── SmartItem ────────────────────────────────────────────────────────────────
// Classifies a string from contains[] and renders the right shadcn/Tailwind element.

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
      return <p className="text-2xl font-bold text-foreground leading-tight select-none">{text}</p>;

    case 'subheadline':
      return <p className="text-base text-muted-foreground leading-snug select-none">{text}</p>;

    case 'body-text':
      return (
        <div className="flex flex-col gap-1 w-full">
          <div className="h-2 bg-border rounded-sm w-full" />
          <div className="h-2 bg-border rounded-sm" style={{ width: '91%' }} />
          <div className="h-2 bg-border rounded-sm" style={{ width: '76%' }} />
        </div>
      );

    case 'btn-primary':
      return <Button>{text}</Button>;

    case 'btn-secondary':
      return <Button variant="outline">{text}</Button>;

    case 'btn-destructive':
      return <Button variant="outline">{text}</Button>;

    case 'toggle-on':
      return (
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-foreground select-none">{text}</span>
          <Switch checked={true} />
        </div>
      );

    case 'toggle-off':
      return (
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-foreground select-none">{text}</span>
          <Switch checked={false} />
        </div>
      );

    case 'row-chevron':
      return (
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-foreground select-none">{text}</span>
          <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
        </div>
      );

    case 'image':
      return <div className="wf-image-placeholder w-full aspect-video rounded-md" aria-label={label} />;

    case 'avatar':
      return (
        <Avatar>
          <AvatarFallback>{text.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      );

    case 'logo':
      return (
        <span className="text-xs font-bold tracking-widest text-foreground bg-muted border border-border rounded px-2 py-1 select-none">
          LOGO
        </span>
      );

    case 'icon':
      return <Button variant="ghost" size="icon"><HeaderIcon desc={label} /></Button>;

    case 'input':
      return (
        <div className="flex flex-col gap-1 w-full">
          <Label>{text}</Label>
          <Input placeholder={text} />
        </div>
      );

    case 'stat-label':
      return <div className="text-sm text-foreground select-none">{text}</div>;

    case 'badge':
      return <Badge variant="secondary">{text}</Badge>;

    case 'nav-item':
      return <span className="text-sm text-muted-foreground underline underline-offset-2 select-none">{text}</span>;

    default:
      return <div className="text-sm text-muted-foreground select-none">{text}</div>;
  }
}

// ─── Section components ───────────────────────────────────────────────────────

function HeaderIcon({ desc }: { desc: string }) {
  const d = desc.toLowerCase();
  const p = { size: 18, strokeWidth: 1.75 } as const;
  if (/\bback\b/.test(d))                          return <ChevronLeft {...p} />;
  if (/\bforward\b/.test(d))                        return <ChevronRight {...p} />;
  if (/\b(close|dismiss)\b/.test(d))                return <X {...p} />;
  if (/\bsearch\b/.test(d))                         return <Search {...p} />;
  if (/\b(menu|hamburger)\b/.test(d))               return <Menu {...p} />;
  if (/\b(add|plus|create|new)\b/.test(d))          return <Plus {...p} />;
  if (/\bshare\b/.test(d))                          return <Share2 {...p} />;
  if (/\b(edit|pencil)\b/.test(d))                  return <Pencil {...p} />;
  if (/\b(notif|bell|alert)\b/.test(d))             return <Bell {...p} />;
  if (/\bvideo\b/.test(d))                          return <Video {...p} />;
  if (/\b(phone|call)\b/.test(d))                   return <Phone {...p} />;
  if (/\bsend\b/.test(d))                           return <Send {...p} />;
  if (/\bbookmark\b/.test(d))                       return <Bookmark {...p} />;
  if (/\b(heart|like|love|fav)\b/.test(d))          return <Heart {...p} />;
  if (/\b(camera|photo)\b/.test(d))                 return <Camera {...p} />;
  if (/\b(star|rating)\b/.test(d))                  return <Star {...p} />;
  if (/\b(more|overflow|ellipsis|options)\b/.test(d)) return <MoreHorizontal {...p} />;
  if (/\bfilter\b/.test(d))                         return <Filter {...p} />;
  if (/\bdownload\b/.test(d))                       return <Download {...p} />;
  if (/\bupload\b/.test(d))                         return <Upload {...p} />;
  if (/\b(globe|web|browser)\b/.test(d))            return <Globe {...p} />;
  if (/\block\b/.test(d))                           return <Lock {...p} />;
  if (/\bunlock\b/.test(d))                         return <Unlock {...p} />;
  if (/\binfo\b/.test(d))                           return <Info {...p} />;
  if (/\bsettings\b/.test(d))                       return <Settings {...p} />;
  if (/\b(check|done|confirm)\b/.test(d))           return <Check {...p} />;
  if (/\b(delete|trash|remove)\b/.test(d))          return <Trash2 {...p} />;
  if (/\b(refresh|reload|sync)\b/.test(d))          return <RefreshCw {...p} />;
  if (/\b(external|link|open)\b/.test(d))           return <ExternalLink {...p} />;
  if (/\bmic\b/.test(d))                            return <Mic {...p} />;
  if (/\b(headphone|audio)\b/.test(d))              return <Headphones {...p} />;
  if (/\bhome\b/.test(d))                           return <Home {...p} />;
  if (/\buser\b/.test(d))                           return <User {...p} />;
  return null;
}

function HeaderSection({ section }: SectionProps) {
  const items = section.contains;

  const isLeftBtn  = (s: string) => /\b(back|close|dismiss|cancel|menu|hamburger)\b/i.test(s);
  const isAvatar   = (s: string) => /\b(avatar|photo|picture)\b/i.test(s);
  const isLogo     = (s: string) => /\b(logo|brand|wordmark)\b/i.test(s);
  const isBtn      = (s: string) => /\bbutton\b/i.test(s) || isLeftBtn(s);
  const isHeadline = (s: string) => /\b(headline|heading|title|label|name)\b/i.test(s) && !isBtn(s);
  const isSubline  = (s: string) => /\b(subheadline|subtitle|status|online|caption|subline|description)\b/i.test(s) && !isBtn(s);

  const leftBtns   = items.filter(isLeftBtn);
  const logoItem   = items.find(isLogo);
  const avatarIdx  = items.findIndex(isAvatar);
  const avatarItem = avatarIdx >= 0 ? items[avatarIdx] : null;

  // Chat / profile header: back + avatar + name/status + action buttons
  // Only use this layout when there's no logo — with a logo it's an app bar, not a chat header
  if (avatarItem && !logoItem) {
    const afterAvatar = items.slice(avatarIdx + 1);
    const nameItem    = afterAvatar.find(isHeadline);
    const statusItem  = afterAvatar.find(isSubline);
    const rightBtns   = items.filter(s => isBtn(s) && !isLeftBtn(s) && !isAvatar(s));

    return (
      <div className="flex items-center w-full gap-2">
        <div className="flex items-center w-8 flex-shrink-0">
          {leftBtns.map((item, i) => (
            <Button key={i} variant="ghost" size="icon" className="flex-shrink-0"><HeaderIcon desc={item} /></Button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-muted border border-border flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            {nameItem && <span className="text-sm font-semibold text-foreground leading-tight truncate select-none">{displayLabel(nameItem)}</span>}
            {statusItem && <span className="text-xs text-muted-foreground leading-tight truncate select-none">{displayLabel(statusItem)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {rightBtns.map((item, i) => (
            <Button key={i} variant="ghost" size="icon" className="flex-shrink-0"><HeaderIcon desc={item} /></Button>
          ))}
        </div>
      </div>
    );
  }

  // App bar: logo + nav links + search + right actions (icon buttons, avatar)
  if (logoItem) {
    const isInputItem  = (s: string) => /\binput\b|\bsearch\b/i.test(s);
    const isActionItem = (s: string) => /\b(button|btn|icon)\b/i.test(s) || /\bavatar\b/i.test(s);
    const navLinks  = items.filter(s => !isLogo(s) && !isInputItem(s) && !isActionItem(s));
    const inputItem = items.find(isInputItem);
    const actionItems = items.filter(s => isActionItem(s) && !isLogo(s));
    const cleanNavLabel = (s: string) => s.replace(/\s*(nav\s+)?(link|button|item)\s*$/i, '').trim() || s;
    return (
      <div className="flex items-center w-full gap-2">
        <span className="text-sm font-semibold text-foreground mr-1 flex-shrink-0 select-none">
          {displayLabel(logoItem)}
        </span>
        <nav className="flex items-center gap-3 flex-1 overflow-x-auto">
          {navLinks.map((item, i) => (
            <span key={i} className={`text-xs whitespace-nowrap select-none ${i === 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {cleanNavLabel(item)}
            </span>
          ))}
        </nav>
        {inputItem && (
          <div className="flex items-center gap-1 bg-muted border border-border rounded px-2 py-1 flex-shrink-0">
            <Search size={11} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground select-none w-12 truncate">{displayLabel(inputItem)}</span>
          </div>
        )}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {actionItems.map((item, i) => {
            if (/\bavatar\b/i.test(item)) {
              return <div key={i} className="w-6 h-6 rounded-full bg-muted border border-border flex-shrink-0 ml-1" />;
            }
            return (
              <Button key={i} variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <HeaderIcon desc={item} />
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  // Mobile nav bar: [left actions] [center title] [right actions]
  const rightBtns   = items.filter(s => isBtn(s) && !isLeftBtn(s));
  const centerItems = items.filter(s => !isBtn(s));

  return (
    <div className="flex items-center w-full">
      <div className="w-10 flex items-center gap-1 flex-shrink-0">
        {leftBtns.map((item, i) => (
          <Button key={i} variant="ghost" size="icon" className="flex-shrink-0"><HeaderIcon desc={item} /></Button>
        ))}
      </div>
      <div className="flex-1 flex justify-center items-center min-w-0 px-2">
        {centerItems.slice(0, 1).map((item, i) => (
          <span key={i} className="text-sm font-semibold text-foreground truncate select-none">{displayLabel(item)}</span>
        ))}
      </div>
      <div className="w-10 flex items-center justify-end gap-1 flex-shrink-0">
        {rightBtns.map((item, i) => (
          <Button key={i} variant="ghost" size="icon" className="flex-shrink-0"><HeaderIcon desc={item} /></Button>
        ))}
      </div>
    </div>
  );
}

function HeroSection({ section, platform }: SectionProps) {
  const isWeb = platform === 'web' || platform === 'tablet';
  if (isWeb) {
    return (
      <div className="flex flex-row items-center gap-12 py-12 px-10 min-h-[320px]">
        <div className="flex-1 flex flex-col items-start gap-4">
          {section.label && <SectionLabel>{section.label}</SectionLabel>}
          {section.contains.map((item, i) => {
            if (classify(item) === 'headline') {
              return <p key={i} className="text-4xl font-bold text-foreground leading-tight select-none">{displayLabel(item)}</p>;
            }
            return <SmartItem key={i} label={item} />;
          })}
        </div>
        <div className="wf-image-placeholder flex-1 min-h-[220px] rounded-xl" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 text-center py-8 px-4">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      {section.contains.map((item, i) => {
        if (classify(item) === 'headline') {
          return <p key={i} className="text-2xl font-bold text-foreground leading-tight max-w-xs select-none">{displayLabel(item)}</p>;
        }
        return <SmartItem key={i} label={item} />;
      })}
    </div>
  );
}

function ContentSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      {section.contains.map((item, i) => <SmartItem key={i} label={item} />)}
    </div>
  );
}

function TopNavSection({ section }: SectionProps) {
  const isLogo = (s: string) => /\blogo\b/i.test(s);
  const isCta  = (s: string) => /\bbutton\b/i.test(s);
  const isAuth = (s: string) => /\b(log\s*in|sign\s*in|login)\b/i.test(s);

  const logoItem = section.contains.find(isLogo);
  const ctaItem  = section.contains.find(isCta);
  const authItem = section.contains.find(isAuth);
  const navItems = section.contains.filter(s => !isLogo(s) && !isCta(s) && !isAuth(s));

  return (
    <div className="flex items-center h-14 border-b border-border px-4">
      {logoItem && (
        <span className="text-sm font-bold text-foreground mr-6 flex-shrink-0 select-none">
          {displayLabel(logoItem)}
        </span>
      )}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map((item, i) => (
          <span key={i} className="px-3 py-2 text-sm text-muted-foreground rounded select-none">
            {item}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-2 flex-shrink-0">
        {authItem && (
          <span className="text-sm text-muted-foreground px-3 py-2 select-none">{authItem}</span>
        )}
        {ctaItem && <Button size="sm">{displayLabel(ctaItem)}</Button>}
      </div>
    </div>
  );
}

function navIcon(label: string) {
  const l = label.toLowerCase();
  const p = { size: 22, strokeWidth: 1.75 } as const;
  if (/\bhome\b/.test(l))                                  return <Home {...p} />;
  if (/\bsearch\b/.test(l))                                return <Search {...p} />;
  if (/\bdirections?\b/.test(l))                           return <Navigation {...p} />;
  if (/\brecents?\b|\bhistory\b/.test(l))                  return <Clock {...p} />;
  if (/\bsaved?\b|\bbookmark\b/.test(l))                   return <Bookmark {...p} />;
  if (/\bprofile\b|\baccount\b|\bme\b|\buser\b/.test(l))  return <User {...p} />;
  if (/\bsettings?\b/.test(l))                             return <Settings {...p} />;
  if (/\bnotif|\bbell\b/.test(l))                          return <Bell {...p} />;
  if (/\bmessage|\bchat\b|\binbox\b/.test(l))              return <MessageSquare {...p} />;
  if (/\bcart\b|\bshop\b|\bstore\b/.test(l))               return <ShoppingCart {...p} />;
  if (/\bheart\b|\blike\b|\bfavorite\b/.test(l))           return <Heart {...p} />;
  if (/\bexplore\b|\bdisc?ver\b|\bcompass\b/.test(l))      return <Compass {...p} />;
  if (/\bmap\b/.test(l))                                   return <MapPin {...p} />;
  if (/\banalytics?\b|\bstats?\b/.test(l))                 return <BarChart2 {...p} />;
  if (/\bcamera\b|\bphoto\b/.test(l))                      return <Camera {...p} />;
  if (/\btrend\b/.test(l))                                 return <TrendingUp {...p} />;
  if (/\bfeed\b|\blist\b/.test(l))                         return <List {...p} />;
  if (/\bdashboard\b/.test(l))                             return <LayoutDashboard {...p} />;
  if (/\bgrid\b/.test(l))                                  return <Grid2x2 {...p} />;
  if (/\bcard\b|\bpayment\b/.test(l))                      return <CreditCard {...p} />;
  if (/\bwallet\b|\bmoney\b|\bfinance\b/.test(l))          return <Wallet {...p} />;
  if (/\bsend\b|\btransfer\b/.test(l))                     return <Send {...p} />;
  if (/\bphone\b|\bcall\b/.test(l))                        return <Phone {...p} />;
  if (/\bvideo\b/.test(l))                                 return <Video {...p} />;
  if (/\bmusic\b|\baudio\b/.test(l))                       return <Music {...p} />;
  if (/\bimage\b|\bgallery\b/.test(l))                     return <Image {...p} />;
  if (/\bdoc\b|\bfile\b|\bnote\b/.test(l))                 return <FileText {...p} />;
  if (/\bstar\b|\brating\b/.test(l))                       return <Star {...p} />;
  if (/\bplus\b|\badd\b|\bcreate\b|\bnew\b/.test(l))       return <Plus {...p} />;
  if (/\bshare\b/.test(l))                                 return <Share2 {...p} />;
  if (/\bbook\b|\blibrary\b/.test(l))                      return <BookOpen {...p} />;
  // default: a small grid icon
  return <Grid2x2 {...p} />;
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
          <div key={i} className={`flex flex-col items-center gap-1 ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
            {navIcon(item)}
            <span className="text-xs font-medium select-none">{item}</span>
          </div>
        );
      })}
    </>
  );
}

function SidebarSection({ section, screenLabel }: SectionProps) {
  return (
    <div className="flex flex-col gap-1">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      {section.contains.map((item, i) => {
        const active = screenLabel
          ? item.toLowerCase() === screenLabel.toLowerCase() ||
            screenLabel.toLowerCase().includes(item.toLowerCase())
          : i === 0;
        return (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium select-none ${
            active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          }`}>
            <span className="flex-shrink-0">{navIcon(item)}</span>
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
}

function FormSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      {section.contains.map((item, i) => <SmartItem key={i} label={item} />)}
    </div>
  );
}

function isChatList(section: Section): boolean {
  return section.contains.some(s => /\btext bubble\b|\bbubble (sent|received)\b/i.test(s))
    || /\bmessages?\b|\bchat\b/i.test(section.label ?? '');
}

function ChatSection({ section }: SectionProps) {
  const isSent      = (s: string) => /\bsent\b/i.test(s);
  const isTimestamp = (s: string) => /\btimestamp\b/i.test(s) || /^\d{1,2}:\d{2}/.test(s.trim());
  const isTyping    = (s: string) => /\btyping\b/i.test(s);
  const msgText     = (s: string) => s
    .replace(/\s*text bubble\s*(sent|received)?\s*/i, '')
    .replace(/\s*bubble\s*(sent|received)?\s*/i, '')
    .trim();

  return (
    <div className="flex flex-col gap-2 px-4 pt-4 pb-3">
      {section.contains.map((item, i) => {
        if (isTimestamp(item)) {
          return (
            <div key={i} className="flex justify-center py-3">
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full select-none">
                {msgText(item) || item}
              </span>
            </div>
          );
        }
        if (isTyping(item)) {
          return (
            <div key={i} className="flex items-end gap-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex-shrink-0" />
              <div className="bg-muted border border-border rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 flex-shrink-0" />
              </div>
            </div>
          );
        }

        const sent = isSent(item);
        const text = msgText(item);
        // Check if previous/next message is same direction — group with tighter spacing
        const prevSent = i > 0 ? isSent(section.contains[i - 1]) : null;
        const grouped  = prevSent === sent;

        if (sent) {
          return (
            <div key={i} className={`flex justify-end pl-14 ${grouped ? 'mt-1' : 'mt-3'}`}>
              <div className="bg-foreground text-background rounded-2xl rounded-br-none px-4 py-3 max-w-[80%]">
                <p className="text-base leading-relaxed select-none">{text}</p>
              </div>
            </div>
          );
        }
        return (
          <div key={i} className={`flex items-end gap-2 pr-14 ${grouped ? 'mt-1' : 'mt-3'}`}>
            {grouped
              ? <div className="w-8 flex-shrink-0" />
              : <div className="w-8 h-8 rounded-full bg-muted border border-border flex-shrink-0" />
            }
            <div className="bg-muted border border-border rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%]">
              <p className="text-base leading-relaxed select-none">{text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListSection({ section }: SectionProps) {
  const hasTableHeaders = section.contains.some(s => /\bcolumn header\b/i.test(s));
  if (hasTableHeaders) return <DataTableSection section={section} />;

  return (
    <div className="flex flex-col">
      {section.label && (
        <div className="px-4 pt-3 pb-1">
          <SectionLabel>{section.label}</SectionLabel>
        </div>
      )}
      {section.contains.map((item, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className="text-sm">{displayLabel(item).slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="text-base font-medium text-foreground select-none leading-tight">{displayLabel(item)}</div>
              <div className="h-2 w-2/3 bg-border/60 rounded" />
            </div>
            <ChevronRight size={18} className="text-border flex-shrink-0" />
          </div>
          {i < section.contains.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}

function DataTableSection({ section }: SectionProps) {
  const isColHeader = (s: string) => /\bcolumn header\b/i.test(s);
  const isPaginate  = (s: string) => /\b(previous|next)\s+button\b/i.test(s) || /\bpage\s+\d+\s+of\s+/i.test(s);

  const headers    = section.contains.filter(isColHeader);
  const pagination = section.contains.filter(isPaginate);
  const rows       = section.contains.filter(s => !isColHeader(s) && !isPaginate(s));
  const cols       = headers.map(h => h.replace(/\s*column header\s*/i, '').trim());

  function renderCell(cell: string) {
    const c = cell.trim();
    const statusMatch = c.match(/^(fulfilled|processing|cancelled|pending|shipped|refunded)\s+badge$/i);
    if (statusMatch) {
      const status = statusMatch[1];
      const colorClass =
        /fulfilled|shipped/i.test(status) ? 'text-green-600' :
        /cancelled|refunded/i.test(status) ? 'text-red-500' :
        /processing|pending/i.test(status) ? 'text-yellow-600' : 'text-muted-foreground';
      return (
        <Badge variant="secondary" className={`text-xs font-medium ${colorClass} px-1.5 py-0`}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      );
    }
    if (/\blink\b$/i.test(c)) {
      const label = c.replace(/\s*link\s*$/i, '').trim() || 'View';
      return <span className="text-xs text-blue-500 cursor-default select-none">{label}</span>;
    }
    return <span className="text-xs text-foreground select-none">{c}</span>;
  }

  return (
    <div className="flex flex-col w-full">
      {section.label && (
        <div className="px-3 pt-3 pb-1">
          <SectionLabel>{section.label}</SectionLabel>
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          {cols.length > 0 && (
            <thead>
              <tr className="border-b border-border">
                {cols.map((col, i) => (
                  <th key={i} className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap select-none">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => {
              const cells = row.split(/\s*—\s*/).map(s => s.trim());
              return (
                <tr key={ri} className="border-b border-border/40">
                  {cells.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 whitespace-nowrap">
                      {renderCell(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pagination.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
          {pagination.map((item, i) => {
            const isPageLabel = /\bpage\b/i.test(item) && !/\bbutton\b/i.test(item);
            if (isPageLabel) {
              return <span key={i} className="text-xs text-muted-foreground select-none">{item}</span>;
            }
            const label = item.replace(/\s*button\s*$/i, '').trim();
            return (
              <Button key={i} variant="outline" size="sm" className="h-6 text-xs px-2">
                {label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GridSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      <div className="grid grid-cols-2 gap-2">
        {section.contains.map((item, i) => (
          <Card key={i} className="overflow-hidden p-0 gap-0">
            <div className="wf-image-placeholder w-full h-32" />
            <CardContent className="p-3">
              <p className="text-sm font-medium text-foreground select-none">{displayLabel(item)}</p>
              {item.includes('—') && (
                <p className="text-xs text-muted-foreground mt-1 select-none">{item.split('—')[1]?.trim()}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FooterSection({ section }: SectionProps) {
  const isLogo      = (s: string) => /\blogo\b/i.test(s);
  const isCopyright = (s: string) => /^©/.test(s.trim());
  const logo        = section.contains.find(isLogo);
  const copyright   = section.contains.find(isCopyright);
  const links       = section.contains.filter(s => !isLogo(s) && !isCopyright(s));
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        {logo && (
          <span className="text-xs font-bold tracking-widest text-foreground bg-muted border border-border rounded px-2 py-1 flex-shrink-0 select-none">
            LOGO
          </span>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((item, i) => (
            <span key={i} className="text-xs text-muted-foreground select-none">{item}</span>
          ))}
        </div>
      </div>
      {copyright && (
        <div className="text-xs text-muted-foreground/60 select-none">{copyright}</div>
      )}
    </div>
  );
}

function EmptyStateSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted border border-border mb-1" aria-hidden />
      {section.contains.map((item, i) => <SmartItem key={i} label={item} />)}
    </div>
  );
}

function BannerSection({ section }: SectionProps) {
  const items   = section.contains.filter(c => !classify(c).startsWith('btn'));
  const actions = section.contains.filter(c =>  classify(c).startsWith('btn'));
  return (
    <div className="flex flex-col items-start gap-2">
      {items.map((item, i) => <SmartItem key={i} label={item} />)}
      {actions.map((item, i) => <SmartItem key={i} label={item} />)}
    </div>
  );
}

function ToolbarSection({ section }: SectionProps) {
  const isInput = (s: string) => /\binput\b|\btext field\b|\bsearch\b|\btype\b/i.test(s);
  return (
    <>
      {section.contains.map((item, i) =>
        isInput(item) ? (
          <Input key={i} className="flex-1" placeholder={displayLabel(item)} readOnly />
        ) : (
          <Button key={i} variant="ghost" size="icon" className="flex-shrink-0" title={item}>
            <HeaderIcon desc={item} />
          </Button>
        )
      )}
    </>
  );
}

function SectionGroupSection({ section }: SectionProps) {
  return (
    <div>
      {section.label && (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-3 pb-2 px-1 select-none">
          {section.label}
        </div>
      )}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {section.contains.map((item, i) => (
          <div key={i}>
            <div className="flex items-center px-4 py-3">
              <SmartItem label={item} />
            </div>
            {i < section.contains.length - 1 && (
              <div className="h-px bg-border ml-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionRowSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      {section.contains.map((item, i) => (
        <SmartItem key={i} label={item} />
      ))}
    </div>
  );
}

function parseStatCard(raw: string) {
  if (raw.includes(' — ')) {
    const parts = raw.split(' — ').map(s => s.trim());
    const label = parts[0]?.replace(/\s*stat\s*card\s*/i, '').trim() ?? '';
    const value = parts.find(p => /\bvalue\b$/i.test(p))?.replace(/\s*value\s*$/i, '').trim() ?? '';
    const badge = parts.find(p => /\bbadge\b$/i.test(p))?.replace(/\s*badge\s*$/i, '').trim() ?? '';
    return { label, value, badge };
  }
  const words = raw.split(/\s+/);
  return { label: words.slice(1).join(' '), value: words[0] ?? '', badge: '' };
}

function StatsRowSection({ section }: SectionProps) {
  const isRich = section.contains.some(s => s.includes(' — '));

  if (isRich) {
    return (
      <div className="grid grid-cols-2 gap-2 p-3">
        {section.contains.map((item, i) => {
          const { label, value, badge } = parseStatCard(item);
          const trend = badge.startsWith('+') ? 'up' : badge.startsWith('-') ? 'down' : null;
          return (
            <div key={i} className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-background">
              <div className="text-xs text-muted-foreground select-none leading-tight">{label}</div>
              <div className="text-lg font-bold text-foreground select-none">{value}</div>
              {badge && (
                <span className={`text-xs font-medium select-none ${
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                }`}>{badge}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-row border-y border-border">
      {section.contains.map((item, i) => {
        const { value, label } = parseStatCard(item);
        return (
          <div key={i} className={`flex-1 flex flex-col items-center py-4 px-4 gap-1 ${
            i < section.contains.length - 1 ? 'border-r border-border' : ''
          }`}>
            <div className="text-2xl font-bold text-foreground select-none">{value}</div>
            <div className="text-xs text-muted-foreground text-center select-none">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// GenericSection: auto-detects the best layout from content — never looks broken.
function GenericSection({ section }: SectionProps) {
  const items = section.contains;
  const layout = (section as any).layout as string | undefined;

  // Chips: explicit row layout, or all short single-concept items with no type keywords
  const allShort = items.every(s => s.length < 20 && !/\b(button|input|image|avatar|headline|subheadline|body|toggle|chevron)\b/i.test(s));
  const isChips  = layout === 'row' || (allShort && items.length >= 3);

  // Detail rows: items contain '—' (name — detail pattern)
  const isDetailList = !isChips && items.some(s => s.includes('—'));

  // Nav links: items look like navigation labels
  const isNav = !isChips && !isDetailList && items.every(s => s.length < 24 && /^[A-Z]/.test(s));

  return (
    <div className="flex flex-col gap-2 w-full">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}

      {isChips && (
        <div className="flex flex-wrap items-center gap-2">
          {items.map((item, i) => (
            <Badge key={i} variant="secondary" className="rounded-full px-3 select-none">
              {displayLabel(item)}
            </Badge>
          ))}
        </div>
      )}

      {isDetailList && (
        <div className="flex flex-col">
          {items.map((item, i) => {
            const [name, detail] = item.split('—').map(s => s.trim());
            return (
              <div key={i}>
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground select-none">{name}</div>
                    {detail && <div className="text-xs text-muted-foreground select-none">{detail}</div>}
                  </div>
                  <ChevronRight size={16} className="text-border flex-shrink-0" />
                </div>
                {i < items.length - 1 && <Separator />}
              </div>
            );
          })}
        </div>
      )}

      {isNav && !isChips && !isDetailList && (
        <div className="flex flex-wrap items-center gap-1">
          {items.map((item, i) => (
            <span key={i} className="px-3 py-2 text-sm text-muted-foreground rounded select-none">{item}</span>
          ))}
        </div>
      )}

      {!isChips && !isDetailList && !isNav && (
        <div className="flex flex-col items-start gap-2">
          {items.map((item, i) => <SmartItem key={i} label={item} />)}
        </div>
      )}
    </div>
  );
}

// ─── Common pattern renderers ─────────────────────────────────────────────────

function TabsSection({ section }: SectionProps) {
  return (
    <div className="flex border-b border-border">
      {section.contains.map((item, i) => (
        <div key={i} className={`px-4 py-3 text-sm font-medium select-none whitespace-nowrap cursor-default ${
          i === 0
            ? 'text-foreground border-b-2 border-foreground'
            : 'text-muted-foreground'
        }`}>
          {item}
        </div>
      ))}
    </div>
  );
}

function FeatureSection({ section }: SectionProps) {
  const isGrid = (section as any).layout === 'grid' || section.type === 'feature-grid';
  return (
    <div className="flex flex-col gap-3">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      <div className={isGrid ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-2'}>
        {section.contains.map((item, i) => {
          const [title, desc] = item.split('—').map(s => s.trim());
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-muted-foreground"><HeaderIcon desc={title} /></span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-medium text-foreground select-none">{title}</span>
                {desc && <span className="text-xs text-muted-foreground select-none">{desc}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartSection({ section }: SectionProps) {
  const contains = section.contains;

  // Time-period selector tabs
  const tabItems = contains.filter(s => /\bselector\s+tab\b/i.test(s));

  // Line chart detection
  const isLine = contains.some(s => /\bline\s*(chart|graph)\b/i.test(s));

  // Axis labels: "Jan, Feb, Mar axis labels"
  const axisRaw = contains.find(s => /\baxis\s+labels?\b/i.test(s));
  let axisLabels: string[] | null = null;
  if (axisRaw) {
    const match = axisRaw.match(/^(.*?)\s*—?\s*axis\s+labels?\s*$/i);
    const raw = match?.[1] ?? axisRaw;
    const afterDash = raw.includes('—') ? raw.split('—').pop()!.trim() : raw.trim();
    axisLabels = afterDash.split(/[,]\s*/).map(s => s.trim()).filter(Boolean);
  }

  // Named series: "Revenue line — blue"
  const lineItems = contains.filter(s => /\bline\s*—\s*(blue|violet|green|red|orange|purple)/i.test(s));

  return (
    <div className="flex flex-col gap-2 w-full px-1">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      {tabItems.length > 0 && (
        <div className="flex gap-1 justify-end">
          {tabItems.map((tab, i) => {
            const label = tab.replace(/\s*selector\s+tab\s*/i, '').replace(/\s*\bactive\b\s*/i, '').trim();
            const isActive = /\bactive\b/i.test(tab);
            return (
              <span key={i} className={`text-xs px-2 py-0.5 rounded select-none ${
                isActive ? 'bg-foreground text-background font-medium' : 'text-muted-foreground border border-border'
              }`}>
                {label}
              </span>
            );
          })}
        </div>
      )}
      {isLine
        ? <LineChartViz axisLabels={axisLabels} lineItems={lineItems} />
        : <BarChartViz />
      }
    </div>
  );
}

function LineChartViz({ axisLabels, lineItems }: { axisLabels: string[] | null; lineItems: string[] }) {
  const W = 300, H = 110, px = 8, py = 14;
  const blueData   = [38, 52, 45, 63, 58, 74];
  const violetData = [28, 34, 41, 36, 45, 50];
  const n = blueData.length;

  const toX = (i: number) => px + (i / (n - 1)) * (W - px * 2);
  const toY = (v: number) => py + (1 - (v - 20) / 60) * (H - py * 2);
  const path = (d: number[]) => d.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const area = (d: number[]) =>
    `${path(d)} L${toX(n - 1).toFixed(1)},${(H - py).toFixed(1)} L${toX(0).toFixed(1)},${(H - py).toFixed(1)} Z`;

  // Map series names to colors
  const seriesColors = lineItems.map(item =>
    /blue/i.test(item) ? '#3b82f6' : /violet/i.test(item) ? '#8b5cf6' : '#10b981'
  );
  const allData = [blueData, violetData];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '120px' }}>
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line key={i} x1={px} y1={py + p * (H - py * 2)} x2={W - px} y2={py + p * (H - py * 2)}
            stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 2" className="text-border" />
        ))}
        {allData.map((d, si) => (
          <path key={`a${si}`} d={area(d)} fill={seriesColors[si] ?? '#888'} fillOpacity="0.07" />
        ))}
        {allData.map((d, si) => (
          <path key={`l${si}`} d={path(d)} fill="none" stroke={seriesColors[si] ?? '#888'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {(axisLabels ?? []).slice(0, n).map((label, i) => (
          <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fontSize="7"
            fill="currentColor" className="text-muted-foreground select-none">
            {label}
          </text>
        ))}
      </svg>
      {lineItems.length > 0 && (
        <div className="flex gap-4 px-2 mt-1">
          {lineItems.map((item, i) => {
            const name = item.split(/\s*—\s*/)[0]?.replace(/\s*line\s*/i, '').trim() ?? item;
            const color = seriesColors[i] ?? '#888';
            return (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 rounded-sm" style={{ height: '2px', background: color }} />
                <span className="text-xs text-muted-foreground select-none">{name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BarChartViz() {
  return (
    <div className="w-full h-40 bg-muted border border-border rounded-lg relative overflow-hidden">
      {[0.25, 0.5, 0.75].map(p => (
        <div key={p} className="absolute w-full border-t border-border/60" style={{ top: `${p * 100}%` }} />
      ))}
      <div className="absolute inset-x-4 bottom-0 flex items-end justify-between gap-2 h-full pb-0">
        {[65, 45, 80, 55, 70, 40, 75].map((h, i) => (
          <div key={i} className="flex-1 bg-foreground/15 border border-border rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function OnboardingSection({ section }: SectionProps) {
  const stepItems  = section.contains.filter(s => !classify(s).startsWith('btn'));
  const btnItems   = section.contains.filter(s =>  classify(s).startsWith('btn'));
  return (
    <div className="flex flex-col items-center gap-6 text-center py-8 px-4">
      <div className="wf-image-placeholder w-24 h-24 rounded-2xl" />
      <div className="flex flex-col gap-2 max-w-xs">
        {stepItems.map((item, i) => {
          if (classify(item) === 'headline') return <p key={i} className="text-xl font-bold text-foreground select-none">{displayLabel(item)}</p>;
          return <SmartItem key={i} label={item} />;
        })}
      </div>
      {btnItems.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          {btnItems.map((item, i) => <SmartItem key={i} label={item} />)}
        </div>
      )}
      {/* Step dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-2 rounded-full ${i === 0 ? 'w-4 bg-foreground' : 'w-2 bg-border'}`} />
        ))}
      </div>
    </div>
  );
}

function PricingSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      <div className="grid grid-cols-2 gap-3">
        {section.contains.map((item, i) => {
          const [name, price] = item.split('—').map(s => s.trim());
          const featured = i === 1;
          return (
            <div key={i} className={`flex flex-col gap-3 p-4 rounded-xl border ${featured ? 'border-foreground bg-foreground text-background' : 'border-border bg-background'}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider select-none ${featured ? 'text-background/70' : 'text-muted-foreground'}`}>{name}</span>
              {price && <span className={`text-2xl font-bold select-none ${featured ? 'text-background' : 'text-foreground'}`}>{price}</span>}
              {[0, 1, 2].map(j => (
                <div key={j} className={`h-2 rounded-sm ${featured ? 'bg-background/20' : 'bg-border'}`} style={{ width: `${70 - j * 15}%` }} />
              ))}
              <Button size="sm" variant={featured ? 'secondary' : 'outline'} className="mt-1">Get started</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestimonialSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      {section.contains.map((item, i) => {
        const [quote, author] = item.split('—').map(s => s.trim());
        return (
          <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-background">
            <div className="flex flex-col gap-1">
              <div className="h-2 bg-border rounded-sm w-full" />
              <div className="h-2 bg-border rounded-sm" style={{ width: '85%' }} />
              <div className="h-2 bg-border rounded-sm" style={{ width: '70%' }} />
            </div>
            {quote && <p className="text-sm text-muted-foreground italic select-none">"{quote}"</p>}
            {author && (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8"><AvatarFallback className="text-xs">{author.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                <span className="text-xs font-medium text-foreground select-none">{author}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GallerySection({ section }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {section.label && <SectionLabel>{section.label}</SectionLabel>}
      <div className="grid grid-cols-3 gap-2">
        {section.contains.map((item, i) => (
          <div key={i} className="wf-image-placeholder aspect-square rounded-md" aria-label={item} />
        ))}
      </div>
    </div>
  );
}

// ─── Loader / splash screen ───────────────────────────────────────────────────

// Geometric approximation of the Inflight wing mark — two swept wings
// meeting at a narrow gap, pointing up, with forked prongs at bottom.
function InFlightMark({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.9}
      viewBox="0 0 100 90"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
      fill="currentColor"
      aria-label="Inflight logo mark"
    >
      {/* Left wing — sweeps from top-center out to left, prong at bottom-left */}
      <path d="M48 6 L48 58 L36 78 L4 60 L27 53 Z" />
      {/* Right wing — mirror */}
      <path d="M52 6 L52 58 L64 78 L96 60 L73 53 Z" />
    </svg>
  );
}

function LoaderSection({ section }: SectionProps) {
  const v = (section.label ?? '').toLowerCase();
  const desc = section.contains[0] ? displayLabel(section.contains[0]) : null;

  // ── Split & Converge ──────────────────────────────────────────────────
  if (/split|converge|halve/i.test(v)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex items-end gap-10">
          <motion.svg
            width="44" height="72" viewBox="0 0 44 90" fill="currentColor" className="text-foreground"
            animate={{ x: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            <path d="M42 6 L42 58 L30 78 L0 60 L22 53 Z" />
          </motion.svg>
          <motion.svg
            width="44" height="72" viewBox="0 0 44 90" fill="currentColor" className="text-foreground"
            animate={{ x: [6, -6, 6] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            <path d="M2 6 L2 58 L14 78 L44 60 L22 53 Z" />
          </motion.svg>
        </div>
        {desc && <p className="text-xs text-muted-foreground select-none text-center max-w-xs">{desc}</p>}
      </div>
    );
  }

  // ── Contrail Trace ────────────────────────────────────────────────────
  if (/contrail|trace|draw|path/i.test(v)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative flex flex-col items-center">
          <InFlightMark size={80} />
          <svg width="140" height="36" viewBox="0 0 140 36" className="mt-1">
            <motion.path
              d="M70 0 C50 18 25 28 0 32"
              stroke="currentColor" strokeWidth="1.5" fill="none" className="text-border"
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            />
            <motion.path
              d="M70 0 C90 18 115 28 140 32"
              stroke="currentColor" strokeWidth="1.5" fill="none" className="text-border"
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.1 }}
            />
          </svg>
        </div>
        {desc && <p className="text-xs text-muted-foreground select-none text-center max-w-xs">{desc}</p>}
      </div>
    );
  }

  // ── Gentle Float ──────────────────────────────────────────────────────
  if (/float|gentle|bob|drift/i.test(v)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <motion.div
          className="flex items-center gap-4"
          animate={{ y: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <svg width="32" height="8" viewBox="0 0 32 8">
            <path d="M0 4 Q8 1 16 4 Q24 7 32 4" stroke="currentColor" strokeWidth="1" fill="none" className="text-border" strokeDasharray="3 2" />
          </svg>
          <InFlightMark size={72} />
          <svg width="32" height="8" viewBox="0 0 32 8">
            <path d="M0 4 Q8 7 16 4 Q24 1 32 4" stroke="currentColor" strokeWidth="1" fill="none" className="text-border" strokeDasharray="3 2" />
          </svg>
        </motion.div>
        {desc && <p className="text-xs text-muted-foreground select-none text-center max-w-xs">{desc}</p>}
      </div>
    );
  }

  // ── Paper Fold ────────────────────────────────────────────────────────
  if (/fold|origami|unfold|paper/i.test(v)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <motion.div
          className="relative"
          animate={{ rotateY: [0, 8, 0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <InFlightMark size={80} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 90" fill="none">
            <line x1="50" y1="6" x2="50" y2="64" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" className="text-border" />
            <line x1="22" y1="53" x2="78" y2="53" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" className="text-border" />
          </svg>
        </motion.div>
        {desc && <p className="text-xs text-muted-foreground select-none text-center max-w-xs">{desc}</p>}
      </div>
    );
  }

  // ── Pulse Ring ────────────────────────────────────────────────────────
  if (/ring|pulse|glow|radiat|expand/i.test(v)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative flex items-center justify-center w-40 h-36">
          <motion.div
            className="absolute rounded-full border border-border"
            animate={{ width: [100, 130, 100], height: [100, 130, 100], opacity: [0.4, 0.15, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full border border-border"
            animate={{ width: [130, 160, 130], height: [130, 160, 130], opacity: [0.2, 0.08, 0.2] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
          />
          <InFlightMark size={80} />
        </div>
        {desc && <p className="text-xs text-muted-foreground select-none text-center max-w-xs -mt-4">{desc}</p>}
      </div>
    );
  }

  // ── Speed Lines (default) ─────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <InFlightMark size={80} />
        </motion.div>
        <div className="flex gap-3 mt-2">
          {[0, 1, 2].map(col => (
            <div key={col} className="flex flex-col gap-2">
              {[0, 1, 2, 3].map(row => (
                <motion.div
                  key={row}
                  className="w-2 h-3 bg-foreground rounded-full"
                  animate={{ opacity: [0.35 - row * 0.07, 0.05, 0.35 - row * 0.07] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: col * 0.15 + row * 0.05 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {desc && <p className="text-xs text-muted-foreground select-none text-center max-w-xs">{desc}</p>}
    </div>
  );
}

// ─── Map app section components ───────────────────────────────────────────────

function MapSection({ section: _ }: SectionProps) {
  return (
    <div className="wf-image-placeholder w-full min-h-[260px]" aria-label="Map" />
  );
}

function FloatingSearchSection({ section }: SectionProps) {
  const hasAvatar = section.contains.some(s => /\bavatar\b/i.test(s));
  const searchItem = section.contains.find(s => !/\bavatar\b/i.test(s));
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 shadow-sm">
        <Search size={14} className="text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground select-none flex-1">
          {displayLabel(searchItem ?? 'Search')}
        </span>
      </div>
      {hasAvatar && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="text-xs">Me</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function MapControlsSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col items-end gap-2 px-4 py-2">
      {section.contains.map((item, i) => (
        <Button key={i} variant="outline" size="icon" className="rounded-xl shadow-sm" title={item}>
          <HeaderIcon desc={item} />
        </Button>
      ))}
    </div>
  );
}

function CategoryStripSection({ section }: SectionProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3">
      {section.contains.map((item, i) => (
        <Badge key={i} variant="secondary" className="whitespace-nowrap flex-shrink-0 rounded-full px-3 py-1 text-xs select-none">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function PlaceListSection({ section }: SectionProps) {
  return (
    <div className="flex flex-col">
      {section.label && (
        <div className="px-4 pt-3 pb-1">
          <SectionLabel>{section.label}</SectionLabel>
        </div>
      )}
      {section.contains.map((item, i) => {
        const [name, distance] = item.split('—').map(s => s.trim());
        return (
          <div key={i}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground select-none">{name}</div>
                {distance && <div className="text-xs text-muted-foreground select-none">{distance}</div>}
              </div>
              <ChevronRight size={16} className="text-border flex-shrink-0" />
            </div>
            {i < section.contains.length - 1 && <Separator />}
          </div>
        );
      })}
    </div>
  );
}

function ModalSection({ section }: SectionProps) {
  const actionItems = section.contains.filter(c => classify(c).startsWith('btn'));
  const bodyItems   = section.contains.filter(c => !classify(c).startsWith('btn'));

  return (
    <div className="w-full flex items-center justify-center">
      <div className="bg-background border border-border rounded-xl w-[85%] max-w-xs shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground select-none">{section.label ?? 'Dialog'}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><X size={14} /></Button>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          {bodyItems.map((item, i) => <SmartItem key={i} label={item} />)}
        </div>
        {actionItems.length > 0 && (
          <div className="px-4 pb-3 pt-3 flex gap-2 justify-end border-t border-border">
            {actionItems.map((item, i) => <SmartItem key={i} label={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
