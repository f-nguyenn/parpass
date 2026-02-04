import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMemberCluster, ClusterInfo } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

// Cluster icons and colors matching home screen
const CLUSTER_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string; emoji: string }> = {
  'Budget Conscious': { icon: 'wallet-outline', color: '#059669', bgColor: '#ecfdf5', emoji: '💰' },
  'Premium Seeker': { icon: 'diamond-outline', color: '#7c3aed', bgColor: '#f5f3ff', emoji: '💎' },
  'Ambitious Improver': { icon: 'trending-up', color: '#2563eb', bgColor: '#eff6ff', emoji: '📈' },
  'Course Explorer': { icon: 'compass-outline', color: '#ea580c', bgColor: '#fff7ed', emoji: '🧭' },
  'Casual Social': { icon: 'people-outline', color: '#db2777', bgColor: '#fdf2f8', emoji: '🤝' },
};

export default function CompleteScreen() {
  const [cluster, setCluster] = useState<ClusterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { member } = useAuth();

  useEffect(() => {
    loadCluster();
  }, [member]);

  const loadCluster = async () => {
    if (!member) {
      setLoading(false);
      return;
    }

    try {
      const clusterData = await getMemberCluster(member.id);
      setCluster(clusterData);
    } catch (error) {
      console.error('Error loading cluster:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)/home');
  };

  const clusterStyle = cluster ? CLUSTER_CONFIG[cluster.clusterName] || CLUSTER_CONFIG['Casual Social'] : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Analyzing your profile...</Text>
          </View>
        ) : cluster && clusterStyle ? (
          <>
            <View style={styles.celebrationContainer}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
            </View>

            <Text style={styles.title}>You're all set!</Text>
            <Text style={styles.subtitle}>
              Based on your preferences, we've identified your player profile
            </Text>

            <View style={[styles.clusterCard, { borderColor: clusterStyle.color }]}>
              <View style={[styles.clusterIconContainer, { backgroundColor: clusterStyle.bgColor }]}>
                <Ionicons name={clusterStyle.icon} size={40} color={clusterStyle.color} />
              </View>
              <Text style={styles.clusterLabel}>Your Player Profile</Text>
              <Text style={[styles.clusterName, { color: clusterStyle.color }]}>
                {cluster.clusterName}
              </Text>
              <Text style={styles.clusterDescription}>{cluster.description}</Text>
            </View>

            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>What this means for you</Text>
              <View style={styles.benefitRow}>
                <Ionicons name="sparkles" size={18} color="#10b981" />
                <Text style={styles.benefitText}>Personalized course recommendations</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="people" size={18} color="#10b981" />
                <Text style={styles.benefitText}>Connect with similar golfers</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="golf" size={18} color="#10b981" />
                <Text style={styles.benefitText}>Courses matched to your style</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.celebrationContainer}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
            </View>
            <Text style={styles.title}>You're all set!</Text>
            <Text style={styles.subtitle}>
              Start exploring courses and track your rounds
            </Text>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Start Exploring</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  celebrationContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  clusterCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  clusterIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  clusterLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  clusterName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  clusterDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
