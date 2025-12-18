-- supabase/migrations/00006_fix_handle_new_user_trigger.sql

-- Drop and recreate the handle_new_user function with proper security settings
-- The function needs SECURITY DEFINER plus explicit search_path to work properly with RLS

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
exception
  when unique_violation then
    -- Profile already exists (e.g., from OAuth linking), ignore
    return new;
  when others then
    -- Log the error but don't fail user creation
    raise warning 'handle_new_user failed: %', SQLERRM;
    return new;
end;
$$;

-- Grant execute permission to ensure the trigger can run
grant execute on function handle_new_user() to service_role;
grant execute on function handle_new_user() to postgres;

-- Ensure the function can insert into profiles by granting table permissions
grant insert on public.profiles to postgres;
grant usage on schema public to postgres;
