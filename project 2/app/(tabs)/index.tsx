import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityService } from '@/lib/activityService';
import { BadgeService } from '@/lib/badgeService';
import { StatCard } from '@/components/StatCard';
import { ProgressRing } from '@/components/ProgressRing';
import { Footprints, TrendingUp, Flame, Plus } from 'lucide-react-native';
import { Activity } from '@/types/database';

export default function HomeScreen() {
  const { user } = useAuth();
  const [todayActivity, setTodayActivity] = useState<Activity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const goalSteps = 10000;

  useEffect(() => {
    if (user) {
      loadTodayActivity();
    }
  }, [user]);

  const loadTodayActivity = async () => {
    if (!user) return;
    const activity = await ActivityService.getTodayActivity(user.id);
    setTodayActivity(activity);
  };

  const handleAddActivity = async () => {
    if (!user || !steps) return;

    setLoading(true);
    try {
      const activity = await ActivityService.recordActivity(
        user.id,
        parseInt(steps) || 0,
        parseFloat(distance) || 0,
        parseFloat(calories) || 0
      );

      if (activity) {
        setTodayActivity(activity);
        await ActivityService.updateStreak(user.id);
        const newBadges = await BadgeService.checkAndAwardBadges(user.id);

        if (newBadges.length > 0) {
          alert(`Congratulations! You earned ${newBadges.length} new badge(s)!`);
        }
      }

      setModalVisible(false);
      setSteps('');
      setDistance('');
      setCalories('');
    } catch (error) {
      console.error('Error adding activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentSteps = todayActivity?.steps || 0;
  const progress = Math.min((currentSteps / goalSteps) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Progress</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <ProgressRing
            progress={progress}
            size={200}
            color="#10B981"
            value={currentSteps.toLocaleString()}
            label="steps"
          />
          <Text style={styles.goalText}>Goal: {goalSteps.toLocaleString()} steps</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon={Footprints}
            label="Steps"
            value={currentSteps.toLocaleString()}
            color="#10B981"
          />
          <StatCard
            icon={TrendingUp}
            label="Distance"
            value={`${(todayActivity?.distance || 0).toFixed(1)} km`}
            color="#3B82F6"
          />
          <StatCard
            icon={Flame}
            label="Calories"
            value={Math.round(todayActivity?.calories || 0).toString()}
            color="#EF4444"
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Log Activity</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Activity</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Steps</Text>
              <TextInput
                style={styles.input}
                value={steps}
                onChangeText={setSteps}
                placeholder="Enter steps"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Distance (km)</Text>
              <TextInput
                style={styles.input}
                value={distance}
                onChangeText={setDistance}
                placeholder="Enter distance"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calories</Text>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                placeholder="Enter calories"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddActivity}
                disabled={loading || !steps}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  content: {
    flex: 1,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  goalText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
