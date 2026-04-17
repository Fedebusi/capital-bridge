-- P0-critical: fix "login succeeds but platform never loads" bug.
--
-- Root cause: if the auth trigger `handle_new_user` fails silently (its
-- EXCEPTION WHEN OTHERS handler swallows everything), the auth.users row is
-- created but the public.profiles row is not. On next login the frontend's
-- fetchProfile returns zero rows, profile stays null forever, ProtectedRoute
-- spins forever.
--
-- This migration makes the frontend self-healing without needing the trigger:
--
-- 1. Backfill any auth.users missing a profile row (idempotent).
-- 2. Add `profiles_insert` RLS policy so authenticated users can create their
--    own profile — but only with role='viewer'. Admins promote from there.
-- 3. Add `ensure_my_profile()` RPC (SECURITY DEFINER) as a safety net — it
--    upserts and returns the caller's profile. Used by AuthContext when the
--    read returns zero rows.

-- ============================================================
-- 1. Backfill missing profiles
-- ============================================================

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), ''),
  CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'::user_role
       ELSE 'viewer'::user_role
  END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- ============================================================
-- 2. RLS policy: let users create their own profile as viewer
-- ============================================================

-- Drop if re-running this migration
DROP POLICY IF EXISTS profiles_insert ON public.profiles;

CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'viewer');

-- ============================================================
-- 3. ensure_my_profile() — safety net RPC
-- ============================================================

-- Returns the caller's profile, creating one (as viewer) if missing.
-- SECURITY DEFINER so it bypasses RLS for the INSERT path, but it always
-- uses auth.uid() so a caller can only affect their own row.
CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_uid UUID;
  my_email TEXT;
  my_name TEXT;
  existing public.profiles;
  first_user BOOLEAN;
BEGIN
  my_uid := auth.uid();
  IF my_uid IS NULL THEN
    RAISE EXCEPTION 'ensure_my_profile called without authenticated user';
  END IF;

  -- Fast path: already has a profile
  SELECT * INTO existing FROM public.profiles WHERE id = my_uid;
  IF FOUND THEN
    RETURN existing;
  END IF;

  -- Pull email and full_name from auth.users
  SELECT
    COALESCE(email, ''),
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), '')
  INTO my_email, my_name
  FROM auth.users
  WHERE id = my_uid;

  -- First user to land here becomes admin; everyone else viewer
  SELECT (COUNT(*) = 0) INTO first_user FROM public.profiles;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    my_uid,
    my_email,
    my_name,
    CASE WHEN first_user THEN 'admin'::user_role ELSE 'viewer'::user_role END
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING * INTO existing;

  IF existing.id IS NULL THEN
    -- race: another call inserted it concurrently
    SELECT * INTO existing FROM public.profiles WHERE id = my_uid;
  END IF;

  RETURN existing;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_my_profile() TO authenticated;
