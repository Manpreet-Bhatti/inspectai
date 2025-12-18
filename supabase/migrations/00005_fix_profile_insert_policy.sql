-- supabase/migrations/00005_fix_profile_insert_policy.sql

-- Add INSERT policy for profiles to allow the signup trigger to create profiles
-- The trigger uses security definer, but an explicit policy ensures compatibility
create policy "Service role can insert profiles"
  on profiles for insert
  with check (true);

-- Alternative: Allow users to insert their own profile (belt and suspenders approach)
-- This ensures the profile can be created whether via trigger or direct insert
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
