import { it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

it('initialises and runs the solver without unsafe-eval (strict CSP)', () => {
  const glue = fileURLToPath(new URL('../planegcs_dist/planegcs.js', import.meta.url));
  const script = `
    import(${JSON.stringify(glue)}).then(async ({ default: init }) => {
      const m = await init();
      const gcs = new m.GcsSystem();
      const targetX = gcs.push_p_param(5, true); // sketch parameter
      const pointX = gcs.push_p_param(0, false);
      const pointY = gcs.push_p_param(0, false);
      const point = gcs.make_point(pointX, pointY);
      gcs.add_constraint_coordinate_x(point, targetX, 1, true, 1);

      const status = gcs.solve_system(2);
      gcs.apply_solution();
      if (status !== 0 || gcs.get_p_param(pointX) !== 5) {
        throw new Error('Solver failed to move the point to the sketch parameter');
      }
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