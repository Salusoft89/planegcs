import { it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

it('initialises without unsafe-eval (strict CSP)', () => {
  const glue = fileURLToPath(new URL('../planegcs_dist/planegcs.js', import.meta.url));
  const script = `
    import(${JSON.stringify(glue)}).then(async ({ default: init }) => {
      const m = await init();
      new m.GcsSystem();   // embind invokers are built on first use
    });
  `;
  const r = spawnSync(
    process.execPath,
    ['--disallow-code-generation-from-strings', '-e', script],
    { encoding: 'utf8' },
  );
  expect(r.stderr).not.toMatch(/EvalError|unsafe-eval|Code generation from strings/);
  expect(r.status).toBe(0);
});