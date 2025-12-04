# Database Setup Guide

This directory contains SQL migration files for setting up the Supabase PostgreSQL database for the Smart Shopping List application.

## Quick Start

Execute the following SQL files **in order** using the Supabase SQL Editor:

1. **`step1-drop-everything.sql`** — Drops all existing policies, functions, and tables
2. **`step2-create-tables.sql`** — Creates the core database schema and indexes
3. **`step3-create-simple-policies.sql`** — Configures Row Level Security (RLS) policies
4. **`step4-create-functions.sql`** — Adds PostgreSQL helper functions

## Database Schema

### Tables

#### `user_profiles`
Stores extended user information linked to Supabase Auth.
- **Primary Key**: `user_id` (references `auth.users`)
- **Fields**: `email`, `display_name`, `avatar_url`, `created_at`

#### `groups`
Represents shopping groups that users can create and share.
- **Primary Key**: `group_id` (UUID)
- **Fields**: `group_name`, `owner_user_id`, `created_at`
- **Indexes**: `owner_user_id` for efficient owner lookups

#### `group_members`
Junction table managing group membership.
- **Primary Key**: Composite (`group_id`, `user_id`)
- **Fields**: `joined_at`
- **Constraints**: Unique constraint prevents duplicate memberships
- **Indexes**: Both `group_id` and `user_id` for bi-directional queries

#### `items`
Shopping list items within groups.
- **Primary Key**: `item_id` (UUID)
- **Fields**: `group_id`, `item_name`, `quantity`, `unit`, `category`, `is_completed`, `created_at`, `completed_at`, `notes`
- **Indexes**: `group_id` and `is_completed` for efficient filtering

## Security Model

### Row Level Security (RLS)

All tables are protected by RLS policies that ensure:

- **User Profiles**: Users can only view and update their own profile
- **Groups**: Owners and members can view groups; only owners can modify
- **Group Members**: Members can view membership; owners can manage invitations
- **Items**: All group members have full CRUD access to items

### Authentication

The application uses `auth.uid()` to identify the currently authenticated user and scope all database operations accordingly.

## Functions

### `create_group(p_group_name TEXT)`
Atomically creates a new group and adds the creator as the first member.
- **Returns**: `group_id` of the newly created group
- **Security**: `SECURITY DEFINER` ensures proper permissions

### `leave_group(p_group_id UUID)`
Removes the calling user from the specified group.
- **Security**: Only affects the calling user's membership
- **Note**: Group owners should transfer ownership before leaving

## Migration Notes

### Initial Setup
Run all four files in sequence for a fresh database installation.

### Reset Database
If you need to completely reset the database:
1. Run `step1-drop-everything.sql` to clear all existing data
2. Proceed with steps 2-4 to rebuild the schema

### Important Considerations
- **Data Loss Warning**: `step1-drop-everything.sql` permanently deletes all data
- **Execution Order**: Files must be run in numerical order to avoid dependency errors
- **RLS Testing**: Initial policies are permissive for development; review before production deployment

## Troubleshooting

### Common Issues

**HTTP 500 Errors on Queries**
- Ensure all RLS policies are created correctly
- Verify no circular dependencies exist between policies
- Check that `auth.uid()` returns a valid user ID

**Groups Not Appearing**
- Confirm user is a member via `group_members` table
- Verify RLS policies allow the current user to select the group
- Check that the group was created using `create_group()` function

**Items Not Saving**
- Ensure user is a member of the target group
- Verify `items` table RLS policies are active
- Check application error logs for constraint violations

## Development vs Production

The current policies are designed for **development and testing** with more permissive access. Before deploying to production:

1. Review all RLS policies for appropriate access restrictions
2. Add audit logging if required
3. Implement rate limiting at the application layer
4. Consider adding database-level constraints for data validation

## Support

For issues or questions:
- Review the main project README.md
- Check Supabase documentation: https://supabase.com/docs
- Inspect PostgreSQL logs in the Supabase dashboard
