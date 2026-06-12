const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'backend', '.env');

if (!fs.existsSync(envPath)) {
  console.error('ERROR: backend/.env not found. Copy backend/.env.example to backend/.env first.');
  process.exit(1);
}

let env = fs.readFileSync(envPath, 'utf8');

const accessSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');

env = env
  .replace(/JWT_ACCESS_SECRET=.*/, `JWT_ACCESS_SECRET=${accessSecret}`)
  .replace(/JWT_REFRESH_SECRET=.*/, `JWT_REFRESH_SECRET=${refreshSecret}`)
  .replace(/ENCRYPTION_KEY=.*/, `ENCRYPTION_KEY=${encryptionKey}`);

fs.writeFileSync(envPath, env);

console.log('✓ JWT_ACCESS_SECRET  generated');
console.log('✓ JWT_REFRESH_SECRET generated');
console.log('✓ ENCRYPTION_KEY     generated');
console.log('');
console.log('Secrets written to backend/.env');
console.log('');
console.log('Still required:');
console.log('  - MONGODB_URI      → https://cloud.mongodb.com');
console.log('  - GEMINI_API_KEY   → https://aistudio.google.com/app/apikey  (in ai-service/.env)');
