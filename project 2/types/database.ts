export interface Profile {
  id: string;
  display_name: string;
  total_steps: number;
  total_distance: number;
  total_calories: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  activity_date: string;
  steps: number;
  distance: number;
  calories: number;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'steps' | 'streak' | 'distance' | 'calories' | 'lifetime';
  criteria_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress: number;
  badge?: Badge;
}

export interface Goal {
  id: string;
  user_id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  status: 'active' | 'completed' | 'abandoned';
  deadline: string | null;
  created_at: string;
  completed_at: string | null;
}
