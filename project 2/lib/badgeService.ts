import { supabase } from './supabase';
import { Badge, UserBadge, Activity, Profile } from '@/types/database';

export class BadgeService {
  static async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const newBadges: UserBadge[] = [];

    const [profile, todayActivity, badges, earnedBadges] = await Promise.all([
      this.getProfile(userId),
      this.getTodayActivity(userId),
      this.getAllBadges(),
      this.getUserBadges(userId),
    ]);

    if (!profile || !badges) return newBadges;

    const earnedBadgeIds = new Set(earnedBadges?.map((ub) => ub.badge_id) || []);

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      const earned = this.checkBadgeCriteria(badge, profile, todayActivity);
      if (earned) {
        const userBadge = await this.awardBadge(userId, badge.id);
        if (userBadge) newBadges.push(userBadge);
      }
    }

    return newBadges;
  }

  private static checkBadgeCriteria(
    badge: Badge,
    profile: Profile,
    todayActivity: Activity | null
  ): boolean {
    switch (badge.category) {
      case 'steps':
        return (todayActivity?.steps || 0) >= badge.criteria_value;

      case 'streak':
        return profile.current_streak >= badge.criteria_value;

      case 'distance':
        return (todayActivity?.distance || 0) >= badge.criteria_value;

      case 'calories':
        return (todayActivity?.calories || 0) >= badge.criteria_value;

      case 'lifetime':
        return profile.total_steps >= badge.criteria_value;

      default:
        return false;
    }
  }

  private static async awardBadge(
    userId: string,
    badgeId: string
  ): Promise<UserBadge | null> {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error awarding badge:', error);
      return null;
    }

    return data;
  }

  private static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  private static async getTodayActivity(userId: string): Promise<Activity | null> {
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

  private static async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('criteria_value', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return data || [];
  }

  private static async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data || [];
  }

  static async getUserBadgesWithDetails(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data || [];
  }
}
