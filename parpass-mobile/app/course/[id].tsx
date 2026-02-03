import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCourse, checkIn, Course } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const { member, usage, refreshUsage } = useAuth();

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await getCourse(id!);
      setCourse(data);
    } catch (err) {
      console.error('Failed to load course:', err);
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const canAccess = () => {
    if (!member || !course) return false;
    if (member.tier === 'premium') return true;
    return course.tier_required === 'core';
  };

  const handleCheckIn = async (holes: number) => {
    if (!member || !course) return;

    setCheckingIn(true);
    try {
      await checkIn(member.id, course.id, holes);
      await refreshUsage();
      Alert.alert(
        'Check-in Successful! ⛳',
        `You've checked in for ${holes} holes at ${course.name}. Enjoy your round!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Check-in Failed', err.message || 'Please try again later.');
    } finally {
      setCheckingIn(false);
    }
  };

  const confirmCheckIn = (holes: number) => {
    Alert.alert(
      'Confirm Check-in',
      `Check in for ${holes} holes at ${course?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Check In', onPress: () => handleCheckIn(holes) },
      ]
    );
  };

  const openMaps = () => {
    if (!course) return;
    const url = `maps://?q=${encodeURIComponent(course.name)}&ll=${course.latitude},${course.longitude}`;
    Linking.openURL(url);
  };

  const callCourse = () => {
    if (!course?.phone) return;
    Linking.openURL(`tel:${course.phone}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Course not found</Text>
      </View>
    );
  }

  const accessible = canAccess();
  const roundsRemaining = member ? member.monthly_rounds - (usage?.rounds_used || 0) : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.courseName}>{course.name}</Text>
        <Text style={styles.location}>{course.city}, {course.state}</Text>

        <View style={styles.badges}>
          <View
            style={[
              styles.tierBadge,
              course.tier_required === 'premium' ? styles.tierPremium : styles.tierCore,
            ]}
          >
            <Text
              style={[
                styles.tierText,
                course.tier_required === 'premium' ? styles.tierPremiumText : styles.tierCoreText,
              ]}
            >
              {course.tier_required.toUpperCase()}
            </Text>
          </View>
          <View style={styles.holesBadge}>
            <Text style={styles.holesText}>{course.holes} holes</Text>
          </View>
        </View>

        {course.average_rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.ratingValue}>{course.average_rating}</Text>
            <Text style={styles.reviewCount}>({course.review_count} reviews)</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={openMaps}>
          <Ionicons name="navigate" size={24} color="#10b981" />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={callCourse}>
          <Ionicons name="call" size={24} color="#10b981" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
      </View>

      {/* Check-in Section */}
      <View style={styles.checkInSection}>
        <Text style={styles.sectionTitle}>Check In</Text>

        {!accessible ? (
          <View style={styles.lockedCard}>
            <Ionicons name="lock-closed" size={32} color="#9ca3af" />
            <Text style={styles.lockedTitle}>Premium Course</Text>
            <Text style={styles.lockedText}>
              Upgrade to premium to access this course
            </Text>
          </View>
        ) : roundsRemaining <= 0 ? (
          <View style={styles.lockedCard}>
            <Ionicons name="alert-circle" size={32} color="#f59e0b" />
            <Text style={styles.lockedTitle}>No Rounds Remaining</Text>
            <Text style={styles.lockedText}>
              You've used all your rounds for this month
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.roundsInfo}>
              You have {roundsRemaining} rounds remaining this month
            </Text>
            <View style={styles.checkInButtons}>
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={() => confirmCheckIn(9)}
                disabled={checkingIn}
              >
                {checkingIn ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.checkInButtonNumber}>9</Text>
                    <Text style={styles.checkInButtonLabel}>holes</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkInButton, styles.checkInButtonPrimary]}
                onPress={() => confirmCheckIn(18)}
                disabled={checkingIn}
              >
                {checkingIn ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.checkInButtonNumber}>18</Text>
                    <Text style={styles.checkInButtonLabel}>holes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Course Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Course Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{course.city}, {course.state} {course.zip}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{course.phone}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Holes</Text>
            <Text style={styles.infoValue}>{course.holes}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  courseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tierCore: {
    backgroundColor: '#ecfdf5',
  },
  tierPremium: {
    backgroundColor: '#faf5ff',
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tierCoreText: {
    color: '#059669',
  },
  tierPremiumText: {
    color: '#9333ea',
  },
  holesBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  holesText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#9ca3af',
  },
  actionsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  checkInSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  roundsInfo: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
  },
  checkInButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  checkInButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  checkInButtonPrimary: {
    backgroundColor: '#10b981',
  },
  checkInButtonNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  checkInButtonLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  lockedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  lockedText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  infoSection: {
    padding: 20,
    paddingTop: 0,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  infoValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});
