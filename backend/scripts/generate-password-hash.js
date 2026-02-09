#!/usr/bin/env node

/**
 * Generate bcrypt hash for admin password
 * Usage: node scripts/generate-password-hash.js "your-password-here"
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('❌ Please provide a password as argument');
  console.error('Usage: node scripts/generate-password-hash.js "your-password"');
  process.exit(1);
}

if (password.length < 8) {
  console.warn('⚠️  WARNING: Password should be at least 8 characters long');
}

const BCRYPT_ROUNDS = 10;

bcrypt.hash(password, BCRYPT_ROUNDS, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  }

  console.log('✅ Password hash generated successfully!');
  console.log('\nAdd this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  console.log(`ADMIN_USERNAME="admin"`);
  console.log('\nOr set as environment variables:');
  console.log(`export ADMIN_PASSWORD_HASH="${hash}"`);
  console.log(`export ADMIN_USERNAME="admin"`);
});
