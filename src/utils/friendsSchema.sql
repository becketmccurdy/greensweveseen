-- Friends system database schema
-- Run this SQL in your Supabase SQL Editor

-- Add location fields to existing golf_rounds table
ALTER TABLE golf_rounds ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE golf_rounds ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE golf_rounds ADD COLUMN IF NOT EXISTS course_address TEXT;

-- Friends/relationships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  friend_id UUID REFERENCES auth.users NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Friend invitations table
CREATE TABLE IF NOT EXISTS friend_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID REFERENCES auth.users NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared rounds (when friends play together)
CREATE TABLE IF NOT EXISTS shared_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES golf_rounds NOT NULL,
  shared_with UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, shared_with)
);

-- Enable RLS for all tables
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_rounds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships" ON friendships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for friend_invitations
CREATE POLICY "Users can view their own invitations" ON friend_invitations
  FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations" ON friend_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their own invitations" ON friend_invitations
  FOR UPDATE USING (auth.uid() = inviter_id);

-- RLS Policies for shared_rounds
CREATE POLICY "Users can view shared rounds" ON shared_rounds
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM golf_rounds WHERE id = round_id
    ) OR auth.uid() = shared_with
  );

CREATE POLICY "Users can create shared rounds for their own rounds" ON shared_rounds
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM golf_rounds WHERE id = round_id
    )
  );

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code() RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invite codes
CREATE OR REPLACE FUNCTION set_invite_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invite_code
  BEFORE INSERT ON friend_invitations
  FOR EACH ROW EXECUTE FUNCTION set_invite_code();
