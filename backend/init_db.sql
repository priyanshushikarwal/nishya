-- Initialize auth schema for local compatibility
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT null::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  SELECT '{}'::jsonb;
$$ LANGUAGE sql STABLE;
