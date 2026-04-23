-- ============================================================
-- Supabase Setup SQL
-- Run these in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Set custom app_role claim in JWT (based on public.users)
--    This makes the "app_role" claim available in all JWTs
--    so the .NET API can use [Authorize(Roles = "Admin")]
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Fetch the app role from public.users
  SELECT role::text INTO user_role
  FROM public."Users"
  WHERE "Id" = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Add app_role to claims (defaults to 'Customer' if not found)
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{app_role}', '"Customer"');
  END IF;

  -- Return the modified event
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant usage to the hook
GRANT EXECUTE ON FUNCTION auth.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION auth.custom_access_token_hook FROM authenticated, anon, public;

-- Register the hook in Supabase Dashboard:
-- Authentication → Hooks → Custom Access Token → Select this function

-- ─────────────────────────────────────────────────────────────
-- 2. RLS Policies for public.Users table
--    (adjust table name casing based on your EF migration output)
-- ─────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "users_select_own"
ON public."Users"
FOR SELECT
USING (auth.uid() = "Id");

-- .NET backend (service role) bypasses RLS automatically
-- Admins can see all users
CREATE POLICY "admin_select_all"
ON public."Users"
FOR SELECT
USING (
  (SELECT "Role" FROM public."Users" WHERE "Id" = auth.uid()) = 'Admin'
);

-- ─────────────────────────────────────────────────────────────
-- 3. Promote a user to Admin manually
--    Replace with the actual user UUID from auth.users
-- ─────────────────────────────────────────────────────────────
-- UPDATE public."Users"
-- SET "Role" = 'Admin'
-- WHERE "Email" = 'admin@yourdomain.com';

-- ─────────────────────────────────────────────────────────────
-- 4. (Optional) Storage buckets
--    Create via Supabase Dashboard → Storage
--    Private bucket: private-files
--    Public bucket: public-assets
-- ─────────────────────────────────────────────────────────────
