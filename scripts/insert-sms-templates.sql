-- SMS Templates for Payshati Platform
-- Run this SQL script to insert required SMS templates

-- Template for OTP verification (used in login and registration)
INSERT INTO sms_templates (slug, template_id, content, status, created_at, updated_at)
VALUES (
  'otp',
  'OTP001',
  'Hi {NAME}, your OTP is {OTP}. This OTP is valid for 10 minutes. Do not share this OTP with anyone.',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  template_id = VALUES(template_id),
  content = VALUES(content),
  status = VALUES(status),
  updated_at = NOW();

-- Template for welcome message after registration (with login credentials)
INSERT INTO sms_templates (slug, template_id, content, status, created_at, updated_at)
VALUES (
  'create_user',
  'WELCOME001',
  'Welcome {NAME}! Your account has been created successfully. Mobile: {MOBILE}, Password: {PASSWORD}, PIN: {PIN}. Please login and change your password immediately.',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  template_id = VALUES(template_id),
  content = VALUES(content),
  status = VALUES(status),
  updated_at = NOW();

-- Template for password reset OTP
INSERT INTO sms_templates (slug, template_id, content, status, created_at, updated_at)
VALUES (
  'reset_password',
  'RESET001',
  'Hi {NAME}, your password reset OTP is {OTP}. This OTP is valid for 10 minutes. If you did not request this, please ignore.',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  template_id = VALUES(template_id),
  content = VALUES(content),
  status = VALUES(status),
  updated_at = NOW();

-- Template for new password after reset
INSERT INTO sms_templates (slug, template_id, content, status, created_at, updated_at)
VALUES (
  'new_password',
  'NEWPWD001',
  'Hi {NAME}, your new password is {PASSWORD}. Please login and change it immediately for security.',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  template_id = VALUES(template_id),
  content = VALUES(content),
  status = VALUES(status),
  updated_at = NOW();

-- Template for PIN generation
INSERT INTO sms_templates (slug, template_id, content, status, created_at, updated_at)
VALUES (
  'generate_pin',
  'PIN001',
  'Hi {NAME}, your new PIN is {PIN}. Please keep it secure and do not share with anyone.',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  template_id = VALUES(template_id),
  content = VALUES(content),
  status = VALUES(status),
  updated_at = NOW();

-- Verify the templates were inserted
SELECT id, slug, template_id, LEFT(content, 50) as content_preview, status 
FROM sms_templates 
ORDER BY id;
