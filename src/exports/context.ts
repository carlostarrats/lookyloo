// Copy as context — copies the tab's schema as formatted JSON to clipboard.
// The user pastes it directly into Claude Code:
//   "Here's the wireframe we landed on, build from this"
// Claude receives full structured layout intent, not a vague description.

import type { LookyLooSchema } from '../schema/types';

export async function copyAsContext(schema: LookyLooSchema): Promise<void> {
  const json = JSON.stringify(schema, null, 2);
  await navigator.clipboard.writeText(json);
}
