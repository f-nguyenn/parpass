import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';
import { useEffect, useState } from 'react';
import { getMemberCluster, getClusterRecommendations, ClusterInfo, RecommendedCourse } from '../../lib/api';

// Cluster icons and colors
const CLUSTER_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  'Budget Conscious': { icon: 'wallet-outline', color: '#059669', bgColor: '#ecfdf5' },
  'Premium Seeker': { icon: 'diamond-outline', color: '#7c3aed', bgColor: '#f5f3ff' },
  'Ambitious Improver': { icon: 'trending-up', color: '#2563eb', bgColor: '#eff6ff' },
  'Course Explorer': { icon: 'compass-outline', color: '#ea580c', bgColor: '#fff7ed' },
  'Casual Social': { icon: 'people-outline', color: '#db2777', bgColor: '#fdf2f8' },
};

export default function HomeScreen() {
  const { member, usage } = useAuth();
  const [cluster, setCluster] = useState<ClusterInfo | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (member) {
      loadClusterData();
    }
  }, [member]);

  const loadClusterData = async () => {
    if (!member) return;
    try {
      setLoading(true);
      const [clusterData, recsData] = await Promise.all([
        getMemberCluster(member.id),
        getClusterRecommendations(member.id, 3),
      ]);
      setCluster(clusterData);
      setRecommendations(recsData?.recommendations || []);
    } catch (error) {
      console.error('Error loading cluster data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!member || !usage) {
    return null;
  }

  const roundsRemaining = member.monthly_rounds - usage.rounds_used;
  const clusterStyle = cluster ? CLUSTER_CONFIG[cluster.clusterName] || CLUSTER_CONFIG['Casual Social'] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{member.first_name}!</Text>
        <View style={styles.tierBadge}>
          <Text style={[
            styles.tierText,
            member.tier === 'premium' ? styles.tierPremium : styles.tierCore
          ]}>
            {member.tier.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Usage Card */}
      <View style={styles.usageCard}>
        <Text style={styles.usageLabel}>Rounds This Month</Text>
        <View style={styles.usageNumbers}>
          <Text style={styles.usageUsed}>{usage.rounds_used}</Text>
          <Text style={styles.usageDivider}>/</Text>
          <Text style={styles.usageTotal}>{member.monthly_rounds}</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min((usage.rounds_used / member.monthly_rounds) * 100, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.usageRemaining}>
          {roundsRemaining} rounds remaining
        </Text>
      </View>

      {/* Player Profile Card */}
      {cluster && clusterStyle && (
        <View style={styles.clusterCard}>
          <View style={styles.clusterHeader}>
            <View style={[styles.clusterIcon, { backgroundColor: clusterStyle.bgColor }]}>
              <Ionicons name={clusterStyle.icon} size={24} color={clusterStyle.color} />
            </View>
            <View style={styles.clusterInfo}>
              <Text style={styles.clusterLabel}>Your Player Profile</Text>
              <Text style={[styles.clusterName, { color: clusterStyle.color }]}>
                {cluster.clusterName}
              </Text>
            </View>
          </View>
          <Text style={styles.clusterDescription}>{cluster.description}</Text>
        </View>
      )}

      {/* Recommended For You */}
      {recommendations.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/courses')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recsContainer}
          >
            {recommendations.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.recCard}
                onPress={() => router.push(`/course/${course.id}`)}
              >
                <View style={styles.recHeader}>
                  <Text style={styles.recName} numberOfLines={1}>{course.name}</Text>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(course.difficulty) }
                  ]}>
                    <Text style={styles.difficultyText}>{course.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.recLocation}>{course.city}, {course.state}</Text>
                <View style={styles.recReason}>
                  <Ionicons name="sparkles" size={14} color="#10b981" />
                  <Text style={styles.recReasonText}>{course.reason}</Text>
                </View>
                {course.course_rating && (
                  <View style={styles.recStats}>
                    <Text style={styles.recStat}>Rating: {course.course_rating}</Text>
                    <Text style={styles.recStat}>Slope: {course.slope_rating}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/courses')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="golf" size={24} color="#10b981" />
          </View>
          <Text style={styles.actionTitle}>Find Course</Text>
          <Text style={styles.actionSubtitle}>Browse available courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/history')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="time" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.actionTitle}>View History</Text>
          <Text style={styles.actionSubtitle}>See past rounds</Text>
        </TouchableOpacity>
      </View>

      {/* Member Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Code</Text>
          <Text style={styles.infoValue}>{member.parpass_code}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Health Plan</Text>
          <Text style={styles.infoValue}>{member.health_plan_name}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '#dcfce7';
    case 'moderate': return '#fef3c7';
    case 'challenging': return '#fed7aa';
    case 'expert': return '#fecaca';
    default: return '#e5e7eb';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  tierBadge: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  tierText: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  tierCore: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
  },
  tierPremium: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  usageLabel: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  usageNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  usageUsed: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
  },
  usageDivider: {
    fontSize: 32,
    color: '#d1d5db',
    marginHorizontal: 4,
  },
  usageTotal: {
    fontSize: 32,
    color: '#9ca3af',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  usageRemaining: {
    color: '#6b7280',
    fontSize: 14,
  },
  clusterCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  clusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clusterIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clusterInfo: {
    flex: 1,
  },
  clusterLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  clusterName: {
    fontSize: 18,
    fontWeight: '700',
  },
  clusterDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  recsContainer: {
    paddingBottom: 8,
    gap: 12,
  },
  recCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 280,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  recName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  recLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  recReason: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  recReasonText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 6,
    fontWeight: '500',
  },
  recStats: {
    flexDirection: 'row',
    gap: 12,
  },
  recStat: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  infoValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
});
