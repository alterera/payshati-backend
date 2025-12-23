# Quick Setup Guide

## 1. Create/Update .env File

Create or edit the `.env` file in the `payshati-backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
DB_DATABASE=payshati_db

# Application Configuration
PORT=3000
NODE_ENV=development

# Admin Host
ADMIN_HOST=http://localhost:3000/admin

# JWT Configuration (Optional)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**Replace `your_mysql_password_here` with your actual MySQL password.**

## 2. Database Setup

### Option 1: Use Existing Laravel Database

If you want to use the same database as Laravel:

1. Check Laravel's `.env` file for database credentials:
   ```bash
   cd ../laravel-backend
   cat .env | grep DB_
   ```

2. Copy those values to your NestJS `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=your_laravel_db_user
   DB_PASSWORD=your_laravel_db_password
   DB_DATABASE=your_laravel_db_name
   ```

### Option 2: Create New Database

1. Connect to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Create database:
   ```sql
   CREATE DATABASE payshati_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

3. Update `.env` with your MySQL credentials

## 3. Install Dependencies

```bash
cd payshati-backend
npm install
```

## 4. Start the Application

```bash
npm run start:dev
```

The application will:
- Connect to your database
- Automatically create/update tables (in development mode)
- Start on http://localhost:3000

## 5. Verify Setup

Check the console output for:
- ✅ Database connection successful
- ✅ Application running on port 3000
- ❌ Any error messages

## Troubleshooting

**Database connection error?**
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env`
- Ensure database exists

**Port already in use?**
- Change `PORT=3001` in `.env`
- Or stop the process using port 3000

**Tables not created?**
- Ensure `NODE_ENV=development` in `.env`
- Check database user has CREATE permissions
