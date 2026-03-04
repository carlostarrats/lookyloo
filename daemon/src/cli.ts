#!/usr/bin/env node
// Frank CLI entry point.
//
// Commands:
//   frank start    — one-time setup: inject CLAUDE.md, install LaunchAgent, launch panel
//   frank stop     — unload LaunchAgent, remove CLAUDE.md injection
//   frank daemon   — start the server only (called by the LaunchAgent, not for direct use)

import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFile, execFileSync } from 'child_process';
import { SCHEMA_DIR, PANEL_APP_CANDIDATES } from './protocol.js';

const LAUNCH_AGENT_LABEL = 'com.frank.daemon';
const LAUNCH_AGENTS_DIR = path.join(os.homedir(), 'Library', 'LaunchAgents');
const PLIST_PATH = path.join(LAUNCH_AGENTS_DIR, `${LAUNCH_AGENT_LABEL}.plist`);

const command = process.argv[2];

switch (command) {
  case 'start':
    await runStart();
    break;

  case 'stop':
    await runStop();
    break;

  case 'daemon':
    await runDaemon();
    break;

  default:
    console.log('Frank');
    console.log('');
    console.log('Usage:');
    console.log('  frank start   One-time setup — auto-starts on every login after this');
    console.log('  frank stop    Remove Frank from login items and clean up');
    process.exit(0);
}

// ─── start: one-time setup ────────────────────────────────────────────────────

async function runStart(): Promise<void> {
  console.log('[frank] setting up...');

  fs.mkdirSync(SCHEMA_DIR, { recursive: true });
  fs.mkdirSync(LAUNCH_AGENTS_DIR, { recursive: true });

  const { injectClaudeMd } = await import('./inject.js');
  injectClaudeMd();

  installLaunchAgent();
  launchPanel();

  console.log('[frank] ready — Frank will now start automatically on every login');
}

// ─── stop: tear down ──────────────────────────────────────────────────────────

async function runStop(): Promise<void> {
  const { removeClaudeMd } = await import('./inject.js');
  removeClaudeMd();
  uninstallLaunchAgent();
  console.log('[frank] stopped and removed from login items');
}

// ─── daemon: server only (invoked by LaunchAgent) ────────────────────────────

async function runDaemon(): Promise<void> {
  fs.mkdirSync(SCHEMA_DIR, { recursive: true });

  const { startServer } = await import('./server.js');
  startServer();

  // Keep process alive — launchd will restart if it exits unexpectedly
  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT',  () => process.exit(0));
}

// ─── LaunchAgent helpers ──────────────────────────────────────────────────────

function frankBinPath(): string {
  try {
    return execFileSync('which', ['frank'], { encoding: 'utf8' }).trim();
  } catch {
    return '/opt/homebrew/bin/frank';
  }
}

function buildPlist(frankBin: string): string {
  const logPath = path.join(SCHEMA_DIR, 'daemon.log');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LAUNCH_AGENT_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${frankBin}</string>
    <string>daemon</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${logPath}</string>
  <key>StandardErrorPath</key>
  <string>${logPath}</string>
</dict>
</plist>
`;
}

function installLaunchAgent(): void {
  const bin = frankBinPath();
  const plist = buildPlist(bin);

  // Unload existing agent first if present
  if (fs.existsSync(PLIST_PATH)) {
    try { execFileSync('launchctl', ['unload', PLIST_PATH]); } catch { /* wasn't loaded */ }
  }

  fs.writeFileSync(PLIST_PATH, plist, 'utf8');

  try {
    execFileSync('launchctl', ['load', PLIST_PATH]);
    console.log('[frank] LaunchAgent installed — daemon will start on every login');
  } catch (e) {
    console.warn('[frank] LaunchAgent install failed:', (e as Error).message);
  }
}

function uninstallLaunchAgent(): void {
  if (!fs.existsSync(PLIST_PATH)) {
    console.log('[frank] LaunchAgent not found — nothing to remove');
    return;
  }
  try { execFileSync('launchctl', ['unload', PLIST_PATH]); } catch { /* wasn't loaded */ }
  fs.unlinkSync(PLIST_PATH);
  console.log('[frank] LaunchAgent removed');
}

// ─── Panel launch ─────────────────────────────────────────────────────────────

function launchPanel(): void {
  const appPath = PANEL_APP_CANDIDATES.find(p => fs.existsSync(p));
  if (!appPath) {
    console.warn('[frank] panel app not found at /Applications/frank.app');
    return;
  }
  execFile('open', [appPath], (err) => {
    if (err) console.warn('[frank] could not launch panel:', err.message);
    else console.log(`[frank] panel launched`);
  });
}
