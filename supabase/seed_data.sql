-- Run this in your Supabase SQL Editor to seed some dynamic messes and properties
-- It grabs the first available user ID to act as the owner so that foreign keys pass!

DO $$ 
DECLARE 
    first_user_id uuid;
BEGIN 
    -- Get the very first registered user to act as the owner
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;

    -- Only proceed if we found a user
    IF first_user_id IS NOT NULL THEN

        -- Seed 3 dynamic properties
        INSERT INTO public.properties 
        (id, owner_id, title, description, property_type, rent, deposit, address, city, state, pincode, available_rooms, verified)
        VALUES 
        ('prop-1', first_user_id, 'Sunshine PG for Boys', 'Premium PG accommodation with modern facilities.', 'pg', 8500, 17000, '45/2 Kothrud', 'Pune', 'Maharashtra', '411038', 5, false),
        ('prop-2', first_user_id, 'Elite Girls Hostel', 'Safe and secure hostel for girls.', 'hostel', 9000, 18000, 'SB Road', 'Pune', 'Maharashtra', '411016', 12, true),
        ('prop-3', first_user_id, 'Modern 2BHK Shared', 'Fully furnished shared apartment.', 'shared_room', 6500, 15000, 'Wakad', 'Pune', 'Maharashtra', '411057', 2, false)
        ON CONFLICT (id) DO NOTHING;

        -- Seed 3 dynamic messes
        INSERT INTO public.messes 
        (id, owner_id, name, description, address, city, state, contact_phone, monthly_charge, verified, status)
        VALUES 
        ('mess-1', first_user_id, 'Annapurna Mess', 'Home cooked authentic Maharashtrian food.', 'Kothrud', 'Pune', 'Maharashtra', '9876543210', 3200, false, 'open'),
        ('mess-2', first_user_id, 'Swadist Dining', 'North Indian thali system.', 'Karve Nagar', 'Pune', 'Maharashtra', '9876543211', 3500, true, 'open'),
        ('mess-3', first_user_id, 'Healthy Bites', 'Diet food and regular mess options.', 'Viman Nagar', 'Pune', 'Maharashtra', '9876543212', 4000, false, 'open')
        ON CONFLICT (id) DO NOTHING;

    END IF;
END $$;
