// Verify dsh-skill-manager bundle loads in a fresh web-profile boot.
// Starts runProfile on port 3099, calls the skillManager gateway, prints results, shuts down.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const profileBoot = require('C:/Users/15354/.dsh/profiles/node_modules/@deepseek-ai/dsh/lib/profile-boot-DG5t9aNs.js');
const runProfile = profileBoot.o;

const env = new Map(Object.entries(process.env));
env.set('DSH_HOME', 'C:/Users/15354/.dsh');

const booted = await runProfile({
  profile: 'web',
  patchFiles: [],
  args: ['--port', '3099'],
  environment: env,
  binName: 'dsh',
  cwd: process.cwd(),
});
const ctx = booted.ctx ?? booted;
const shutdown = typeof booted.shutdown === 'function' ? booted.shutdown : () => {};

const results = {};

try {
  // 1. skillManager service present?
  const svc = ctx.skillManager;
  results.servicePresent = typeof svc === 'object' && svc !== null;
  if (!svc) throw new Error('skillManager service not registered');

  // 2. skillList — returns { dir, skills: [...] }
  const list = await svc.skillList();
  const skills = Array.isArray(list) ? list : (list?.skills ?? []);
  results.skillCount = skills.length;
  results.skillDir = Array.isArray(list) ? undefined : list?.dir;
  results.sampleSkills = skills.slice(0, 5).map(s => ({ name: s?.name, enabled: s?.enabled }));

  // 3. skillSet toggle round-trip: pick first skill, toggle it, verify state change
  if (skills.length > 0) {
    const target = skills[0];
    const newState = !target.enabled;
    results.toggleTarget = { name: target.name, from: target.enabled, to: newState };
    const updated = await svc.skillSet({ name: target.name, enabled: newState });
    results.toggleResult = updated && (updated.enabled === newState) ? 'ok' : `unexpected: ${JSON.stringify(updated)}`;
    // restore
    const restored = await svc.skillSet({ name: target.name, enabled: target.enabled });
    results.restored = restored?.enabled === target.enabled ? 'ok' : `unexpected: ${JSON.stringify(restored)}`;
  } else {
    results.toggleSkipped = 'no skills';
  }
} catch (err) {
  results.error = String(err?.stack || err);
} finally {
  try { await shutdown?.(); } catch { /* ignore */ }
}

console.log('=== VERIFY RESULT ===');
console.log(JSON.stringify(results, null, 2));
setTimeout(() => process.exit(results.error ? 1 : 0), 300);
