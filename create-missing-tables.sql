-- First, update user_profiles to match schema
ALTER TABLE "user_profiles" 
ADD COLUMN IF NOT EXISTS "id" TEXT,
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "handicap" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create missing tables
CREATE TABLE IF NOT EXISTS "rounds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalScore" INTEGER NOT NULL,
    "totalPar" INTEGER NOT NULL DEFAULT 72,
    "weather" TEXT,
    "notes" TEXT,
    "withFriends" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "scores" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hole" INTEGER NOT NULL,
    "strokes" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "putts" INTEGER,
    "fairway" BOOLEAN,
    "gir" BOOLEAN,
    "notes" TEXT,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "friendships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "friend_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "friend_invites" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "friend_invites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "round_friends" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "friendUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "round_friends_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to courses table
ALTER TABLE "courses" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "externalId" TEXT,
ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_email_key" ON "user_profiles"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "scores_roundId_hole_key" ON "scores"("roundId", "hole");
CREATE UNIQUE INDEX IF NOT EXISTS "friendships_userId_friendId_key" ON "friendships"("userId", "friendId");
CREATE UNIQUE INDEX IF NOT EXISTS "friend_invites_token_key" ON "friend_invites"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "round_friends_roundId_friendUserId_key" ON "round_friends"("roundId", "friendUserId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "courses_externalId_externalSource_idx" ON "courses"("externalId", "externalSource");
CREATE INDEX IF NOT EXISTS "rounds_userId_date_idx" ON "rounds"("userId", "date" DESC);
CREATE INDEX IF NOT EXISTS "scores_roundId_idx" ON "scores"("roundId");
CREATE INDEX IF NOT EXISTS "scores_userId_idx" ON "scores"("userId");
CREATE INDEX IF NOT EXISTS "friendships_userId_idx" ON "friendships"("userId");
CREATE INDEX IF NOT EXISTS "friendships_friendId_idx" ON "friendships"("friendId");
CREATE INDEX IF NOT EXISTS "friend_activities_userId_createdAt_idx" ON "friend_activities"("userId", "createdAt" DESC);

-- Add foreign key constraints (drop first if exists, then add)
DO $$ 
BEGIN
    -- rounds constraints
    BEGIN
        ALTER TABLE "rounds" ADD CONSTRAINT "rounds_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE "rounds" ADD CONSTRAINT "rounds_courseId_fkey" 
            FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- scores constraints
    BEGIN
        ALTER TABLE "scores" ADD CONSTRAINT "scores_roundId_fkey" 
            FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE "scores" ADD CONSTRAINT "scores_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- friendships constraints
    BEGIN
        ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friendId_fkey" 
            FOREIGN KEY ("friendId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- friend_activities constraints
    BEGIN
        ALTER TABLE "friend_activities" ADD CONSTRAINT "friend_activities_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- friend_invites constraints
    BEGIN
        ALTER TABLE "friend_invites" ADD CONSTRAINT "friend_invites_inviterId_fkey" 
            FOREIGN KEY ("inviterId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- round_friends constraints
    BEGIN
        ALTER TABLE "round_friends" ADD CONSTRAINT "round_friends_roundId_fkey" 
            FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE "round_friends" ADD CONSTRAINT "round_friends_friendUserId_fkey" 
            FOREIGN KEY ("friendUserId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;
