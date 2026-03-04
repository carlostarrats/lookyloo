# Looky Loo

> "See what you're building."

A terminal companion for Claude Code that automatically renders wireframes in a native macOS panel — no configuration, no prompting, no extra windows to manage.

<!-- demo gif goes here -->

---

## What it does

When you ask Claude Code to design a screen or flow, Looky Loo intercepts the output, generates a structured layout schema, and renders it as a low-fidelity wireframe in a floating panel alongside your terminal. Each screen becomes a tab. Multi-screen flows populate one by one, in sequence, with a skeleton that crossfades to the wireframe on completion.

The panel is invisible until there's something to show. It hides on `Cmd+Shift+L`. It has no dock icon. It gets out of your way.

---

## Install

> **Homebrew and npm packages are coming.** For now, build from source:

```bash
git clone https://github.com/carlostarrats/lookyloo
cd lookyloo

# Build the daemon
cd daemon && npm install && npm run build && cd ..

# Install the daemon CLI globally
npm install -g ./daemon

# Build and run the panel
npm install
npm run tauri build
```

---

## Usage

```bash
# Start the daemon (runs in background, injects hooks + CLAUDE.md block)
lookyloo start

# Open Claude Code and work normally — wireframes appear automatically
claude

# Stop the daemon (removes hooks + CLAUDE.md block cleanly)
lookyloo stop
```

`lookyloo start` does two things:

1. Registers a `PostToolUse` hook in `~/.claude/settings.json` so the tool fires after Claude writes a schema file
2. Appends a delimited block to `~/.claude/CLAUDE.md` that instructs Claude Code to write layout schemas to `/tmp/lookyloo/`

Both are idempotent and cleanly reversible with `lookyloo stop`.

The panel launches automatically on `lookyloo start` and toggles with `Cmd+Shift+L` from anywhere on your desktop.

---

## How it works

```
Claude Code (PostToolUse hook)
         ↓
  daemon/hook.ts reads schema from tool output
         ↓
  Unix socket → daemon/server.ts
         ↓
  WebSocket → Tauri panel (ws://localhost:42069)
         ↓
  React validates + renders wireframe
```

No network traffic. No API calls. Everything stays on your machine.

---

## Schema

Looky Loo renders from a typed JSON schema. Claude writes it; the panel consumes it; every export sends the same schema. What you see is exactly what you export.

**Single screen:**

```json
{
  "schema": "v1",
  "type": "screen",
  "label": "Home Screen",
  "timestamp": "2025-03-03T14:34:00Z",
  "platform": "mobile",
  "sections": [
    { "type": "header", "contains": ["logo", "nav links", "user avatar"] },
    { "type": "hero", "contains": ["headline", "subheadline", "CTA button"] },
    { "type": "list", "contains": ["item", "item", "item"] },
    { "type": "bottom-nav", "contains": ["home", "search", "profile"] }
  ]
}
```

**Multi-screen flow:**

```json
{
  "schema": "v1",
  "type": "flow",
  "label": "Onboarding Flow",
  "timestamp": "2025-03-03T14:34:00Z",
  "platform": "mobile",
  "design_language": {
    "nav_position": "bottom",
    "header_style": "minimal",
    "spacing": "comfortable"
  },
  "screens": [
    { "label": "Welcome", "sections": [...] },
    { "label": "Create Account", "sections": [...] },
    { "label": "Set Preferences", "sections": [...] },
    { "label": "All Done", "sections": [...] }
  ]
}
```

**Supported section types:** `header` `hero` `content` `top-nav` `bottom-nav` `sidebar` `form` `list` `grid` `footer` `empty-state` `banner` `toolbar` `modal`

**Supported platforms:** `mobile` `tablet` `web`

---

## Exports

Every export in the panel header reads from the same schema that drove the render.

| Button | Output | When it appears |
|--------|--------|-----------------|
| **Copy** | Formatted JSON schema → clipboard | Always |
| **Figma** | Claude + Figma MCP prompt → clipboard | If `figma` plugin is installed |
| **GitHub** | GitHub-flavored markdown → clipboard | If `github` plugin is installed |
| **PNG** | Wireframe image (2× retina) → download | Always |

Plugin detection is automatic — Looky Loo reads `~/.claude/plugins/installed_plugins.json` at launch. No configuration needed.

---

## Privacy

- No data leaves your machine. Ever.
- No telemetry, no analytics, no crash reporting.
- Reads only local files Claude Code writes to `/tmp/lookyloo/`.
- No account, no API key, no network calls (MCP exports are initiated explicitly by you).
- The codebase is the privacy policy. Read it.

---

## Development

```bash
# Frontend dev server
npm run dev

# Tauri dev (hot reload)
npm run tauri dev

# Type-check
npx tsc --noEmit

# Daemon type-check
cd daemon && npx tsc --noEmit
```

**Architecture:** Tauri shell is intentionally minimal — no Rust logic beyond window management and the global shortcut. All application logic lives in React. See `CLAUDE.md` for locked architectural decisions.

---

## License

MIT — [carlostarrats/lookyloo](https://github.com/carlostarrats/lookyloo)
