#!/usr/bin/env node
// Frank CLI entry point.
//
// Commands:
//   frank start   — inject CLAUDE.md, start daemon, launch panel
//   frank stop    — remove CLAUDE.md injection

import fs from 'fs';
import { execFile } from 'child_process';
import { SCHEMA_DIR, PANEL_APP_CANDIDATES } from './protocol.js';

const command = process.argv[2];

switch (command) {
  case 'start':
    await runStart();
    break;

  case 'stop':
    await runStop();
    break;

  default:
    console.log('Frank');
    console.log('');
    console.log('Usage:');
    console.log('  frank start   Start Frank (run this when you begin a session)');
    console.log('  frank stop    Stop Frank and remove Claude Code hooks');
    process.exit(0);
}

async function runStart(): Promise<void> {
  console.log('[frank] starting...');

  fs.mkdirSync(SCHEMA_DIR, { recursive: true });

  const { injectClaudeMd } = await import('./inject.js');
  injectClaudeMd();

  const { startServer } = await import('./server.js');
  startServer();

  launchPanel();

  console.log('[frank] ready — wireframes will appear as you design with Claude Code');
  console.log('[frank] press Ctrl+C to stop');

  process.on('SIGINT', async () => {
    console.log('\n[frank] stopping...');
    await runStop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await runStop();
    process.exit(0);
  });
}

async function runStop(): Promise<void> {
  const { removeClaudeMd } = await import('./inject.js');
  removeClaudeMd();
  console.log('[frank] stopped');
}

function launchPanel(): void {
  const appPath = PANEL_APP_CANDIDATES.find(p => fs.existsSync(p));
  if (!appPath) {
    console.warn('[frank] panel app not found at /Applications/frank.app');
    return;
  }
  execFile('open', [appPath], (err) => {
    if (err) console.warn('[frank] could not launch panel:', err.message);
    else console.log('[frank] panel launched');
  });
}
