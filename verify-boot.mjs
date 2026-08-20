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

    // 3b. skillGet round-trip on the same skill
    const got = await svc.skillGet({ name: target.name });
    results.getResult = got?.ok === true && typeof got.content === 'string' && got.content.length > 0 ? 'ok' : `unexpected: ${JSON.stringify(got)}`;
  } else {
    results.toggleSkipped = 'no skills';
  }

  // 4. CRUD round-trip: create -> get -> update -> delete
  const probeName = 'zzz-verify-probe';
  try {
    const created = await svc.skillCreate({ name: probeName, content: '---\nname: zzz-verify-probe\ndescription: "verify probe"\n---\n\n# Probe\n\nHello.' });
    results.createResult = created?.ok === true ? 'ok' : `unexpected: ${JSON.stringify(created)}`;
    const gotProbe = await svc.skillGet({ name: probeName });
    results.getProbeResult = gotProbe?.ok === true && gotProbe.content.includes('Hello.') ? 'ok' : `unexpected: ${JSON.stringify(gotProbe)}`;
    const updatedProbe = await svc.skillUpdate({ name: probeName, content: '---\nname: zzz-verify-probe\ndescription: "updated"\n---\n\n# Probe\n\nUpdated body.' });
    results.updateResult = updatedProbe?.ok === true ? 'ok' : `unexpected: ${JSON.stringify(updatedProbe)}`;
    const gotUpdated = await svc.skillGet({ name: probeName });
    results.updateReadback = gotUpdated?.content.includes('Updated body.') ? 'ok' : `unexpected: ${JSON.stringify(gotUpdated)}`;
    // duplicate-create must fail
    let dupRejected = false;
    try {
      await svc.skillCreate({ name: probeName, content: '# dup' });
    } catch {
      dupRejected = true;
    }
    results.dupRejected = dupRejected ? 'ok' : 'unexpected: duplicate create succeeded';
    const deleted = await svc.skillDelete({ name: probeName });
    results.deleteResult = deleted?.ok === true ? 'ok' : `unexpected: ${JSON.stringify(deleted)}`;
    let gone = false;
    try {
      await svc.skillGet({ name: probeName });
    } catch {
      gone = true;
    }
    results.goneAfterDelete = gone ? 'ok' : 'unexpected: skill still readable after delete';

    // 5. rename round-trip: create -> rename -> old gone, new readable, frontmatter synced
    const renameSrc = 'zzz-verify-rename-src';
    const renameDst = 'zzz-verify-rename-dst';
    try {
      await svc.skillCreate({ name: renameSrc, content: '---\nname: zzz-verify-rename-src\ndescription: "rename probe"\n---\n\n# Rename probe\n\nBody.' });
      const renamed = await svc.skillRename({ name: renameSrc, newName: renameDst });
      results.renameResult = renamed?.ok === true ? 'ok' : `unexpected: ${JSON.stringify(renamed)}`;
      let oldGone = false;
      try {
        await svc.skillGet({ name: renameSrc });
      } catch {
        oldGone = true;
      }
      results.renameOldGone = oldGone ? 'ok' : 'unexpected: old name still readable';
      const renamedGet = await svc.skillGet({ name: renameDst });
      results.renameNewReadable = renamedGet?.ok === true && renamedGet.content.includes('Rename probe') ? 'ok' : `unexpected: ${JSON.stringify(renamedGet)}`;
      results.renameFrontmatter = renamedGet?.content.includes('name: zzz-verify-rename-dst') ? 'ok' : 'unexpected: frontmatter name not synced';
      await svc.skillDelete({ name: renameDst });
    } catch (err) {
      results.renameError = String(err?.stack || err);
      try { await svc.skillDelete({ name: renameDst }); } catch { /* ignore */ }
      try { await svc.skillDelete({ name: renameSrc }); } catch { /* ignore */ }
    }
  } catch (err) {
    results.crudError = String(err?.stack || err);
    // best-effort cleanup so a failed run does not leave the probe skill behind
    try { await svc.skillDelete({ name: probeName }); } catch { /* ignore */ }
  }
} catch (err) {
  results.error = String(err?.stack || err);
} finally {
  try { await shutdown?.(); } catch { /* ignore */ }
}

console.log('=== VERIFY RESULT ===');
console.log(JSON.stringify(results, null, 2));
setTimeout(() => process.exit(results.error ? 1 : 0), 300);
