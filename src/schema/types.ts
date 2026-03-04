// Looky Loo Schema — v1
// This is the single source of truth. The panel and all exports consume this schema.
// Never render without a validated schema. Never export from a different representation.

export const SCHEMA_VERSION = 'v1' as const;

// ─── Primitives ───────────────────────────────────────────────────────────────

export const PLATFORMS = ['mobile', 'web', 'tablet'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const SECTION_TYPES = [
  'header',      // App/page header, logo, nav links, avatar
  'hero',        // Headline, subheadline, primary CTA
  'content',     // Main content area — generic
  'top-nav',     // Tab bar or segment control at top
  'bottom-nav',  // Mobile tab bar at bottom
  'sidebar',     // Side panel (web layouts)
  'form',        // Input fields, labels, submit
  'list',        // Vertical list of items
  'grid',        // Card grid, image grid
  'footer',      // Page footer
  'empty-state', // Zero state with illustration and message
  'banner',      // Notification, alert, or announcement strip
  'toolbar',     // Action toolbar with icon buttons
  'modal',       // Overlay dialog (documented in schema, rendered as overlay block)
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const SPACINGS = ['compact', 'comfortable', 'spacious'] as const;
export type Spacing = (typeof SPACINGS)[number];

export const NAV_POSITIONS = ['top', 'bottom', 'sidebar', 'none'] as const;
export type NavPosition = (typeof NAV_POSITIONS)[number];

export const HEADER_STYLES = ['minimal', 'prominent', 'none'] as const;
export type HeaderStyle = (typeof HEADER_STYLES)[number];

export const LAYOUTS = ['row', 'column', 'grid'] as const;
export type Layout = (typeof LAYOUTS)[number];

// ─── Section ─────────────────────────────────────────────────────────────────

export interface Section {
  /** Semantic type of this section — used by the renderer to pick the right component */
  type: SectionType;
  /** Optional override label for display in the wireframe (e.g. "Featured Items") */
  label?: string;
  /** Descriptive list of elements this section contains (e.g. ["logo", "nav links", "user avatar"]) */
  contains: string[];
  /** How contained elements are arranged */
  layout?: Layout;
  /** Freeform annotation — designer/Claude notes visible in the wireframe */
  note?: string;
}

// ─── Design Language ─────────────────────────────────────────────────────────
// Applied at the flow level. All screens in a flow inherit from this.
// This is what keeps a 4-screen onboarding flow visually coherent.

export interface DesignLanguage {
  nav_position?: NavPosition;
  header_style?: HeaderStyle;
  /** Descriptive card style (e.g. "rounded-lg shadow-sm", "flat border") */
  card_style?: string;
  spacing?: Spacing;
  /** Broad color intent — not a specific color, just a direction */
  color_scheme?: 'light' | 'dark' | 'neutral';
}

// ─── Single Screen ────────────────────────────────────────────────────────────

export interface ScreenSchema {
  schema: typeof SCHEMA_VERSION;
  type: 'screen';
  label: string;
  /** ISO 8601 timestamp of when this render was generated */
  timestamp: string;
  platform: Platform;
  sections: Section[];
}

// ─── Multi-Screen Flow ────────────────────────────────────────────────────────

export interface FlowScreen {
  label: string;
  /** Overrides the flow-level platform for this screen only */
  platform?: Platform;
  sections: Section[];
}

export interface FlowSchema {
  schema: typeof SCHEMA_VERSION;
  type: 'flow';
  label: string;
  /** ISO 8601 timestamp of when this flow was generated */
  timestamp: string;
  /** Default platform for all screens in this flow */
  platform: Platform;
  /** Shared design language — inherited by all screens */
  design_language: DesignLanguage;
  screens: FlowScreen[];
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type LookyLooSchema = ScreenSchema | FlowSchema;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isScreenSchema(schema: LookyLooSchema): schema is ScreenSchema {
  return schema.type === 'screen';
}

export function isFlowSchema(schema: LookyLooSchema): schema is FlowSchema {
  return schema.type === 'flow';
}
