# Liquibase Migration Setup - Complete Guide

## ✅ What Was Done

### 1. Added Liquibase Dependency

**File:** `pom.xml`

```xml
<dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
</dependency>
```

### 2. Configured Liquibase

**File:** `application.yml`

```yaml
spring:
  liquibase:
    change-log: classpath:db/changelog/db.changelog-master.yaml
    enabled: true
```

**File:** `application-dev.yml`

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate # Changed from 'update' - Liquibase handles schema now
```

### 3. Created Migration Files

**Master Changelog:** `db/changelog/db.changelog-master.yaml`

- Orchestrates all migrations in order

**Migration Files:** `db/changelog/changes/`

1. `001-create-users-table.sql`
2. `002-create-roles-table.sql`
3. `003-create-permissions-table.sql`
4. `004-create-user-roles-table.sql`
5. `005-create-role-permissions-table.sql`
6. `006-create-refresh-tokens-table.sql`
7. `007-seed-permissions.sql` (9 permissions)
8. `008-seed-roles.sql` (3 roles + permission mappings)
9. `009-seed-default-admin.sql` (admin@aims.com / admin123)

### 4. Removed DataInitializer

- ❌ Deleted `DataInitializer.java` (replaced by migrations)

---

## 🚀 How to Use

### First Run

```bash
# Clean database (if needed)
# Drop all tables manually or use a fresh database

# Run the application
./mvnw spring-boot:run

# Liquibase will:
# 1. Create DATABASECHANGELOG table (tracks migrations)
# 2. Run all 9 migrations in order
# 3. Mark them as executed
```

### Subsequent Runs

- Liquibase checks `DATABASECHANGELOG`
- Only runs NEW migrations
- Skips already-executed ones

---

## 📊 Liquibase Tracking Table

Liquibase automatically creates:

**Table:** `DATABASECHANGELOG`

```
ID                  | AUTHOR | FILENAME                              | DATEEXECUTED        | ORDEREXECUTED
--------------------|--------|---------------------------------------|---------------------|---------------
001-create-users... | aims   | db/changelog/changes/001-create...   | 2024-12-09 01:00:00 | 1
002-create-roles... | aims   | db/changelog/changes/002-create...   | 2024-12-09 01:00:01 | 2
...
```

---

## 🔄 Adding New Migrations

### Example: Add new column to users table

1. **Create new migration file:**

   ```
   db/changelog/changes/010-add-phone-to-users.sql
   ```

2. **Write the migration:**

   ```sql
   --liquibase formatted sql

   --changeset aims:010-add-phone-to-users
   ALTER TABLE users ADD COLUMN phone VARCHAR(20);

   --rollback ALTER TABLE users DROP COLUMN phone;
   ```

3. **Add to master changelog:**

   ```yaml
   # db.changelog-master.yaml
   databaseChangeLog:
     - include:
         file: db/changelog/changes/010-add-phone-to-users.sql
   ```

4. **Run application:**
   - Liquibase detects new migration
   - Executes it automatically
   - Records in `DATABASECHANGELOG`

---

## 🔙 Rollback Support

Each migration has a `--rollback` comment.

### Rollback last migration:

```bash
./mvnw liquibase:rollback -Dliquibase.rollbackCount=1
```

### Rollback to specific date:

```bash
./mvnw liquibase:rollback -Dliquibase.rollbackDate=2024-12-08
```

### Rollback to specific tag:

```bash
./mvnw liquibase:rollback -Dliquibase.rollbackTag=v1.0
```

---

## 🛠️ Useful Liquibase Commands

### Generate SQL (without executing)

```bash
./mvnw liquibase:updateSQL
```

### Check pending migrations

```bash
./mvnw liquibase:status
```

### Validate changelog

```bash
./mvnw liquibase:validate
```

### Clear checksums (if you modified a migration)

```bash
./mvnw liquibase:clearCheckSums
```

---

## ⚠️ Best Practices

### ✅ DO

- **Never modify executed migrations** (create new ones instead)
- **Test migrations on dev database first**
- **Write rollback scripts** for every migration
- **Use descriptive changeset IDs**
- **Keep migrations small and focused**
- **Version control all migration files**

### ❌ DON'T

- **Don't use `ddl-auto: update`** (let Liquibase handle schema)
- **Don't delete executed migrations** (breaks history)
- **Don't skip migration numbers** (keep sequential)
- **Don't put business logic in migrations** (only schema + seed data)

---

## 🔍 Troubleshooting

### Problem: "Validation Failed: Migration checksum mismatch"

**Cause:** You modified an already-executed migration.

**Solution:**

```bash
# Option 1: Clear checksums (dev only)
./mvnw liquibase:clearCheckSums

# Option 2: Create a new migration to fix the issue
```

### Problem: "Table already exists"

**Cause:** Tables exist from old `ddl-auto: update` or manual creation.

**Solution:**

```bash
# Drop all tables and let Liquibase recreate them
# OR mark migrations as executed:
./mvnw liquibase:changelogSync
```

### Problem: Migration fails halfway

**Cause:** SQL error in migration.

**Solution:**

1. Fix the migration file
2. Manually rollback partial changes in DB
3. Delete the failed entry from `DATABASECHANGELOG`
4. Re-run

---

## 📦 Migration File Structure

```
src/main/resources/
└── db/
    └── changelog/
        ├── db.changelog-master.yaml       # Master file
        └── changes/
            ├── 001-create-users-table.sql
            ├── 002-create-roles-table.sql
            ├── 003-create-permissions-table.sql
            ├── 004-create-user-roles-table.sql
            ├── 005-create-role-permissions-table.sql
            ├── 006-create-refresh-tokens-table.sql
            ├── 007-seed-permissions.sql
            ├── 008-seed-roles.sql
            └── 009-seed-default-admin.sql
```

---

## 🎯 Current Schema State

After all migrations run, you'll have:

**Tables:**

- `users` (with indexes on email, status)
- `roles` (with index on name)
- `permissions` (with unique constraint on object+action)
- `user_roles` (join table with indexes)
- `role_permissions` (join table with indexes)
- `refresh_tokens` (with indexes on token, user_id, expires_at)

**Seed Data:**

- 9 permissions (USER, PRODUCT, ORDER, STOCK combinations)
- 3 roles (ADMIN, PRODUCT_MANAGER, CUSTOMER)
- Role-permission mappings
- 1 admin user (admin@aims.com / admin123)

---

## 🔐 Default Admin Credentials

**Email:** `admin@aims.com`  
**Password:** `admin123`  
**Role:** `ROLE_ADMIN` (all permissions)

⚠️ **Change this password immediately after first login!**

---

## 📚 Additional Resources

- [Liquibase Documentation](https://docs.liquibase.com/)
- [Spring Boot + Liquibase](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.liquibase)
- [Liquibase Best Practices](https://www.liquibase.org/get-started/best-practices)

---

## ✨ Benefits Over DataInitializer

| Feature               | DataInitializer | Liquibase              |
| --------------------- | --------------- | ---------------------- |
| Version control       | ❌              | ✅                     |
| Rollback support      | ❌              | ✅                     |
| Multi-instance safe   | ❌              | ✅ (DB locks)          |
| Migration history     | ❌              | ✅ (DATABASECHANGELOG) |
| Runs on every startup | ✅ (overhead)   | ❌ (only new)          |
| Production ready      | ❌              | ✅                     |
| Team collaboration    | ❌              | ✅                     |

---

**Your database migrations are now production-ready!** 🎉
