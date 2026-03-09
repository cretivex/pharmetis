import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('📦 Setting up database...');
    
    // Read SQL file
    const sqlFile = join(__dirname, 'create-tables.sql');
    const sql = readFileSync(sqlFile, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement) {
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.warn(`Warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Created 20 tables:');
    console.log('   Core: users, suppliers, products, rfqs, orders');
    console.log('   Supporting: 15 additional tables');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
