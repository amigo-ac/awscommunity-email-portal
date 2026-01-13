import { sql } from '@vercel/postgres';

const migrations = [
  // Add first_name
  `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS first_name varchar(100)`,
  `UPDATE accounts SET first_name = username WHERE first_name IS NULL`,
  `ALTER TABLE accounts ALTER COLUMN first_name SET NOT NULL`,
  // Add last_name
  `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_name varchar(100)`,
  // Add phone
  `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS phone varchar(20)`,
  // Add alternative_email
  `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS alternative_email varchar(255)`,
  `UPDATE accounts SET alternative_email = COALESCE(alternative_email, email) WHERE alternative_email IS NULL`,
  `ALTER TABLE accounts ALTER COLUMN alternative_email SET NOT NULL`,
  // Add google_display_name
  `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS google_display_name varchar(255)`,
  // Drop old column
  `ALTER TABLE accounts DROP COLUMN IF EXISTS creator_gmail`,
];

async function runMigrations() {
  console.log('Starting database migration...\n');
  for (const migration of migrations) {
    try {
      const preview = migration.length > 70 ? migration.substring(0, 70) + '...' : migration;
      console.log('Running:', preview);
      await sql.query(migration);
      console.log('✓ Success\n');
    } catch (error) {
      console.error('✗ Error:', error.message, '\n');
    }
  }
  console.log('Migration complete!');
  process.exit(0);
}

runMigrations();
