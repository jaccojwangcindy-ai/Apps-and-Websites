import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BadgeCard } from '@/components/BadgeCard';
import { Badge, UserBadge } from '@/types/database';

export default function BadgesScreen() {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBadges();
    }
  }, [user]);

  const loadBadges = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [badgesData, userBadgesData] = await Promise.all([
        supabase.from('badges').select('*').order('criteria_value'),
        supabase
          .from('user_badges')
          .select('*, badge:badges(*)')
          .eq('user_id', user.id),
      ]);

      if (badgesData.data) setAllBadges(badgesData.data);
      if (userBadgesData.data) setUserBadges(userBadgesData.data);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  const filteredBadges = allBadges.filter((badge) => {
    if (filter === 'all') return true;
    if (filter === 'earned') return earnedBadgeIds.has(badge.id);
    if (filter === 'locked') return !earnedBadgeIds.has(badge.id);
    return badge.category === filter;
  });

  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;
  const earnedPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Badges</Text>
        <Text style={styles.headerSubtitle}>
          {earnedCount} of {totalCount} earned ({earnedPercentage.toFixed(0)}%)
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {[
          { key: 'all', label: 'All' },
          { key: 'earned', label: 'Earned' },
          { key: 'locked', label: 'Locked' },
          { key: 'steps', label: 'Steps' },
          { key: 'streak', label: 'Streak' },
          { key: 'distance', label: 'Distance' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === item.key && styles.filterButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeList}>
          {filteredBadges.map((badge) => {
            const userBadge = userBadges.find((ub) => ub.badge_id === badge.id);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={!!userBadge}
                earnedAt={userBadge?.earned_at}
              />
            );
          })}
        </View>

        {filteredBadges.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No badges found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  filters: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  badgeList: {
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
