/*
# Create role_permissions table

1. New Tables
- `role_permissions`
  - `id` (uuid, primary key)
  - `role` (text, not null, unique) — one row per role: admin, staff, faculty, student, employee
  - `permissions` (text[], not null, default '{}') — array of permission keys enabled for that role
  - `updated_at` (timestamptz, default now())
  - `updated_by` (text, nullable) — user id of the admin who last changed permissions

2. Purpose
- Stores the configurable permission matrix for each role so that the Roles & Permissions
  admin page can persist toggle changes to the database instead of being lost on page reload.
- The app reads this table on startup to determine which pages each role can access.

3. Security
- Enable RLS on `role_permissions`.
- This app uses a custom auth flow (not Supabase Auth), so the frontend talks to Supabase
  with the anon key. Policies allow anon + authenticated to read (needed for route guards
  on every page load) and allow anon + authenticated to write (only admins reach the
  permissions page in the frontend, and the write is also gated by the app's own role check).
*/

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL UNIQUE,
  permissions text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_role_permissions" ON role_permissions;
CREATE POLICY "anon_select_role_permissions"
ON role_permissions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_role_permissions" ON role_permissions;
CREATE POLICY "anon_insert_role_permissions"
ON role_permissions FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_role_permissions" ON role_permissions;
CREATE POLICY "anon_update_role_permissions"
ON role_permissions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_role_permissions" ON role_permissions;
CREATE POLICY "anon_delete_role_permissions"
ON role_permissions FOR DELETE
TO anon, authenticated USING (true);
