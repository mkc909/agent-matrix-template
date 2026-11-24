import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../src/worker.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FORBIDDEN_PRIVATE_PATTERNS = [
  /mike/i,
  /courtney/i,
  /auramediastudios/i,
  /possibility[-_]?engineering/i,
  /magicreceptionist/i,
  /simplefin/i,
  /beelink/i,
  /ovh001/i,
  /cos-n[1-5]/i,
  /ops-os/i,
  /orlando/i,
  /cardnetwork/i,
  /tradeos/i,
  /lifeos/i,
  /brooke/i,
  /mercury\s*bank/i,
  /wells\s*fargo/i,
  /capital\s*one/i,
];

test('zero private identifiers appear anywhere in agent-matrix-template source or outputs', async () => {
  const files = ['index.html', 'src/worker.js', 'src/ui-html.js', 'QUICK-GUIDE.md', 'README.md', 'wrangler.jsonc'];
  for (const rel of files) {
    const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    for (const rx of FORBIDDEN_PRIVATE_PATTERNS) {
      assert.equal(rx.test(content), false, `Forbidden private pattern ${rx} leaked into ${rel}`);
    }
  }
});

test('demo worker serves /, /api/schema, and /health cleanly with private_data: false', async () => {
  const env = { GIT_SHA: 'deadbeef0123456789abcdef0123456789abcdef' };

  const rootRes = await worker.fetch(new Request('https://matrix-demo.apidevelopment.dev/'), env);
  assert.equal(rootRes.status, 200);
  const html = await rootRes.text();
  assert.match(html, /AGENT MATRIX \/\/ NEXUS SIM/);
  assert.match(html, /QUICK GUIDE/);

  const schemaRes = await worker.fetch(new Request('https://matrix-demo.apidevelopment.dev/api/schema'), env);
  assert.equal(schemaRes.status, 200);
  const schema = await schemaRes.json();
  assert.equal(schema.version, '1.0.0');
  assert.ok(Array.isArray(schema.starter_payload?.streams));
  assert.ok(Array.isArray(schema.starter_payload?.edges));

  const healthRes = await worker.fetch(new Request('https://matrix-demo.apidevelopment.dev/health'), env);
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(health.ok, true);
  assert.equal(health.service, 'agent-matrix-demo');
  assert.equal(health.mode, 'simulated-template');
  assert.equal(health.git_sha, env.GIT_SHA);
  assert.equal(health.private_data, false);
});
