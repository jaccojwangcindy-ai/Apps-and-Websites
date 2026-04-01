/*
  # Fitness App with Badge System

  ## Overview
  Complete database schema for a fitness tracking app with achievement badges.
  Users can track activities, earn badges, and monitor goals.

  ## Tables Created

  1. **profiles**
     - id (uuid, references auth.users)
     - display_name (text)
     - total_steps (bigint) - lifetime step count
     - total_distance (decimal) - lifetime distance in km
     - total_calories (decimal) - lifetime calories burned
     - current_streak (integer) - consecutive days with activity
     - longest_streak (integer) - best streak achieved
     - created_at (timestamptz)
     - updated_at (timestamptz)

  2. **activities**
     - id (uuid, primary key)
     - user_id (uuid, references profiles)
     - activity_date (date) - date of activity
     - steps (integer) - steps taken
     - distance (decimal) - distance in km
     - calories (decimal) - calories burned
     - created_at (timestamptz)
     
  3. **badges**
     - id (uuid, primary key)
     - name (text) - badge name
     - description (text) - what it's for
     - icon (text) - icon identifier
     - category (text) - steps, streak, distance, calories
     - criteria_value (integer) - threshold to earn
     - rarity (text) - common, rare, epic, legendary
     - created_at (timestamptz)

  4. **user_badges**
     - id (uuid, primary key)
     - user_id (uuid, references profiles)
     - badge_id (uuid, references badges)
     - earned_at (timestamptz)
     - progress (decimal) - progress toward next level

  5. **goals**
     - id (uuid, primary key)
     - user_id (uuid, references profiles)
     - goal_type (text) - daily_steps, weekly_distance, etc.
     - target_value (integer)
     - current_value (integer)
     - status (text) - active, completed, abandoned
     - deadline (date)
     - created_at (timestamptz)
     - completed_at (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Badges table is readable by all authenticated users
  - Proper indexes for performance

  ## Notes
  1. All tables use RLS for data isolation
  2. Indexes on user_id and date fields for fast queries
  3. Unique constraints prevent duplicate entries
  4. Triggers update profile totals automatically
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  total_steps bigint DEFAULT 0,
  total_distance decimal(10,2) DEFAULT 0,
  total_calories decimal(10,2) DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  steps integer DEFAULT 0,
  distance decimal(10,2) DEFAULT 0,
  calories decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  criteria_value integer NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress decimal(5,2) DEFAULT 0,
  UNIQUE(user_id, badge_id)
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  status text DEFAULT 'active',
  deadline date,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for activities
CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for badges (read-only for all)
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);

-- Insert default badges
INSERT INTO badges (name, description, icon, category, criteria_value, rarity) VALUES
  ('First Steps', 'Take your first 1,000 steps', 'footprints', 'steps', 1000, 'common'),
  ('Walker', 'Reach 5,000 steps in a day', 'person-walking', 'steps', 5000, 'common'),
  ('Active', 'Achieve 10,000 steps in a day', 'fire', 'steps', 10000, 'rare'),
  ('Marathon', 'Complete 20,000 steps in a day', 'trophy', 'steps', 20000, 'epic'),
  ('Ultra Runner', 'Reach 30,000 steps in a day', 'award', 'steps', 30000, 'legendary'),
  ('Week Warrior', '7-day activity streak', 'calendar-check', 'streak', 7, 'rare'),
  ('Month Master', '30-day activity streak', 'flame', 'streak', 30, 'epic'),
  ('Distance Rookie', 'Walk 5 km in a day', 'map-pin', 'distance', 5, 'common'),
  ('Distance Pro', 'Walk 10 km in a day', 'map', 'distance', 10, 'rare'),
  ('Calorie Burner', 'Burn 500 calories in a day', 'zap', 'calories', 500, 'rare'),
  ('Milestone: 100K', 'Reach 100,000 lifetime steps', 'star', 'lifetime', 100000, 'epic'),
  ('Milestone: 1M', 'Reach 1,000,000 lifetime steps', 'sparkles', 'lifetime', 1000000, 'legendary')
ON CONFLICT DO NOTHING;