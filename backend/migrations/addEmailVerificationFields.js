const pool = require('../config/database');

async function addEmailVerificationFields() {
  const queries = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP`,
  ];

  try {
    for (const q of queries) {
      await pool.query(q);
    }
    console.log('✅ Поля подтверждения почты добавлены в users');
  } catch (err) {
    console.error('❌ Ошибка миграции addEmailVerificationFields:', err.stack);
    process.exit(1);
  }
}

module.exports = addEmailVerificationFields;
