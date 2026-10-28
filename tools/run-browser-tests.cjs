/* Run the existing standalone suites with one explicit Chromium installation. */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const {spawn, execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const available = fs.readdirSync(path.join(root, 'tests')).filter(name => name.endsWith('.browser.cjs')).sort();
const requested = process.argv.slice(2);
if (requested.length === 1 && requested[0] === '--list') {
  console.log(available.join('\n'));
  process.exit(0);
}
const selected = requested.length ? [...new Set(requested.map(name => name.endsWith('.browser.cjs') ? name : name + '.browser.cjs'))] : available;
const unknown = selected.filter(name => !available.includes(name));
if (unknown.length) { console.error('Unknown browser suite: ' + unknown.join(', ')); process.exit(1); }
const output = path.resolve(process.env.DOCK_TEST_OUTPUT || path.join(os.tmpdir(), 'dock-dash-browser-tests'));
fs.mkdirSync(output, {recursive: true});
let commit = null;
try { commit = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim(); } catch (_) {}
const summary = {commit, status: 'running', chromium: null, suites: selected.map(file => ({file, status: 'unverified'}))};
const save = () => fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
let active;
function stop(signal) {
  if (!active) return;
  try { if (process.platform === 'win32') active.kill(signal); else process.kill(-active.pid, signal); } catch (_) {}
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { stop('SIGTERM'); process.exit(signal === 'SIGINT' ? 130 : 143); });

async function runSuite(row, env) {
  const name = row.file.replace('.browser.cjs', ''), directory = path.join(output, name);
  fs.mkdirSync(directory, {recursive: true});
  const log = fs.createWriteStream(path.join(directory, 'console.log'));
  console.log('\nRunning ' + row.file);
  const started = Date.now();
  const child = active = spawn(process.execPath, [path.join(root, 'tests', row.file)], {
    cwd: root, env: {...env, DOCK_TEST_OUTPUT: directory}, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe']
  });
  let error, timedOut = false, force;
  const timer = setTimeout(() => {
    timedOut = true; stop('SIGTERM');
    force = setTimeout(() => stop('SIGKILL'), 2000);
  }, 180000);
  for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { log.write(data); process.stdout.write(data); });
  child.on('error', value => { error = value.message; });
  const result = await new Promise(resolve => child.on('close', (code, signal) => resolve({code, signal})));
  clearTimeout(timer); clearTimeout(force); active = null;
  await new Promise(resolve => log.end(resolve));
  Object.assign(row, {status: !error && !timedOut && result.code === 0 ? 'passed' : 'failed', ...result, timedOut, durationMs: Date.now() - started});
  if (error) row.error = error;
  save();
}

(async () => {
  save();
  let chromium, modules;
  try {
    // Prefer a repo-local install; the runtime-owned dependency is optional.
    let manifest;
    try { manifest = require.resolve('playwright/package.json'); }
    catch (_) { manifest = require.resolve(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '', 'playwright/package.json')); }
    modules = path.dirname(path.dirname(manifest));
    ({chromium} = require(path.dirname(manifest)));
    summary.chromium = process.env.DOCK_CHROME || chromium.executablePath();
    const browser = await chromium.launch({executablePath: summary.chromium, headless: true, args: ['--no-sandbox']});
    await browser.close();
  } catch (error) {
    summary.status = 'blocked'; summary.error = error.message; save();
    throw Error('Chromium preflight failed; no browser suites ran.\n' + error.message + '\nInstall: npm install --no-save --package-lock=false playwright@1.62.1\nThen: npx playwright install --with-deps chromium\nOffline: set DOCK_CHROME to an installed compatible Chromium executable.');
  }
  const env = {...process.env, CODEX_PRIMARY_RUNTIME_NODE_MODULES: modules, DOCK_CHROME: summary.chromium};
  for (const row of summary.suites) await runSuite(row, env);
  const failed = summary.suites.filter(row => row.status !== 'passed');
  summary.status = failed.length ? 'failed' : 'passed'; save();
  console.log(`\n${summary.suites.length - failed.length}/${summary.suites.length} browser suites passed. Results: ${output}`);
  process.exitCode = failed.length ? 1 : 0;
})().catch(error => { console.error(error.message); process.exitCode = 1; });
