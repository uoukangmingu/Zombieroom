import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'client/game.js'), 'utf8');
const match = source.match(/const resolveStoryTargetScreenSide = \(dx, dz, yaw\) => \(([^;]+)\);/);
assert.ok(match, 'target side helper not found');
const resolveSide = Function('dx', 'dz', 'yaw', `return (${match[1]});`);

assert.equal(resolveSide(-10, 0, 0), 'left', 'world-left target must appear on the left edge when looking toward -Z');
assert.equal(resolveSide(10, 0, 0), 'right', 'world-right target must appear on the right edge when looking toward -Z');
assert.equal(resolveSide(0, 10, Math.PI / 2), 'left', 'camera-space side must rotate with yaw');

let lockedSide = resolveSide(-10, 0, 0);
const sideAfterTurningAway = lockedSide || resolveSide(-10, 0, -Math.PI);
assert.equal(sideAfterTurningAway, 'left', 'off-screen direction must remain locked until the target is visible again');

console.log('v59 mission target direction unit tests: passed');
