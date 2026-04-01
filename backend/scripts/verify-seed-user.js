/**
 * Read-only check: confirms a seeded buyer exists with a password (for local login testing).
 * Run: node scripts/verify-seed-user.js
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TEST_EMAIL = 'buyer1@healthcare.com';

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: TEST_EMAIL, deletedAt: null },
    select: { id: true, email: true, role: true, password: true }
  });
  if (!user) {
    console.error(`No user found for ${TEST_EMAIL}. Run: npm run prisma:seed`);
    process.exit(1);
  }
  if (!user.password) {
    console.error(`User ${TEST_EMAIL} has no password (OTP-only). Use OTP login or set a password.`);
    process.exit(1);
  }
  console.log(`OK: ${user.email} exists with role ${user.role} and password hash set.`);
  console.log('Test login: email + password123 (if you used default seed).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
