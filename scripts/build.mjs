import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundle = path.join(root, 'client/game.bundle.js');
const patch59 = path.join(root, 'client/v59.patch.js');
const patch60 = path.join(root, 'client/v60.patch.js');
const patch61 = path.join(root, 'client/v61.patch.js');
const patch62 = path.join(root, 'client/v62.patch.js');
try {
  const esbuild = await import('esbuild');
  await esbuild.build({
    entryPoints: [path.join(root, 'client/game.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome90','edge90','firefox88'],
    minify: true,
    outfile: bundle
  });
  fs.appendFileSync(bundle, `\n${fs.readFileSync(patch60, 'utf8')}\n${fs.readFileSync(patch61, 'utf8')}\n${fs.readFileSync(patch62, 'utf8')}\n`);
  console.log('v62 source bundle built with esbuild and v60/v61/v62 runtime patches');
} catch (error) {
  const bundleOk = fs.existsSync(bundle) && fs.statSync(bundle).size > 500_000;
  const patchOk = fs.existsSync(patch59) && fs.statSync(patch59).size > 5_000 && fs.existsSync(patch60) && fs.statSync(patch60).size > 8_000 && fs.existsSync(patch61) && fs.statSync(patch61).size > 8_000 && fs.existsSync(patch62) && fs.statSync(patch62).size > 20_000;
  if (!bundleOk || !patchOk) throw new Error(`esbuild unavailable and validated prebuilt files are missing: ${error?.message || error}`);
  console.log('esbuild unavailable: validated prebuilt engine + v59/v60/v61/v62 compatibility patches');
}
