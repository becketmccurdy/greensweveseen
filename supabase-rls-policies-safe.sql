-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can update courses" ON courses;
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
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update courses" ON courses
  FOR UPDATE USING (auth.role() = 'authenticated');

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
  FOR SELECT USING (auth.uid()::text = "userId" OR auth.uid()::text = "friendId");

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own friendships" ON friendships
  FOR UPDATE USING (auth.uid()::text = "userId" OR auth.uid()::text = "friendId");

CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view friend activities" ON friend_activities
  FOR SELECT USING (
    auth.uid()::text = "userId" OR 
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (friendships."userId" = auth.uid()::text AND friendships."friendId" = friend_activities."userId")
      OR (friendships."friendId" = auth.uid()::text AND friendships."userId" = friend_activities."userId")
      AND friendships.status = 'ACCEPTED'
    )
  );

CREATE POLICY "Users can insert own activities" ON friend_activities
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
