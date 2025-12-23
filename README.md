# Payshati Backend - NestJS

This is the NestJS backend for the Payshati recharge platform, migrated from Laravel.

## Features

- User authentication with OTP support
- Wallet management (add money, transfers)
- Mobile recharge processing with backup API fallback
- Multi-level commission system
- Third-party API integration with dynamic routing
- Admin panel APIs

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run migrations (if needed):
```bash
npm run migration:run
```

4. Start the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/v1/login` - User login
- `POST /api/v1/login-otp` - Login with OTP verification
- `POST /api/v1/create-account` - Register new user
- `POST /api/v1/create-account-otp` - Verify registration OTP

### Wallet
- `POST /api/v1/instant-add-money` - Add money to wallet
- `POST /api/v1/fund-transfer` - Transfer funds between users

### Recharge
- `POST /api/v1/run-recharge-api` - Process mobile recharge
- `POST /api/v1/recharge-reciept` - Get recharge receipt
- `POST /api/v1/check-number` - Check mobile number operator

### Admin
- `POST /api/admin/system/apis/list` - List all APIs
- `POST /api/admin/system/apis/get` - Get API details
- `POST /api/admin/system/apis/update` - Update API configuration
- `POST /api/admin/system/apis/delete` - Delete API

## Database

The application uses MySQL/MariaDB with TypeORM. Make sure your database is set up and configured in `.env`.

## Architecture

- **Modules**: Feature-based modules (auth, wallet, recharge, etc.)
- **Entities**: TypeORM entities matching Laravel database structure
- **Services**: Business logic services
- **Guards**: Authentication guards (AppUserGuard, ApiPartnerGuard, AdminGuard)
- **Helpers**: Shared utility functions

## Migration Notes

This backend maintains API compatibility with the Laravel version:
- Same request/response formats
- Same authentication mechanism (login_key)
- Same database structure
- Same business logic flow