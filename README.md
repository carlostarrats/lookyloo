<img width="684" height="644" alt="Screenshot 2026-03-04 at 7 24 21 PM" src="https://github.com/user-attachments/assets/ededc3d6-5d98-4cde-a06c-d7d0632eb0e7" />


# Frank

> A terminal companion for Claude Code that renders wireframes as you design.

**Status: Beta.** Core functionality works. Rough edges exist. Not ready for general use.

<!-- demo gif goes here -->

---

## What it does

When you ask Claude Code to design a screen or flow, Frank intercepts the output, generates a structured layout schema, and renders it as a wireframe in a floating native panel alongside your terminal. Each screen becomes a tab. The panel stays out of your way until there's something to show.

---

## What works

- Single screens and multi-screen flows render automatically as you work with Claude Code
- Section types with dedicated renderers: `header` `hero` `content` `top-nav` `bottom-nav` `sidebar` `form` `list` `grid` `chart` `stats-row` `footer` `empty-state` `banner` `toolbar` `modal` `loader` and more
- `list` sections with column headers render as data tables (not mobile lists)
- `stats-row` sections with value/badge format render as KPI cards
- `chart` sections render line charts with time-period tabs and axis labels
- Web platform (`"platform": "web"`) renders in full-width desktop layout — no device frame
- Mobile/tablet platforms render inside a device frame
- Tab bar for navigating multiple screens
- `Cmd+Shift+L` to show/hide the panel
- Actions menu per tab: copy schema, export as PNG, export as HTML, save as HTML, close tab

## What's known to be incomplete

- Colors appear in some renderers (status badges, chart lines) — should be black and white only
- Build and deploy process is manual — `frank start` should be the only command ever needed
- Renderer quality varies by section type — some sections look better than others
- No Homebrew or npm package yet — build from source only

---

## Install

```bash
git clone https://github.com/carlostarrats/frank
cd frank

# Install dependencies
npm install

# Build and install the panel app
npm run tauri build
cp -r src-tauri/target/release/bundle/macos/frank.app /Applications/frank.app

# Build and install the daemon CLI
cd daemon && npm install && npm run build && cd ..
npm install -g ./daemon
```

---

## Usage

```bash
frank start   # starts daemon, launches panel, injects CLAUDE.md block
frank stop    # stops daemon, removes CLAUDE.md block
```

`frank start` is the only command you should need. Open Claude Code, ask for a wireframe, it appears.

---

## How it works

```
Claude Code writes schema → /tmp/frank/render-<timestamp>.json
         ↓
  frank daemon watches /tmp/frank/ (FSEvents, ~10ms)
         ↓
  WebSocket → Tauri panel (ws://localhost:42069)
         ↓
  React validates + renders wireframe
```

No network traffic. No API calls. Everything stays on your machine.

---

## Schema

Frank renders from a typed JSON schema. Claude writes it; the panel consumes it.

**Single screen:**

```json
{
  "schema": "v1",
  "type": "screen",
  "label": "Dashboard",
  "timestamp": "2026-03-05T00:00:00Z",
  "platform": "web",
  "sections": [
    {
      "type": "header",
      "contains": ["Brand logo wordmark", "Dashboard nav link", "Search input", "User avatar"]
    },
    {
      "type": "stats-row",
      "contains": [
        "Total Revenue stat card — $84,320 value — +12.4% badge",
        "Orders stat card — 1,284 value — +8.1% badge"
      ]
    },
    {
      "type": "list",
      "label": "Recent Orders",
      "contains": [
        "Order # column header", "Customer column header", "Status column header",
        "#ORD-001 — Sarah Johnson — Fulfilled badge",
        "Previous button", "Page 1 of 12", "Next button"
      ]
    }
  ]
}
```

**Multi-screen flow:**

```json
{
  "schema": "v1",
  "type": "flow",
  "label": "Onboarding",
  "timestamp": "2026-03-05T00:00:00Z",
  "platform": "mobile",
  "screens": [
    { "label": "Welcome", "sections": [...] },
    { "label": "Create Account", "sections": [...] }
  ]
}
```

---

## Privacy

- No data leaves your machine. Ever.
- No telemetry, no analytics, no crash reporting.
- Reads only local files Claude Code writes to `/tmp/frank/`.
- No account, no API key, no network calls.

---

## Development

```bash
npm run dev          # frontend dev server
npm run tauri dev    # Tauri dev with hot reload (fastest for renderer changes)
npx tsc --noEmit     # type-check
```

Renderer changes during development: use `npm run tauri dev` — hot reload means no rebuild needed. Only use `npm run tauri build` for distribution.

---

## License

MIT
