-- Replace 'user@example.com' with the email of the user you want to delete
DELETE FROM auth.users WHERE email = 'user@example.com';

-- NOTE: If you want to delete ALL users and start fresh, you can run this instead:
-- DELETE FROM auth.users;
