import { DataSource } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkUsers() {
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

  console.log('\n=== Existing Users ===\n');
  const users = await userRepository.find({
    select: ['id', 'mobileNumber', 'emailAddress', 'firstName', 'lastName', 'status'],
  });

  if (users.length === 0) {
    console.log('No users found in the database.\n');
    console.log('You need to register a new account:');
    console.log('1. Go to http://localhost:3001/register (or your frontend URL)');
    console.log('2. Fill in the registration form');
    console.log('3. Verify OTP');
    console.log('4. You will receive password and PIN via SMS/Email\n');
  } else {
    users.forEach((user) => {
      console.log(`ID: ${user.id}`);
      console.log(`Mobile: ${user.mobileNumber}`);
      console.log(`Email: ${user.emailAddress}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Status: ${user.status === 1 ? 'Active' : 'Inactive'}`);
      console.log('---\n');
    });
    console.log(`\nTotal users: ${users.length}`);
    console.log('\nNote: Passwords are hashed. You need to use the password');
    console.log('that was set during registration or reset it.\n');
  }

  await dataSource.destroy();
}

checkUsers().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
