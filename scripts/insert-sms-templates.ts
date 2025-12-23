import { DataSource } from 'typeorm';
import { SmsTemplate } from '../src/database/entities/sms-template.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function insertSmsTemplates() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'payshati_db',
    entities: [SmsTemplate],
    synchronize: false,
  });

  await dataSource.initialize();
  const templateRepository = dataSource.getRepository(SmsTemplate);

  const templates = [
    {
      slug: 'otp',
      templateId: 'OTP001',
      content:
        'Hi {NAME}, your OTP is {OTP}. This OTP is valid for 10 minutes. Do not share this OTP with anyone.',
      status: 1,
    },
    {
      slug: 'create_user',
      templateId: 'WELCOME001',
      content:
        'Welcome {NAME}! Your account has been created successfully. Mobile: {MOBILE}, Password: {PASSWORD}, PIN: {PIN}. Please login and change your password immediately.',
      status: 1,
    },
    {
      slug: 'reset_password',
      templateId: 'RESET001',
      content:
        'Hi {NAME}, your password reset OTP is {OTP}. This OTP is valid for 10 minutes. If you did not request this, please ignore.',
      status: 1,
    },
    {
      slug: 'new_password',
      templateId: 'NEWPWD001',
      content:
        'Hi {NAME}, your new password is {PASSWORD}. Please login and change it immediately for security.',
      status: 1,
    },
    {
      slug: 'generate_pin',
      templateId: 'PIN001',
      content:
        'Hi {NAME}, your new PIN is {PIN}. Please keep it secure and do not share with anyone.',
      status: 1,
    },
  ];

  console.log('\n=== Inserting SMS Templates ===\n');

  for (const templateData of templates) {
    try {
      // Check if template already exists
      const existing = await templateRepository.findOne({
        where: { slug: templateData.slug },
      });

      if (existing) {
        // Update existing template
        existing.templateId = templateData.templateId;
        existing.content = templateData.content;
        existing.status = templateData.status;
        await templateRepository.save(existing);
        console.log(`✓ Updated template: ${templateData.slug}`);
      } else {
        // Insert new template
        const template = templateRepository.create(templateData);
        await templateRepository.save(template);
        console.log(`✓ Inserted template: ${templateData.slug}`);
      }
    } catch (error) {
      console.error(`✗ Error with template ${templateData.slug}:`, error);
    }
  }

  console.log('\n=== Listing All Templates ===\n');
  const allTemplates = await templateRepository.find({
    select: ['id', 'slug', 'templateId', 'status'],
  });

  allTemplates.forEach((t) => {
    console.log(`ID: ${t.id}, Slug: ${t.slug}, Template ID: ${t.templateId}, Status: ${t.status === 1 ? 'Active' : 'Inactive'}`);
  });

  console.log(`\n✅ Total templates: ${allTemplates.length}\n`);

  await dataSource.destroy();
}

insertSmsTemplates().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
