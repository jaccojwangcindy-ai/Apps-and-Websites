import { supabase } from './supabase';
import { Activity } from '@/types/database';

export class ActivityService {
  static async recordActivity(
    userId: string,
    steps: number,
    distance: number,
    calories: number
  ): Promise<Activity | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('activities')
      .upsert(
        {
          user_id: userId,
          activity_date: today,
          steps,
          distance,
          calories,
        },
        {
          onConflict: 'user_id,activity_date',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error recording activity:', error);
      return null;
    }

    await this.updateProfileTotals(userId, steps, distance, calories);

    return data;
  }

  private static async updateProfileTotals(
    userId: string,
    steps: number,
    distance: number,
    calories: number
  ): Promise<void> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_steps, total_distance, total_calories')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) return;

    await supabase
      .from('profiles')
      .update({
        total_steps: profile.total_steps + steps,
        total_distance: profile.total_distance + distance,
        total_calories: profile.total_calories + calories,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  static async getTodayActivity(userId: string): Promise<Activity | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching today activity:', error);
      return null;
    }

    return data;
  }

  static async getRecentActivities(userId: string, limit: number = 7): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return data || [];
  }

  static async updateStreak(userId: string): Promise<void> {
    const activities = await this.getRecentActivities(userId, 365);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = new Set(
      activities.map(a => new Date(a.activity_date).getTime())
    );

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      if (activityDates.has(checkDate.getTime())) {
        tempStreak++;
        if (i === 0 || i === 1) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('longest_streak')
      .eq('id', userId)
      .maybeSingle();

    await supabase
      .from('profiles')
      .update({
        current_streak: currentStreak,
        longest_streak: Math.max(longestStreak, profile?.longest_streak || 0),
      })
      .eq('id', userId);
  }
}
