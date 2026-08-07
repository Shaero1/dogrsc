import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

function startInfra() {
  log('starting Docker infra (postgres, redis, minio)...');
  run('docker compose -f infra/docker-compose.dev.yml up -d');
  // --wait on all services fails when minio-init exits; wait only long-running services
  run(
    'docker compose -f infra/docker-compose.dev.yml up -d --wait postgres redis minio',
  );
}

function applyMigrations() {
  log('applying database migrations...');
  run('npm run db:migrate:deploy -w dogrsc-backend');
}

function seedIfEmpty() {
  log('checking if database needs seed...');

  let userCount = '0';
  try {
    userCount = execSync(
      'docker compose -f infra/docker-compose.dev.yml exec -T postgres psql -U dogrsc -d dogrsc -tAc "SELECT COUNT(*) FROM users"',
      { cwd: root, encoding: 'utf8', shell: true },
    ).trim();
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
}

ensureEnvFiles();
startInfra();
applyMigrations();
seedIfEmpty();
printDevUrls();
