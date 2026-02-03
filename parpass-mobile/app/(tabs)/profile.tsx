import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';

export default function ProfileScreen() {
  const { member, usage, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!member) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {member.first_name[0]}{member.last_name[0]}
          </Text>
        </View>
        <Text style={styles.name}>{member.first_name} {member.last_name}</Text>
        <Text style={styles.email}>{member.email}</Text>
        <View
          style={[
            styles.tierBadge,
            member.tier === 'premium' ? styles.tierPremium : styles.tierCore,
          ]}
        >
          <Text
            style={[
              styles.tierText,
              member.tier === 'premium' ? styles.tierPremiumText : styles.tierCoreText,
            ]}
          >
            {member.tier.toUpperCase()} MEMBER
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{usage?.rounds_used || 0}</Text>
          <Text style={styles.statLabel}>Rounds Used</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{member.monthly_rounds}</Text>
          <Text style={styles.statLabel}>Monthly Limit</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {member.monthly_rounds - (usage?.rounds_used || 0)}
          </Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {/* Account Info */}
      <Text style={styles.sectionTitle}>Account Information</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="card" size={20} color="#6b7280" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member Code</Text>
            <Text style={styles.infoValue}>{member.parpass_code}</Text>
          </View>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="shield-checkmark" size={20} color="#6b7280" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Health Plan</Text>
            <Text style={styles.infoValue}>{member.health_plan_name}</Text>
          </View>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#6b7280" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsCard}>
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push('/settings/notifications')}
        >
          <View style={styles.settingsIcon}>
            <Ionicons name="notifications" size={20} color="#6b7280" />
          </View>
          <Text style={styles.settingsLabel}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ParPass Mobile v1.0.0</Text>
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
  header: {
    alignItems: 'center',
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierCore: {
    backgroundColor: '#ecfdf5',
  },
  tierPremium: {
    backgroundColor: '#fef3c7',
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tierCoreText: {
    color: '#059669',
  },
  tierPremiumText: {
    color: '#92400e',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  statusActive: {
    color: '#10b981',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
});
