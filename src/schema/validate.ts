import {
  SCHEMA_VERSION,
  PLATFORMS,
  SECTION_TYPES,
  SPACINGS,
  NAV_POSITIONS,
  HEADER_STYLES,
  LAYOUTS,
  type LookyLooSchema,
  type Section,
  type FlowScreen,
  type DesignLanguage,
} from './types';

// ─── Result types ─────────────────────────────────────────────────────────────

export type ValidationResult =
  | { valid: true; schema: LookyLooSchema }
  | { valid: false; error: string };

type Field<T> = { ok: true; value: T } | { ok: false; error: string };

// ─── Public entry point ───────────────────────────────────────────────────────

export function validateSchema(raw: unknown): ValidationResult {
  if (!isObject(raw)) {
    return fail('Schema must be a JSON object');
  }

  if (raw.schema !== SCHEMA_VERSION) {
    return fail(`Unsupported schema version: "${raw.schema}". Expected "${SCHEMA_VERSION}"`);
  }

  if (raw.type === 'screen') return validateScreenSchema(raw);
  if (raw.type === 'flow') return validateFlowSchema(raw);

  return fail(`Unknown schema type: "${raw.type}". Expected "screen" or "flow"`);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

function validateScreenSchema(raw: Record<string, unknown>): ValidationResult {
  const label = requireString(raw, 'label');
  if (!label.ok) return fail(label.error);

  const timestamp = requireString(raw, 'timestamp');
  if (!timestamp.ok) return fail(timestamp.error);

  const platform = requireEnum(raw, 'platform', PLATFORMS);
  if (!platform.ok) return fail(platform.error);

  const sections = requireSections(raw, 'sections');
  if (!sections.ok) return fail(sections.error);

  return {
    valid: true,
    schema: {
      schema: SCHEMA_VERSION,
      type: 'screen',
      label: label.value,
      timestamp: timestamp.value,
      platform: platform.value,
      sections: sections.value,
    },
  };
}

// ─── Flow ─────────────────────────────────────────────────────────────────────

function validateFlowSchema(raw: Record<string, unknown>): ValidationResult {
  const label = requireString(raw, 'label');
  if (!label.ok) return fail(label.error);

  const timestamp = requireString(raw, 'timestamp');
  if (!timestamp.ok) return fail(timestamp.error);

  const platform = requireEnum(raw, 'platform', PLATFORMS);
  if (!platform.ok) return fail(platform.error);

  const designLanguage = validateDesignLanguage(raw);
  if (!designLanguage.ok) return fail(designLanguage.error);

  const screens = validateFlowScreens(raw);
  if (!screens.ok) return fail(screens.error);

  if (screens.value.length === 0) {
    return fail('Flow must contain at least one screen');
  }

  return {
    valid: true,
    schema: {
      schema: SCHEMA_VERSION,
      type: 'flow',
      label: label.value,
      timestamp: timestamp.value,
      platform: platform.value,
      design_language: designLanguage.value,
      screens: screens.value,
    },
  };
}

// ─── Field validators ─────────────────────────────────────────────────────────

function requireString(obj: Record<string, unknown>, key: string): Field<string> {
  if (typeof obj[key] !== 'string' || (obj[key] as string).trim() === '') {
    return { ok: false, error: `"${key}" must be a non-empty string` };
  }
  return { ok: true, value: obj[key] as string };
}

function requireEnum<T extends string>(
  obj: Record<string, unknown>,
  key: string,
  allowed: readonly T[]
): Field<T> {
  if (!allowed.includes(obj[key] as T)) {
    return {
      ok: false,
      error: `"${key}" must be one of: ${allowed.join(', ')}. Got: "${obj[key]}"`,
    };
  }
  return { ok: true, value: obj[key] as T };
}

function requireSections(obj: Record<string, unknown>, key: string): Field<Section[]> {
  if (!Array.isArray(obj[key])) {
    return { ok: false, error: `"${key}" must be an array` };
  }
  if ((obj[key] as unknown[]).length === 0) {
    return { ok: false, error: `"${key}" must contain at least one section` };
  }

  const sections: Section[] = [];
  for (let i = 0; i < (obj[key] as unknown[]).length; i++) {
    const result = validateSection((obj[key] as unknown[])[i], i);
    if (!result.ok) return { ok: false, error: result.error };
    sections.push(result.value);
  }
  return { ok: true, value: sections };
}

function validateSection(raw: unknown, index: number): Field<Section> {
  const prefix = `sections[${index}]`;
  if (!isObject(raw)) return { ok: false, error: `${prefix} must be an object` };

  if (!SECTION_TYPES.includes(raw.type as typeof SECTION_TYPES[number])) {
    return {
      ok: false,
      error: `${prefix}.type must be one of: ${SECTION_TYPES.join(', ')}. Got: "${raw.type}"`,
    };
  }

  if (!Array.isArray(raw.contains)) {
    return { ok: false, error: `${prefix}.contains must be an array` };
  }

  for (let i = 0; i < (raw.contains as unknown[]).length; i++) {
    if (typeof (raw.contains as unknown[])[i] !== 'string') {
      return { ok: false, error: `${prefix}.contains[${i}] must be a string` };
    }
  }

  if (raw.layout !== undefined && !LAYOUTS.includes(raw.layout as typeof LAYOUTS[number])) {
    return { ok: false, error: `${prefix}.layout must be one of: ${LAYOUTS.join(', ')}` };
  }

  if (raw.label !== undefined && typeof raw.label !== 'string') {
    return { ok: false, error: `${prefix}.label must be a string` };
  }

  if (raw.note !== undefined && typeof raw.note !== 'string') {
    return { ok: false, error: `${prefix}.note must be a string` };
  }

  return {
    ok: true,
    value: {
      type: raw.type as Section['type'],
      contains: raw.contains as string[],
      ...(raw.label !== undefined && { label: raw.label as string }),
      ...(raw.layout !== undefined && { layout: raw.layout as Section['layout'] }),
      ...(raw.note !== undefined && { note: raw.note as string }),
    },
  };
}

function validateDesignLanguage(obj: Record<string, unknown>): Field<DesignLanguage> {
  const raw = obj.design_language;
  if (!isObject(raw)) {
    return { ok: false, error: '"design_language" must be an object' };
  }

  const COLOR_SCHEMES = ['light', 'dark', 'neutral'] as const;

  if (raw.nav_position !== undefined && !NAV_POSITIONS.includes(raw.nav_position as typeof NAV_POSITIONS[number])) {
    return { ok: false, error: `"design_language.nav_position" must be one of: ${NAV_POSITIONS.join(', ')}` };
  }
  if (raw.header_style !== undefined && !HEADER_STYLES.includes(raw.header_style as typeof HEADER_STYLES[number])) {
    return { ok: false, error: `"design_language.header_style" must be one of: ${HEADER_STYLES.join(', ')}` };
  }
  if (raw.spacing !== undefined && !SPACINGS.includes(raw.spacing as typeof SPACINGS[number])) {
    return { ok: false, error: `"design_language.spacing" must be one of: ${SPACINGS.join(', ')}` };
  }
  if (raw.color_scheme !== undefined && !COLOR_SCHEMES.includes(raw.color_scheme as typeof COLOR_SCHEMES[number])) {
    return { ok: false, error: `"design_language.color_scheme" must be one of: ${COLOR_SCHEMES.join(', ')}` };
  }

  return {
    ok: true,
    value: {
      ...(raw.nav_position !== undefined && { nav_position: raw.nav_position as DesignLanguage['nav_position'] }),
      ...(raw.header_style !== undefined && { header_style: raw.header_style as DesignLanguage['header_style'] }),
      ...(raw.card_style !== undefined && { card_style: raw.card_style as string }),
      ...(raw.spacing !== undefined && { spacing: raw.spacing as DesignLanguage['spacing'] }),
      ...(raw.color_scheme !== undefined && { color_scheme: raw.color_scheme as DesignLanguage['color_scheme'] }),
    },
  };
}

function validateFlowScreens(obj: Record<string, unknown>): Field<FlowScreen[]> {
  if (!Array.isArray(obj.screens)) {
    return { ok: false, error: '"screens" must be an array' };
  }

  const screens: FlowScreen[] = [];
  for (let i = 0; i < (obj.screens as unknown[]).length; i++) {
    const result = validateFlowScreen((obj.screens as unknown[])[i], i);
    if (!result.ok) return { ok: false, error: result.error };
    screens.push(result.value);
  }
  return { ok: true, value: screens };
}

function validateFlowScreen(raw: unknown, index: number): Field<FlowScreen> {
  const prefix = `screens[${index}]`;
  if (!isObject(raw)) return { ok: false, error: `${prefix} must be an object` };

  if (typeof raw.label !== 'string' || raw.label.trim() === '') {
    return { ok: false, error: `${prefix}.label must be a non-empty string` };
  }

  if (raw.platform !== undefined && !PLATFORMS.includes(raw.platform as typeof PLATFORMS[number])) {
    return { ok: false, error: `${prefix}.platform must be one of: ${PLATFORMS.join(', ')}` };
  }

  const sections = requireSections(raw, 'sections');
  if (!sections.ok) return { ok: false, error: `${prefix}.${sections.error}` };

  return {
    ok: true,
    value: {
      label: raw.label,
      ...(raw.platform !== undefined && { platform: raw.platform as FlowScreen['platform'] }),
      sections: sections.value,
    },
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function fail(message: string): ValidationResult {
  return { valid: false, error: message };
}
