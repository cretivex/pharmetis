import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update DB_NAME to pharmetis
  envContent = envContent.replace(/DB_NAME=.*/g, 'DB_NAME=pharmetis');
  
  // Update or add DATABASE_URL to use pharmetis
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=.*/g, 'DATABASE_URL=postgresql://postgres:Admin@localhost:5432/pharmetis?schema=public');
    console.log('✅ Updated DATABASE_URL to use pharmetis database');
  } else {
    envContent += '\n# Prisma Database URL\nDATABASE_URL=postgresql://postgres:Admin@localhost:5432/pharmetis?schema=public\n';
    console.log('✅ Added DATABASE_URL for pharmetis database');
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated successfully');
  console.log('   Database: pharmetis');
  console.log('   DATABASE_URL configured\n');
} catch (error) {
  console.error('❌ Error updating .env:', error.message);
  process.exit(1);
}
