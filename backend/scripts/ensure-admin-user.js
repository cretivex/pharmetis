import prisma from '../src/config/database.js';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env.js';

async function ensureAdminUser() {
  try {
    const adminEmail = 'cretivex4@gmail.com';
    const adminPassword = 'Admin@123'; // Default password (won't be used for OTP login)

    console.log('\n🔐 Ensuring Admin User Exists...\n');

    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (adminUser) {
      // Update role to ADMIN if not already
      if (adminUser.role !== 'ADMIN') {
        adminUser = await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: 'ADMIN' }
        });
        console.log(`✅ Updated user ${adminEmail} to ADMIN role`);
      } else {
        console.log(`✅ Admin user ${adminEmail} already exists with ADMIN role`);
      }
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash(adminPassword, env.BCRYPT_SALT_ROUNDS);
      
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          fullName: 'Admin User',
          emailVerified: true
        }
      });
      
      console.log(`✅ Created admin user: ${adminEmail}`);
      console.log(`   Role: ADMIN`);
      console.log(`   Password: ${adminPassword} (for reference, OTP login is used)`);
    }

    console.log(`\n📧 Admin Email: ${adminEmail}`);
    console.log(`👤 Admin ID: ${adminUser.id}`);
    console.log(`🔑 Role: ${adminUser.role}`);
    console.log(`\n✅ Admin user ready for OTP login!\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error ensuring admin user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

ensureAdminUser();
