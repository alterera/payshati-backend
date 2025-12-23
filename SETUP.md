# Database and Environment Setup Guide

## Step 1: Create Environment File

1. Copy the example environment file:
```bash
cd payshati-backend
cp .env.example .env
```

2. Edit the `.env` file with your database credentials:
```bash
# Open .env in your editor
nano .env
# or
code .env
```

## Step 2: Database Setup Options

### Option A: Use Existing Laravel Database (Recommended)

If you want to use the same database as your Laravel backend:

1. Check your Laravel `.env` file to get database credentials:
```bash
cd ../laravel-backend
cat .env | grep DB_
```

2. Update your NestJS `.env` file with the same credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_laravel_db_user
DB_PASSWORD=your_laravel_db_password
DB_DATABASE=your_laravel_db_name
```

### Option B: Create New Database

1. Connect to MySQL:
```bash
mysql -u root -p
```

2. Create a new database:
```sql
CREATE DATABASE payshati_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. If you want to copy data from Laravel database:
```sql
-- Option 1: Copy entire database
CREATE DATABASE payshati_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE payshati_db;
SOURCE /path/to/laravel_backup.sql;

-- Option 2: Copy specific tables
CREATE DATABASE payshati_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE payshati_db;
-- Then import tables from Laravel database
```

4. Update `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=payshati_db
```

## Step 3: Database Migration

The application uses TypeORM with `synchronize: true` in development mode, which will automatically create/update tables based on your entities.

**Important Notes:**
- In **development** (`NODE_ENV=development`), TypeORM will automatically sync your database schema
- In **production**, set `NODE_ENV=production` and use migrations instead

### For Development (Auto-sync):
```bash
# Just start the application - tables will be created automatically
npm run start:dev
```

### For Production (Manual Migrations):
1. Disable auto-sync in `database.config.ts`:
```typescript
synchronize: false, // Never use true in production!
```

2. Create migrations:
```bash
npm run typeorm migration:generate -- -n InitialMigration
```

3. Run migrations:
```bash
npm run typeorm migration:run
```

## Step 4: Verify Database Connection

1. Start the application:
```bash
npm run start:dev
```

2. Check the console output - you should see:
```
Application is running on: http://localhost:3000
```

3. If there are database connection errors, check:
   - Database server is running
   - Credentials in `.env` are correct
   - Database exists
   - User has proper permissions

## Step 5: Test Database Connection

You can test the connection by making a simple API call:

```bash
# Test health endpoint (if available)
curl http://localhost:3000/api/v1/home
```

## Common Issues and Solutions

### Issue: "Access denied for user"
**Solution:** Check database username and password in `.env`

### Issue: "Unknown database"
**Solution:** Create the database first (see Option B above)

### Issue: "Connection refused"
**Solution:** 
- Check if MySQL is running: `sudo service mysql status` (Linux) or `brew services list` (Mac)
- Verify DB_HOST and DB_PORT in `.env`

### Issue: "Table doesn't exist"
**Solution:** 
- In development, ensure `NODE_ENV=development` so synchronize works
- Or manually create tables from Laravel database

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | Database host | localhost | Yes |
| `DB_PORT` | Database port | 3306 | Yes |
| `DB_USERNAME` | Database username | root | Yes |
| `DB_PASSWORD` | Database password | (empty) | Yes |
| `DB_DATABASE` | Database name | payshati_db | Yes |
| `PORT` | Application port | 3000 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `ADMIN_HOST` | Admin panel URL | http://localhost:3000/admin | No |

## Next Steps

After setting up the database:

1. Install dependencies (if not done):
```bash
npm install
```

2. Start the development server:
```bash
npm run start:dev
```

3. Test the API endpoints:
```bash
# Login endpoint
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"1234567890","password":"password123"}'
```

## Production Setup

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Disable `synchronize` in database config
3. Use proper database migrations
4. Set secure `JWT_SECRET`
5. Use environment-specific database credentials
6. Enable SSL for database connections if needed
