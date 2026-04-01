import { View, Text, StyleSheet } from 'react-native';
import { Badge, UserBadge } from '@/types/database';
import {
  Footprints,
  PersonStanding,
  Flame,
  Trophy,
  Award,
  CalendarCheck,
  MapPin,
  Map,
  Zap,
  Star,
  Sparkles,
} from 'lucide-react-native';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string;
}

const iconMap: Record<string, any> = {
  'footprints': Footprints,
  'person-walking': PersonStanding,
  'fire': Flame,
  'trophy': Trophy,
  'award': Award,
  'calendar-check': CalendarCheck,
  'flame': Flame,
  'map-pin': MapPin,
  'map': Map,
  'zap': Zap,
  'star': Star,
  'sparkles': Sparkles,
};

const rarityColors: Record<string, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

export function BadgeCard({ badge, earned = false, earnedAt }: BadgeCardProps) {
  const IconComponent = iconMap[badge.icon] || Star;
  const color = rarityColors[badge.rarity];

  return (
    <View style={[styles.container, earned && styles.earned]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <IconComponent size={32} color={earned ? color : '#D1D5DB'} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, !earned && styles.locked]}>{badge.name}</Text>
        <Text style={styles.description}>{badge.description}</Text>
        <Text style={[styles.rarity, { color }]}>
          {badge.rarity.toUpperCase()}
        </Text>
      </View>
      {earned && earnedAt && (
        <View style={styles.earnedBadge}>
          <Text style={styles.earnedText}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    opacity: 0.5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  earned: {
    opacity: 1,
    borderColor: '#10B981',
    borderWidth: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locked: {
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  rarity: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  earnedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
