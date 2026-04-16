-- First user to sign up becomes admin automatically
-- Subsequent users get 'viewer' role (existing behavior)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
  default_role TEXT;
BEGIN
  -- Count existing profiles
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  -- First user gets admin, everyone else is viewer
  IF user_count = 0 THEN
    default_role := 'admin';
  ELSE
    default_role := 'viewer';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), ''),
    default_role::user_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block signup if profile creation fails
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Re-bind trigger to ensure it's using the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
