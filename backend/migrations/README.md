# Migration Manager Documentation

The Migration Manager is a comprehensive PostgreSQL migration system that handles database creation, migration tracking, and execution for the hotel management system.

## Features

- ✅ **Database Creation**: Automatically checks and creates the target database if it doesn't exist
- ✅ **Migration Tracking**: Maintains a complete history of executed migrations
- ✅ **Transaction Safety**: Each migration runs in a transaction with automatic rollback on failure
- ✅ **Checksum Validation**: Prevents re-execution of changed migrations
- ✅ **Interactive Prompts**: User confirmation for database and table creation
- ✅ **Status Reporting**: Detailed status reports showing pending, executed, and failed migrations
- ✅ **CLI Interface**: Easy-to-use command-line interface

## Quick Start

### 1. Setup Environment Variables

Ensure your `.env` file contains:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_management
DB_USER=postgres
DB_PASSWORD=your_password
```

### 2. Initialize Migration System

```bash
npm run migrate init
```

This will:

- Connect to PostgreSQL
- Check if the target database exists (create if needed)
- Create the migrations tracking table

### 3. Run Migrations

```bash
npm run migrate run
```

This executes all pending migrations in order.

### 4. Check Status

```bash
npm run migrate status
```

Shows a detailed report of migration status.

## CLI Commands

### Initialize Migration Manager

```bash
npm run migrate init
```

### Run All Pending Migrations

```bash
npm run migrate run
```

### Show Migration Status

```bash
npm run migrate status
```

### Create New Migration

```bash
npm run migrate create "migration_name"
npm run migrate create "add_bookings_table"
npm run migrate create "add_user_constraints"
```

## Migration File Structure

Migration files are stored in `/migrations/` directory with the naming convention:

```
YYYYMMDDHHMMSS_description.sql
```

Example: `20250922000000_create_users_table.sql`

### Migration File Template

```sql
-- Migration: Description of what this migration does
-- Created: 2025-09-22T00:00:00.000Z
-- Description: Detailed description

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Your SQL statements here
CREATE TABLE example_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_example_name ON example_table(name);
```

## Migration Tracking Table

The system creates a `schema_migrations` table to track all migrations:

| Column            | Type         | Description                       |
| ----------------- | ------------ | --------------------------------- |
| id                | SERIAL       | Primary key                       |
| filename          | VARCHAR(255) | Migration filename                |
| checksum          | VARCHAR(64)  | SHA-256 checksum of content       |
| executed_at       | TIMESTAMP    | When migration was executed       |
| status            | VARCHAR(20)  | 'pending', 'success', or 'failed' |
| error_message     | TEXT         | Error message if failed           |
| execution_time_ms | INTEGER      | Execution time in milliseconds    |

## Best Practices

### 1. Migration Content

- Always use transactions (automatic in our system)
- Include rollback instructions as comments
- Use descriptive names for tables and columns
- Add proper indexes for performance
- Include constraints and validations

### 2. Naming Conventions

- Use snake_case for table and column names
- Use descriptive migration names
- Include timestamps in filename (automatic)

### 3. Testing

- Test migrations on development database first
- Test with actual production data volume
- Always have backup before running in production

### 4. Schema Changes

- Add new columns as nullable first, then update data, then add NOT NULL constraint
- Use separate migrations for data changes and schema changes
- Consider backward compatibility

## Error Handling

### Failed Migrations

- Failed migrations are automatically rolled back
- Error details are stored in the migrations table
- Fix the issue and re-run migrations

### Changed Migration Files

- If a migration file changes after execution, it won't be re-run
- A warning will be displayed about checksum mismatch
- Create a new migration file for additional changes

## Production Deployment

### Pre-deployment Checklist

1. Test all migrations on staging environment
2. Backup production database
3. Review migration execution plan
4. Ensure database connection limits are sufficient
5. Schedule maintenance window if needed

### Deployment Steps

1. Deploy application code (without starting)
2. Run migrations: `npm run migrate run`
3. Verify migration status: `npm run migrate status`
4. Start application

## Troubleshooting

### Database Connection Issues

- Verify environment variables
- Check PostgreSQL service status
- Confirm user permissions
- Test connection with psql

### Migration Failures

- Check error message in migrations table
- Review migration SQL syntax
- Ensure proper permissions for DDL operations
- Check for naming conflicts

### Performance Issues

- Add indexes in separate migrations
- Consider execution order for large data changes
- Monitor migration execution time
- Test with production data volume

## Example Workflow

```bash
# 1. Initialize (first time only)
npm run migrate init

# 2. Create a new migration
npm run migrate create "add_bookings_table"

# 3. Edit the migration file
# (edit migrations/YYYYMMDDHHMMSS_add_bookings_table.sql)

# 4. Run migrations
npm run migrate run

# 5. Check status
npm run migrate status
```

## Migration Examples

See the `/migrations/` directory for example migrations:

- `20250922000000_create_users_table.sql` - Users table with roles and constraints
- `20250922000100_create_rooms_table.sql` - Rooms table with enums and sample data

## Support

For issues or questions about the migration system:

1. Check this documentation
2. Review error messages in the migrations table
3. Test on development environment first
4. Create detailed issue reports with error logs
