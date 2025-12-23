import { DataSource } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createTestUser() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'payshati_db',
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  // Test user credentials
  const testMobile = '9876543210';
  const testEmail = 'test@payshati.com';
  const testPassword = 'Test@123';
  const testPin = '1234';

  // Check if user already exists
  const existingUser = await userRepository.findOne({
    where: [
      { mobileNumber: testMobile },
      { emailAddress: testEmail },
    ],
  });

  if (existingUser) {
    console.log('\n⚠️  Test user already exists!');
    console.log(`Mobile: ${existingUser.mobileNumber}`);
    console.log(`Email: ${existingUser.emailAddress}`);
    console.log('\nTo login, you need to know the password.');
    console.log('If you forgot, you can reset it via the reset password flow.\n');
    await dataSource.destroy();
    return;
  }

  // Create test user
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  const loginKey = randomBytes(40).toString('hex');

  const testUser = userRepository.create({
    parentId: 1,
    roleId: 6,
    schemeId: 1,
    firstName: 'Test',
    lastName: 'User',
    mobileNumber: testMobile,
    emailAddress: testEmail,
    password: hashedPassword,
    tPin: testPin,
    loginKey,
    loginType: 'Password',
    gender: 'Male',
    city: 'Test City',
    registerBy: 'Script',
    kycStatus: 'Pending',
    bankAccountType: 'Savings',
    profilePic: 'avatar-2.png',
    status: 1,
    walletBalance: 0,
    miniumBalance: 0,
  });

  const savedUser = await userRepository.save(testUser);

  console.log('\n✅ Test user created successfully!\n');
  console.log('=== Login Credentials ===');
  console.log(`Mobile Number: ${testMobile}`);
  console.log(`Password: ${testPassword}`);
  console.log(`PIN: ${testPin}`);
  console.log('\nYou can now login with these credentials.\n');

  await dataSource.destroy();
}

createTestUser().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
