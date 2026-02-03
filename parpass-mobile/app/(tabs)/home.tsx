import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';

export default function HomeScreen() {
  const { member, usage } = useAuth();

  if (!member || !usage) {
    return null;
  }

  const roundsRemaining = member.monthly_rounds - usage.rounds_used;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
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
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
