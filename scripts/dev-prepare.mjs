import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const composeFile = 'infra/docker-compose.dev.yml';

function log(message) {
  console.log(`[dev] ${message}`);
}

function run(command, options = {}) {
  execSync(command, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    ...options,
  });
}

function runQuiet(command) {
  return execSync(command, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function copyEnvIfMissing(relativeTarget, relativeExample) {
  const target = path.join(root, relativeTarget);
  const example = path.join(root, relativeExample);

  if (fs.existsSync(target)) {
    return;
  }

  if (!fs.existsSync(example)) {
    log(`skip ${relativeTarget} (no ${relativeExample})`);
    return;
  }

  fs.copyFileSync(example, target);
  log(`created ${relativeTarget} from ${relativeExample}`);
}

function ensureEnvFiles() {
  copyEnvIfMissing('infra/.env', 'infra/.env.example');
  copyEnvIfMissing('backend/.env', 'backend/.env.example');
  copyEnvIfMissing('frontend/.env.local', 'frontend/.env.example');
  copyEnvIfMissing('admin/.env.local', 'admin/.env.example');
}

function isPostgresReady() {
  try {
    runQuiet(
      `docker compose -f ${composeFile} exec -T postgres pg_isready -U dogrsc -d dogrsc`,
    );
    return true;
  } catch {
    return false;
  }
}

function startInfra() {
  if (isPostgresReady()) {
    log('Docker infra already running — skip docker compose up');
    return;
  }

  log('starting Docker infra (postgres, redis, minio)...');
  run(`docker compose -f ${composeFile} up -d`);
  run(
    `docker compose -f ${composeFile} up -d --wait postgres redis minio`,
  );

  if (!isPostgresReady()) {
    console.error('');
    console.error('[dev] ERROR: Postgres is not reachable on localhost:5432.');
    console.error('[dev] Run: npm run dev:infra:up');
    console.error('[dev] Or start Docker Desktop and retry.');
    console.error('');
    process.exit(1);
  }
}

function applyMigrations() {
  log('applying database migrations...');
  run('npm run db:migrate:deploy -w dogrsc-backend');
}

function seedIfEmpty() {
  log('checking if database needs seed...');

  let userCount = '0';
  try {
    userCount = runQuiet(
      `docker compose -f ${composeFile} exec -T postgres psql -U dogrsc -d dogrsc -tAc "SELECT COUNT(*) FROM users"`,
    );
  } catch (error) {
    log(`seed check skipped: ${error instanceof Error ? error.message : error}`);
    return;
  }

  if (userCount !== '0') {
    log(`database already has users (${userCount}) — skip seed`);
    return;
  }

  log('empty database — running seed...');
  run('npm run db:seed -w dogrsc-backend');
}

function printDevUrls() {
  console.log('');
  log('ready — starting apps');
  console.log('  API:      http://localhost:4000/api/v1/health');
  console.log('  Frontend: http://localhost:3000/en');
  console.log('  Admin:    http://localhost:3001/login');
  console.log('  Login:    admin@dogerescue.org / changeme-dev-only');
  console.log('');
  console.log('  Tip: use npm run dev:lite for backend+frontend only (less RAM).');
  console.log('');
}

ensureEnvFiles();
startInfra();
applyMigrations();
seedIfEmpty();
printDevUrls();
