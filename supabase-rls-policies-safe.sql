-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_friends ENABLE ROW LEVEL SECURITY;

-- Enforce RLS at the table level
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE courses FORCE ROW LEVEL SECURITY;
ALTER TABLE rounds FORCE ROW LEVEL SECURITY;
ALTER TABLE scores FORCE ROW LEVEL SECURITY;
ALTER TABLE friendships FORCE ROW LEVEL SECURITY;
ALTER TABLE friend_activities FORCE ROW LEVEL SECURITY;
ALTER TABLE friend_invites FORCE ROW LEVEL SECURITY;
ALTER TABLE round_friends FORCE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;
DROP POLICY IF EXISTS "Users can update own courses" ON courses;
DROP POLICY IF EXISTS "Users can delete own courses" ON courses;
DROP POLICY IF EXISTS "Users can view own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can insert own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can update own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can delete own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can view own scores" ON scores;
DROP POLICY IF EXISTS "Users can insert own scores" ON scores;
DROP POLICY IF EXISTS "Users can update own scores" ON scores;
DROP POLICY IF EXISTS "Users can delete own scores" ON scores;
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can view friend activities" ON friend_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON friend_activities;
DROP POLICY IF EXISTS "Inviter can view own invites" ON friend_invites;
DROP POLICY IF EXISTS "Inviter can create invites" ON friend_invites;
DROP POLICY IF EXISTS "Inviter can update own invites" ON friend_invites;
DROP POLICY IF EXISTS "Select own or friend's round_friends" ON round_friends;
DROP POLICY IF EXISTS "Owner can insert round_friends" ON round_friends;
DROP POLICY IF EXISTS "Owner can delete round_friends" ON round_friends;

-- Create all policies fresh
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create courses" ON courses
  FOR INSERT WITH CHECK (auth.uid()::text = "createdById");

CREATE POLICY "Users can update own courses" ON courses
  FOR UPDATE USING (auth.uid()::text = "createdById");

CREATE POLICY "Users can delete own courses" ON courses
  FOR DELETE USING (auth.uid()::text = "createdById");

CREATE POLICY "Users can view own rounds" ON rounds
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own rounds" ON rounds
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own rounds" ON rounds
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own rounds" ON rounds
  FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view own scores" ON scores
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own scores" ON scores
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own scores" ON scores
  FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (
    auth.uid()::text = "userId" OR auth.uid()::text = "friendId"
  );

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own friendships" ON friendships
  FOR UPDATE USING (
    auth.uid()::text = "userId" OR auth.uid()::text = "friendId"
  );

CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view friend activities" ON friend_activities
  FOR SELECT USING (
    auth.uid()::text = "userId" OR 
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (
        (friendships."userId" = auth.uid()::text AND friendships."friendId" = friend_activities."userId")
        OR
        (friendships."friendId" = auth.uid()::text AND friendships."userId" = friend_activities."userId")
      )
      AND friendships.status = 'ACCEPTED'
    )
  );

CREATE POLICY "Users can insert own activities" ON friend_activities
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Friend Invites: Only inviter can view/insert/update
CREATE POLICY "Inviter can view own invites" ON friend_invites
  FOR SELECT USING (auth.uid()::text = "inviterId");

CREATE POLICY "Inviter can create invites" ON friend_invites
  FOR INSERT WITH CHECK (auth.uid()::text = "inviterId");

CREATE POLICY "Inviter can update own invites" ON friend_invites
  FOR UPDATE USING (auth.uid()::text = "inviterId");

-- Round Friends policies
CREATE POLICY "Select own or friend's round_friends" ON round_friends
  FOR SELECT USING (
    -- Owner of round can view
    EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_friends."roundId" AND r."userId" = auth.uid()::text
    )
    OR
    -- Friend participant can view
    round_friends."friendUserId" = auth.uid()::text
  );

CREATE POLICY "Owner can insert round_friends" ON round_friends
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_friends."roundId" AND r."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Owner can delete round_friends" ON round_friends
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = round_friends."roundId" AND r."userId" = auth.uid()::text
    )
  );
