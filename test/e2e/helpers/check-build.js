/**
 * Runs once before the Playwright suites. They load distros/chrome as it stands,
 * so stop here with the fix in plain words if that build is missing or behind src/.
 */
import fs from 'fs';
import path from 'path';

const BUILD = path.resolve('distros/chrome');
const OUTPUT = /\.build\.(js|css)$/;

function newestSource(dir) {
  let newest = { time: 0, file: '' };
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = newestSource(file);
      if (inner.time > newest.time) newest = inner;
    } else if (!OUTPUT.test(entry.name) && entry.name !== '.DS_Store') {
      const time = fs.statSync(file).mtimeMs;
      if (time > newest.time) newest = { time, file };
    }
  }
  return newest;
}

export default function checkBuild() {
  const fix = 'Run: npm run build:chrome';
  const worker = path.join(BUILD, 'background-sw.build.js');
  if (!fs.existsSync(worker)) throw new Error(`No Chrome build at ${BUILD}. ${fix}`);

  const built = fs.statSync(worker).mtimeMs;
  const { time, file } = newestSource(path.resolve('src'));
  if (time > built) {
    throw new Error(`The Chrome build is older than ${path.relative(process.cwd(), file)}. ${fix}`);
  }

  const version = (name) => JSON.parse(fs.readFileSync(name, 'utf8')).version;
  const want = version('package.json');
  const have = version(path.join(BUILD, 'manifest.json'));
  if (have !== want) throw new Error(`The Chrome build is v${have}, package.json is v${want}. ${fix}`);
}
