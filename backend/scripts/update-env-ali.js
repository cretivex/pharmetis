import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update DB_NAME to ali
  envContent = envContent.replace(/DB_NAME=pharmetis/g, 'DB_NAME=ali');
  
  // Add or update DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=.*/g, 'DATABASE_URL=postgresql://postgres:Admin@localhost:5432/ali?schema=public');
    console.log('✅ Updated DATABASE_URL');
  } else {
    envContent += '\n# Prisma Database URL\nDATABASE_URL=postgresql://postgres:Admin@localhost:5432/ali?schema=public\n';
    console.log('✅ Added DATABASE_URL');
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated successfully');
  console.log('   Database: ali');
  console.log('   DATABASE_URL configured\n');
} catch (error) {
  console.error('❌ Error updating .env:', error.message);
  process.exit(1);
}
